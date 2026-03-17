'use server'

import { db } from "@/db";
import { clients, events, eventServices, appointments } from "@/db/schema";
import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { generateMilestones } from "@/app/dashboard/events/paymentActions";

export async function submitIntakeForm(data: any) {
  try {
    // 1. Create client record
    const [newClient] = await db.insert(clients).values({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || null,
      phone: data.phone,
      secondaryContactName: data.secondaryContactName || null,
      secondaryContactPhone: data.secondaryContactPhone || null,
      hearAboutUs: data.hearAboutUs || null,
      referredBy: data.referredBy || null,
    }).returning();

    // 2. Create event record
    const [newEvent] = await db.insert(events).values({
      clientId: newClient.id,
      type: data.eventType,
      date: data.eventDate,
      status: 'consultation_scheduled',
      guestCount: data.guestCount ? parseInt(data.guestCount) : null,
      venueName: data.venueName || null,
      venueCity: data.venueCity || null,
      budgetRange: data.budgetRange || null,
      totalValue: 0, // Will be updated later during planning
    }).returning();

    // 3. Create event services
    if (data.services && data.services.length > 0) {
      await db.insert(eventServices).values(
        data.services.map((service: string) => ({
          eventId: newEvent.id,
          serviceType: service,
        }))
      );
    }

    // 4. Create appointment record
    if (data.appointmentDate && data.staffId) {
      await db.insert(appointments).values({
        eventId: newEvent.id,
        clientId: newClient.id,
        type: 'consultation',
        date: new Date(data.appointmentDate),
        staffId: data.staffId,
        staffName: data.staffName || 'Unassigned',
        notes: data.appointmentNotes || null,
        status: 'upcoming',
      });
    }

    // 5. Send confirmation SMS via Twilio (Mock)
    console.log(`[Twilio Mock] Sending SMS to ${data.phone}: Confirmation for ${data.firstName}'s consultation booked on ${data.appointmentDate}.`);

    // 6. Generate payment milestones
    let baseAmount = data.budgetRange ? parseInt(data.budgetRange.replace(/[^0-9]/g, '')) * 100 : 500000; // Mock base total if none exists
    if (isNaN(baseAmount)) baseAmount = 500000;

    // Update event total value for milestones
    await db.update(events).set({ totalValue: baseAmount }).where(sql`id = ${newEvent.id}`);

    await generateMilestones({
      id: newEvent.id,
      clientId: newClient.id,
      date: newEvent.date,
      services_json: data.services || []
    }, baseAmount);

    revalidatePath('/dashboard/events');
    revalidatePath('/dashboard');

    return { success: true, eventId: newEvent.id };
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

// Mock staff fetching for available consultation slots
export async function getAvailableStaff() {
  return [
    { id: 'u1', name: 'Isabel M.', role: 'Senior Coordinator' },
    { id: 'u2', name: 'Elena R.', role: 'Coordinator' },
  ];
}
