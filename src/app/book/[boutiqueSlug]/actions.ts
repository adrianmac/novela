"use server";

import { db } from "@/db";
import { clients, events, appointments, eventServices } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { generateMilestones } from "@/app/dashboard/events/paymentActions";
import { bookingSchema } from "@/lib/validations";

export async function submitBooking(data: unknown) {
  const parsed = bookingSchema.parse(data);

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
          hearAboutUs: parsed.howFound || null,
        }).returning();
        clientRecord = newClient;
      }

      const [event] = await tx.insert(events).values({
        clientId: clientRecord.id,
        type: parsed.eventType,
        date: new Date(parsed.eventDate).toISOString(),
        status: 'inquiry',
        guestCount: parsed.guestCount ? parseInt(String(parsed.guestCount)) : null,
        venueName: parsed.venue || null,
        totalValue: 0,
      }).returning();

      if (parsed.services && parsed.services.length > 0) {
        await tx.insert(eventServices).values(
          parsed.services.map((service: string) => ({
            eventId: event.id,
            serviceType: service
          }))
        );
      }

      await tx.insert(appointments).values({
        eventId: event.id,
        clientId: clientRecord.id,
        type: 'consultation',
        date: new Date(parsed.appointmentTime),
        status: 'upcoming',
        notes: parsed.contactMethod ? `Preferred contact: ${parsed.contactMethod}` : null,
      });

      let baseAmount = 500000;
      await tx.update(events).set({ totalValue: baseAmount }).where(eq(events.id, event.id));

      return { eventId: event.id, clientId: clientRecord.id, date: event.date, services: parsed.services, baseAmount };
    });

    await generateMilestones({
      id: result.eventId,
      clientId: result.clientId,
      date: result.date,
      services_json: result.services || []
    }, result.baseAmount);

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Booking failed:", error);
    return { success: false, error: "Failed to submit booking" };
  }
}
