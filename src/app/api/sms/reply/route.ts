import { NextResponse } from 'next/server';
import { db } from '@/db';
import { appointments, clients, tasks, reviews } from '@/db/schema';
import { eq, and, gte, asc, desc, sql, inArray } from 'drizzle-orm';
import crypto from 'crypto';
import { logger } from '@/lib/logger';

function validateTwilioSignature(authToken: string, url: string, params: Record<string, string>, signature: string): boolean {
  const sortedKeys = Object.keys(params).sort();
  let dataString = url;
  for (const key of sortedKeys) {
    dataString += key + params[key];
  }
  const computed = crypto.createHmac('sha1', authToken).update(dataString).digest('base64');
  try {
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
  } catch {
    return false;
  }
}

const TWIML_EMPTY = '<Response></Response>';
const twimlHeaders = { 'Content-Type': 'text/xml' } as const;

export async function POST(req: Request) {
  try {
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    if (!twilioAuthToken) {
      logger.error('TWILIO_AUTH_TOKEN not configured');
      return new NextResponse(TWIML_EMPTY, { status: 200, headers: twimlHeaders });
    }

    const signature = req.headers.get('x-twilio-signature');
    if (!signature) {
      return new NextResponse(TWIML_EMPTY, { status: 403, headers: twimlHeaders });
    }

    const formData = await req.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => { params[key] = String(value); });

    const requestUrl = process.env.TWILIO_WEBHOOK_URL || new URL(req.url).toString();
    if (!validateTwilioSignature(twilioAuthToken, requestUrl, params, signature)) {
      return new NextResponse(TWIML_EMPTY, { status: 403, headers: twimlHeaders });
    }

    const fromStr = params['From'] || '';
    const bodyStr = params['Body'] || '';

    if (!fromStr || !bodyStr) {
      return new NextResponse(TWIML_EMPTY, { status: 200, headers: twimlHeaders });
    }

    const from = fromStr.replace('+1', '').replace(/\D/g, '');
    const reply = bodyStr.trim().toUpperCase();

    const matchingClients = await db.select().from(clients).where(
      sql`REGEXP_REPLACE(${clients.phone}, '[^0-9]', '', 'g') = ${from}`
    ).limit(1);

    const client = matchingClients[0];
    if (!client) {
      return new NextResponse(TWIML_EMPTY, { status: 200, headers: twimlHeaders });
    }

    if (reply === 'C' || reply === 'R') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingAppts = await db.select()
        .from(appointments)
        .where(
          and(
            eq(appointments.clientId, client.id),
            inArray(appointments.status, ['upcoming', 'confirmed']),
            gte(appointments.date, today)
          )
        )
        .orderBy(asc(appointments.date))
        .limit(1);

      if (upcomingAppts.length > 0) {
        const appt = upcomingAppts[0];
        if (reply === 'C') {
          await db.update(appointments).set({ status: 'confirmed' }).where(eq(appointments.id, appt.id));
        } else {
          await db.update(appointments).set({ status: 'reschedule_requested' }).where(eq(appointments.id, appt.id));
          await db.insert(tasks).values({
            eventId: appt.eventId,
            title: `Reschedule requested for ${client.firstName} (${appt.type})`,
            status: 'open',
            dueDate: new Date().toISOString().split('T')[0],
          });
        }
      }
    } else if (['1', '2', '3', '4', '5'].includes(reply)) {
      const score = parseInt(reply);

      const fromEvents = await db.select({ id: appointments.eventId })
        .from(appointments)
        .where(eq(appointments.clientId, client.id))
        .orderBy(desc(appointments.date))
        .limit(1);

      const eventId = fromEvents.length > 0 ? fromEvents[0].id : null;

      await db.insert(reviews).values({
        clientId: client.id,
        eventId: eventId,
        score,
        phone: from,
      });

      await db.update(clients).set({ lastActivityDate: new Date() }).where(eq(clients.id, client.id));

      if (score >= 4) {
        logger.info("Sending review request SMS", { to: fromStr, message: "Thank you so much! We'd appreciate a Google review" });
      } else if (eventId) {
        await db.insert(tasks).values({
          eventId,
          title: `Low review score (${score}/5) from ${client.firstName}. Needs follow-up.`,
          status: 'open',
          dueDate: new Date().toISOString().split('T')[0],
        });
      }
    }

    return new NextResponse(TWIML_EMPTY, { status: 200, headers: twimlHeaders });
  } catch (error) {
    logger.error('SMS Reply error', { error: String(error) });
    return new NextResponse(TWIML_EMPTY, { status: 200, headers: twimlHeaders });
  }
}
