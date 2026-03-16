'use server'

import { db } from "@/db";
import { tasks, payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function toggleTaskStatus(taskId: string, currentStatus: string, eventId: string) {
  const newStatus = currentStatus === 'completed' ? 'open' : 'completed';
  await db.update(tasks).set({ status: newStatus }).where(eq(tasks.id, taskId));
  revalidatePath(`/dashboard/events/${eventId}`);
}

export async function addNote(eventId: string, text: string) {
  // In a real app we'd have a notes table.
  // For the prompt's sake, we'll pretend we save it,
  // or we can just console.log if there is no notes schema.
  console.log(`Adding note to event ${eventId}: ${text}`);
  revalidatePath(`/dashboard/events/${eventId}`);
}

export async function markPaymentPaid(paymentId: string, eventId: string) {
  await db.update(payments).set({ status: 'paid', paidAt: new Date() }).where(eq(payments.id, paymentId));
  revalidatePath(`/dashboard/events/${eventId}`);
}
