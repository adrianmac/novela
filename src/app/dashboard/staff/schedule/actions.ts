"use server";

import { db } from "@/db";
import { appointments, clients, events, staff as staffTable } from "@/db/schema";
import { eq, gte, lte, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { DEFAULT_STAFF } from "./shared";
import type { StaffMember } from "./shared";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

async function getStaffFromDb(): Promise<StaffMember[]> {
  const rows = await db.select({
    id: staffTable.id,
    name: staffTable.name,
    role: staffTable.role,
    capacityHours: staffTable.capacityHours,
  }).from(staffTable).where(eq(staffTable.isActive, true));

  if (rows.length === 0) return DEFAULT_STAFF;
  return rows;
}

export async function getScheduleData(startDate?: Date, endDate?: Date) {
  await requireAuth();

  const staffMembers = await getStaffFromDb();

  const start = startDate || new Date();
  if (!startDate) {
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
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
    staff: staffMembers,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

export async function getClientsAndEvents() {
  await requireAuth();

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

const addAppointmentInput = z.object({
  staffId: z.string().min(1, 'Staff is required'),
  date: z.coerce.date(),
  type: z.string().min(1, 'Type is required'),
  clientId: z.union([z.string(), z.number()]).transform(String),
  eventId: z.union([z.string(), z.number()]).transform(String),
});

export async function addAppointment(data: unknown) {
  await requireAuth();
  const parsed = addAppointmentInput.parse(data);

  try {
    const aptDate = new Date(parsed.date);
    const endAptDate = new Date(aptDate.getTime() + 60 * 60 * 1000);

    const existing = await db.select().from(appointments).where(
      and(
        eq(appointments.staffId, parsed.staffId),
        gte(appointments.date, new Date(aptDate.getTime() - 59 * 60 * 1000)),
        lte(appointments.date, endAptDate)
      )
    );

    if (existing.length > 0) {
      return { error: "Staff member is already booked at this time." };
    }

    const staffMembers = await getStaffFromDb();
    const staffMember = staffMembers.find(s => s.id === parsed.staffId);

    await db.insert(appointments).values({
      eventId: parsed.eventId,
      clientId: parsed.clientId,
      type: parsed.type,
      date: aptDate,
      staffId: parsed.staffId,
      staffName: staffMember?.name || "Unassigned",
      status: "upcoming",
    });

    await db.update(clients).set({ lastActivityDate: new Date() }).where(eq(clients.id, parsed.clientId));

    revalidatePath("/dashboard/staff/schedule");
    return { success: true };
  } catch (error) {
    console.error("Failed to add appointment:", error);
    return { error: "Failed to create appointment" };
  }
}
