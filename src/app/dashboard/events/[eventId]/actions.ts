'use server'

import { db } from "@/db";
import { tasks, payments, notes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { taskToggleSchema, paymentSchema, noteSchema } from "@/lib/validations";

export async function toggleTaskStatus(taskId: string, currentStatus: string, eventId: string) {
  await requireAuth();
  taskToggleSchema.parse({ taskId, currentStatus, eventId });

  try {
    const newStatus = currentStatus === 'completed' ? 'open' : 'completed';
    await db.update(tasks).set({ status: newStatus }).where(eq(tasks.id, taskId));
    revalidatePath(`/dashboard/events/${eventId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to toggle task:', error);
    return { success: false, error: 'Failed to update task' };
  }
}

export async function addNote(eventId: string, text: string) {
  await requireAuth();
  noteSchema.parse({ eventId, text });

  try {
    await db.insert(notes).values({ eventId, text });
    revalidatePath(`/dashboard/events/${eventId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to add note:', error);
    return { success: false, error: 'Failed to add note' };
  }
}

export async function markPaymentPaid(paymentId: string, eventId: string) {
  await requireAuth();
  paymentSchema.parse({ paymentId, eventId });

  try {
    await db.update(payments).set({ status: 'paid', paidAt: new Date() }).where(eq(payments.id, paymentId));
    revalidatePath(`/dashboard/events/${eventId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to mark payment:', error);
    return { success: false, error: 'Failed to record payment' };
  }
}
