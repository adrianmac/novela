'use server'

import { db } from "@/db";
import { clients, events, eventServices, appointments, staff as staffTable } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { generateMilestones } from "@/app/dashboard/events/paymentActions";
import { requireAuth } from "@/lib/auth";
import { intakeFormSchema } from "@/lib/validations";

export async function submitIntakeForm(data: unknown) {
  await requireAuth();

  const parsed = intakeFormSchema.parse(data);

  try {
    const result = await db.transaction(async (tx) => {
      // Duplicate client detection by phone
      const existing = await tx.select().from(clients).where(eq(clients.phone, parsed.phone)).limit(1);
      let clientRecord;

      if (existing.length > 0) {
        clientRecord = existing[0];
      } else {
        const [newClient] = await tx.insert(clients).values({
          firstName: parsed.firstName,
          lastName: parsed.lastName,
          email: parsed.email || null,
          phone: parsed.phone,
          secondaryContactName: parsed.secondaryContactName || null,
          secondaryContactPhone: parsed.secondaryContactPhone || null,
          hearAboutUs: parsed.hearAboutUs || null,
          referredBy: parsed.referredBy || null,
        }).returning();
        clientRecord = newClient;
      }

      const [newEvent] = await tx.insert(events).values({
        clientId: clientRecord.id,
        type: parsed.eventType,
        date: parsed.eventDate,
        status: 'consultation_scheduled',
        guestCount: parsed.guestCount ? parseInt(String(parsed.guestCount)) : null,
        venueName: parsed.venueName || null,
        venueCity: parsed.venueCity || null,
        budgetRange: parsed.budgetRange || null,
        totalValue: 0,
      }).returning();

      if (parsed.services && parsed.services.length > 0) {
        await tx.insert(eventServices).values(
          parsed.services.map((service: string) => ({
            eventId: newEvent.id,
            serviceType: service,
          }))
        );
      }

      if (parsed.appointmentDate && parsed.staffId) {
        await tx.insert(appointments).values({
          eventId: newEvent.id,
          clientId: clientRecord.id,
          type: 'consultation',
          date: new Date(parsed.appointmentDate),
          staffId: parsed.staffId,
          staffName: parsed.staffName || 'Unassigned',
          notes: parsed.appointmentNotes || null,
          status: 'upcoming',
        });
      }

      let baseAmount = parsed.budgetRange ? parseInt(String(parsed.budgetRange).replace(/[^0-9]/g, '')) * 100 : 500000;
      if (isNaN(baseAmount)) baseAmount = 500000;

      await tx.update(events).set({ totalValue: baseAmount }).where(eq(events.id, newEvent.id));

      await tx.update(clients).set({ lastActivityDate: new Date() }).where(eq(clients.id, clientRecord.id));

      return { eventId: newEvent.id, clientId: clientRecord.id, date: newEvent.date, services: parsed.services, baseAmount };
    });

    await generateMilestones({
      id: result.eventId,
      clientId: result.clientId,
      date: result.date,
      services_json: result.services || []
    }, result.baseAmount);

    revalidatePath('/dashboard/events');
    revalidatePath('/dashboard');

    return { success: true, eventId: result.eventId };
  } catch (error) {
    console.error("Failed to submit intake form:", error);
    return { success: false, error: "Failed to create client and event" };
  }
}

export async function getVenues(query: string) {
  if (!query) return [];
  const results = await db
    .selectDistinct({ venueName: events.venueName })
    .from(events)
    .where(sql`${events.venueName} ILIKE ${'%' + query + '%'}`)
    .limit(5);
  return results.map(r => r.venueName).filter(Boolean);
}

export async function getAvailableStaff() {
  const rows = await db.select({
    id: staffTable.id,
    name: staffTable.name,
    role: staffTable.role,
  }).from(staffTable).where(eq(staffTable.isActive, true));

  if (rows.length === 0) {
    return [
      { id: 'u1', name: 'Isabel', role: 'Owner' },
      { id: 'u2', name: 'Maria S.', role: 'Seamstress' },
      { id: 'u3', name: 'Elena V.', role: 'Consultant' },
      { id: 'u4', name: 'Sofia G.', role: 'Event Planner' },
    ];
  }

  return rows;
}
