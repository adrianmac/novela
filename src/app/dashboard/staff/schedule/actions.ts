"use server";

import { db } from "@/db";
import { appointments, clients, events } from "@/db/schema";
import { eq, gte, lte, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { STAFF } from "./shared";

export async function getScheduleData(startDate?: Date, endDate?: Date) {
  // If no dates provided, use current week
  const start = startDate || new Date();
  if (!startDate) {
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    start.setDate(diff);
    start.setHours(0,0,0,0);
  }

  const end = endDate || new Date(start);
  if (!endDate) {
    end.setDate(start.getDate() + 6);
    end.setHours(23,59,59,999);
  }

  const rawAppointments = await db.select({
    id: appointments.id,
    eventId: appointments.eventId,
    clientId: appointments.clientId,
    type: appointments.type,
    date: appointments.date,
    staffId: appointments.staffId,
    staffName: appointments.staffName,
    status: appointments.status,
    clientFirstName: clients.firstName,
    clientLastName: clients.lastName,
    eventType: events.type,
  })
  .from(appointments)
  .leftJoin(clients, eq(appointments.clientId, clients.id))
  .leftJoin(events, eq(appointments.eventId, events.id))
  .where(
    and(
      gte(appointments.date, start),
      lte(appointments.date, end)
    )
  );

  return {
    appointments: rawAppointments,
    staff: STAFF,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

export async function getClientsAndEvents() {
  const allClients = await db.select({
    id: clients.id,
    firstName: clients.firstName,
    lastName: clients.lastName,
  }).from(clients);

  const allEvents = await db.select({
    id: events.id,
    clientId: events.clientId,
    type: events.type,
    date: events.date,
  }).from(events);

  return { clients: allClients, events: allEvents };
}

export async function addAppointment(data: any) {
  // Check for conflicts
  // Assuming a fixed 1-hour duration for simplicity in conflict checking
  const aptDate = new Date(data.date);
  const endAptDate = new Date(aptDate.getTime() + 60 * 60 * 1000);

  const existing = await db.select().from(appointments).where(
    and(
      eq(appointments.staffId, data.staffId),
      gte(appointments.date, new Date(aptDate.getTime() - 59 * 60 * 1000)), // Conflict if starting within an hour before
      lte(appointments.date, endAptDate)
    )
  );

  if (existing.length > 0) {
    return { error: "Staff member is already booked at this time." };
  }

  const staff = STAFF.find((s: any) => s.id === data.staffId);

  await db.insert(appointments).values({
    eventId: data.eventId,
    clientId: data.clientId,
    type: data.type,
    date: aptDate,
    staffId: data.staffId,
    staffName: staff?.name || "Unassigned",
    status: "upcoming",
  });

  revalidatePath("/dashboard/staff/schedule");
  return { success: true };
}
