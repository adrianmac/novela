import { NextResponse } from 'next/server';
import { db } from '@/db';
import { appointments, clients, tasks } from '@/db/schema';
import { eq, inArray, and, gte, asc, desc } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const fromStr = formData.get('From') as string;
    const bodyStr = formData.get('Body') as string;

    if (!fromStr || !bodyStr) {
      return new NextResponse('<Response></Response>', { status: 200, headers: { 'Content-Type': 'text/xml' }});
    }

    // Clean phone number format for matching (assuming Twilio sends +1XXXXXXXXXX)
    const from = fromStr.replace("+1", "").replace(/\D/g, "");
    const reply = bodyStr.trim().toUpperCase();

    // Find the client by phone number (we assume phone numbers are unique enough or we just take the first match)
    // In our system, phone is stored as just digits or with dashes. We will try to match dynamically
    const allClients = await db.select().from(clients);
    const client = allClients.find(c => c.phone?.replace(/\D/g, "") === from);

    if (!client) {
      return new NextResponse('<Response></Response>', { status: 200, headers: { 'Content-Type': 'text/xml' }});
    }

    // Handle Appointment Confirm/Reschedule (C or R)
    if (reply === 'C' || reply === 'R') {
      const today = new Date();
      today.setHours(0,0,0,0);

      // Find nearest upcoming appointment
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
        } else if (reply === 'R') {
          await db.update(appointments).set({ status: 'reschedule_requested' }).where(eq(appointments.id, appt.id));

          // Notify staff by creating a task
          await db.insert(tasks).values({
            eventId: appt.eventId,
            title: `Reschedule requested for ${client.firstName} (${appt.type})`,
            status: 'open',
            dueDate: new Date().toISOString().split('T')[0], // Due today
          });
        }
      }
    }
    // Handle Event Review (1-5)
    else if (['1', '2', '3', '4', '5'].includes(reply)) {
      const score = parseInt(reply);

      // We assume they are reviewing their most recent event
      // Instead of querying event status directly, we'll just check if they have any completed events recently
      // Actually, since post-event-review-request runs 24h after completion, we can just find their latest completed appointment or event

      if (score >= 4) {
        // We simulate sending a follow-up SMS with Google link
        console.log(`[Twilio SMS] To: ${fromStr}\nMessage: Thank you so much! We'd appreciate a Google review: https://g.page/r/fake/review\n`);
      } else {
        // Create an internal complaint ticket as a task
        // We'll attach it to their most recent event for context
        const fromEvents = await db.select({ id: appointments.eventId }).from(appointments).where(eq(appointments.clientId, client.id)).orderBy(desc(appointments.date)).limit(1);
        const eventId = fromEvents.length > 0 ? fromEvents[0].id : null;

        if (eventId) {
           await db.insert(tasks).values({
            eventId: eventId,
            title: `Low review score (${score}/5) from ${client.firstName}. Needs follow-up.`,
            status: 'open',
            dueDate: new Date().toISOString().split('T')[0],
          });
        }
      }
    }

    return new NextResponse('<Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' }
    });

  } catch (error) {
    console.error('SMS Reply error:', error);
    return new NextResponse('<Response></Response>', { status: 200, headers: { 'Content-Type': 'text/xml' } });
  }
}
