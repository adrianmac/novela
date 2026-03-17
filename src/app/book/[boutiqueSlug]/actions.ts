"use server";

import { db } from "@/db";
import { clients, events, appointments, eventServices } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { generateMilestones } from "@/app/dashboard/events/paymentActions";
import { sql } from "drizzle-orm";

export async function submitBooking(data: any) {
  try {
    // 1. Create Client
    const [client] = await db.insert(clients).values({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || null,
      phone: data.phone,
      hearAboutUs: data.howFound || null,
    }).returning();

    // 2. Create Event
    const [event] = await db.insert(events).values({
      clientId: client.id,
      type: data.eventType,
      date: new Date(data.eventDate).toISOString(),
      status: 'inquiry', // Status inquiry for new bookings
      guestCount: data.guestCount ? parseInt(data.guestCount) : null,
      venueName: data.venue || null,
      totalValue: 0,
    }).returning();

    // 3. Create Event Services
    if (data.services && data.services.length > 0) {
      await db.insert(eventServices).values(
        data.services.map((service: string) => ({
          eventId: event.id,
          serviceType: service
        }))
      );
    }

    // 4. Create Appointment
    await db.insert(appointments).values({
      eventId: event.id,
      clientId: client.id,
      type: 'consultation',
      date: new Date(data.appointmentTime),
      status: 'scheduled', // Status scheduled
      notes: `Preferred contact: ${data.contactMethod}`,
    });

    // 5. Mock SMS sending
    console.log("-----------------------------------------");
    console.log(`[Twilio Mock] SMS sent to client ${data.phone}:`);
    console.log(`"Hi ${data.firstName}! Your consultation with Novela is confirmed for ${new Date(data.appointmentTime).toLocaleString()}."`);
    console.log("-----------------------------------------");

    console.log("-----------------------------------------");
    console.log(`[Twilio Mock] SMS sent to owner (555-000-0000):`);
    console.log(`"New lead! ${data.firstName} booked a consultation for ${new Date(data.appointmentTime).toLocaleString()}."`);
    console.log("-----------------------------------------");

    // 6. Generate payment milestones
    let baseAmount = 500000; // Mock base total if none exists
    await db.update(events).set({ totalValue: baseAmount }).where(sql`id = ${event.id}`);
    await generateMilestones({
      id: event.id,
      clientId: client.id,
      date: event.date,
      services_json: data.services || []
    }, baseAmount);

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Booking failed:", error);
    throw new Error("Failed to submit booking");
  }
}
