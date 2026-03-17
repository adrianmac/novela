'use server';

import { db } from '@/db';
import {
  alterationJobs,
  alterationItems,
  clients,
  events,
  appointments,
  inventory,
} from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getAlterations() {
  try {
    const jobs = await db
      .select({
        job: alterationJobs,
        client: clients,
        event: events,
      })
      .from(alterationJobs)
      .innerJoin(events, eq(alterationJobs.eventId, events.id))
      .innerJoin(clients, eq(alterationJobs.clientId, clients.id))
      .orderBy(desc(events.date));

    // Fetch items for each job
    const jobsWithItems = await Promise.all(
      jobs.map(async (row) => {
        const items = await db
          .select()
          .from(alterationItems)
          .where(eq(alterationItems.jobId, row.job.id));

        const apps = await db
          .select()
          .from(appointments)
          .where(and(eq(appointments.eventId, row.event.id), eq(appointments.type, 'fitting')))
          .orderBy(desc(appointments.date));

        let inv = null;
        if (row.job.inventoryItemId) {
             const [fetchedInv] = await db.select().from(inventory).where(eq(inventory.id, row.job.inventoryItemId));
             inv = fetchedInv || null;
        }

        return {
          ...row.job,
          client: row.client,
          event: row.event,
          inventory: inv,
          items,
          fittings: apps,
        };
      })
    );

    return jobsWithItems;
  } catch (error) {
    console.error('Failed to get alterations:', error);
    throw new Error('Failed to fetch alteration jobs');
  }
}

export async function updateAlterationStatus(jobId: string, status: string) {
  try {
    await db
      .update(alterationJobs)
      .set({ status })
      .where(eq(alterationJobs.id, jobId));

    revalidatePath('/dashboard/alterations');
    return { success: true };
  } catch (error) {
    console.error('Failed to update alteration status:', error);
    throw new Error('Failed to update status');
  }
}

export async function updateMeasurements(jobId: string, measurements: string) {
  try {
    await db
      .update(alterationJobs)
      .set({ measurementsJson: measurements })
      .where(eq(alterationJobs.id, jobId));

    revalidatePath('/dashboard/alterations');
    return { success: true };
  } catch (error) {
    console.error('Failed to update measurements:', error);
    throw new Error('Failed to update measurements');
  }
}

export async function toggleAlterationItem(itemId: string, isCompleted: boolean) {
  try {
    await db
      .update(alterationItems)
      .set({ isCompleted: isCompleted ? 1 : 0 })
      .where(eq(alterationItems.id, itemId));

    revalidatePath('/dashboard/alterations');
    return { success: true };
  } catch (error) {
    console.error('Failed to toggle alteration item:', error);
    throw new Error('Failed to toggle item status');
  }
}

export async function addAlterationItem(jobId: string, taskName: string, description: string, estimatedPrice: number) {
  try {
    await db.insert(alterationItems).values({
      jobId,
      taskName,
      description,
      estimatedPrice,
    });

    // Update job total price
    const items = await db.select().from(alterationItems).where(eq(alterationItems.jobId, jobId));
    const total = items.reduce((sum, item) => sum + item.estimatedPrice, 0);
    await db.update(alterationJobs).set({ totalEstimatedPrice: total }).where(eq(alterationJobs.id, jobId));

    revalidatePath('/dashboard/alterations');
    return { success: true };
  } catch (error) {
    console.error('Failed to add alteration item:', error);
    throw new Error('Failed to add item');
  }
}

export async function deleteAlterationItem(itemId: string, jobId: string) {
    try {
      await db.delete(alterationItems).where(eq(alterationItems.id, itemId));

      // Update job total price
      const items = await db.select().from(alterationItems).where(eq(alterationItems.jobId, jobId));
      const total = items.reduce((sum, item) => sum + item.estimatedPrice, 0);
      await db.update(alterationJobs).set({ totalEstimatedPrice: total }).where(eq(alterationJobs.id, jobId));

      revalidatePath('/dashboard/alterations');
      return { success: true };
    } catch (error) {
      console.error('Failed to delete alteration item:', error);
      throw new Error('Failed to delete item');
    }
}
