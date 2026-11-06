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
import { eq, desc, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { alterationStatusSchema, measurementsSchema, alterationItemSchema } from '@/lib/validations';
import { z } from 'zod';
import { logger } from '@/lib/logger';

export async function getAlterations() {
  await requireAuth();

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

    if (jobs.length === 0) return [];

    const jobIds = jobs.map(j => j.job.id);
    const eventIds = Array.from(new Set(jobs.map(j => j.event.id)));
    const inventoryItemIds = jobs.map(j => j.job.inventoryItemId).filter(Boolean) as string[];

    const allItems = await db
      .select()
      .from(alterationItems)
      .where(sql`${alterationItems.jobId} IN (${sql.join(jobIds.map(id => sql`${id}`), sql`, `)})`);

    const allFittings = await db
      .select()
      .from(appointments)
      .where(and(
        sql`${appointments.eventId} IN (${sql.join(eventIds.map(id => sql`${id}`), sql`, `)})`,
        eq(appointments.type, 'fitting')
      ))
      .orderBy(desc(appointments.date));

    let inventoryMap = new Map<string, typeof inventory.$inferSelect>();
    if (inventoryItemIds.length > 0) {
      const invRows = await db
        .select()
        .from(inventory)
        .where(sql`${inventory.id} IN (${sql.join(inventoryItemIds.map(id => sql`${id}`), sql`, `)})`);
      for (const row of invRows) {
        inventoryMap.set(row.id, row);
      }
    }

    const itemsByJob = new Map<string, typeof allItems>();
    for (const item of allItems) {
      const arr = itemsByJob.get(item.jobId) || [];
      arr.push(item);
      itemsByJob.set(item.jobId, arr);
    }

    const fittingsByEvent = new Map<string, typeof allFittings>();
    for (const fitting of allFittings) {
      const arr = fittingsByEvent.get(fitting.eventId) || [];
      arr.push(fitting);
      fittingsByEvent.set(fitting.eventId, arr);
    }

    return jobs.map((row) => ({
      ...row.job,
      client: row.client,
      event: row.event,
      inventory: row.job.inventoryItemId ? inventoryMap.get(row.job.inventoryItemId) || null : null,
      items: itemsByJob.get(row.job.id) || [],
      fittings: fittingsByEvent.get(row.event.id) || [],
    }));
  } catch (error) {
    logger.error('Failed to get alterations', { error: String(error) });
    return [];
  }
}

export async function updateAlterationStatus(jobId: string, status: string) {
  await requireAuth();
  alterationStatusSchema.parse({ jobId, status });

  try {
    await db
      .update(alterationJobs)
      .set({ status })
      .where(eq(alterationJobs.id, jobId));

    revalidatePath('/dashboard/alterations');
    return { success: true };
  } catch (error) {
    logger.error('Failed to update alteration status', { error: String(error) });
    return { success: false, error: 'Failed to update status' };
  }
}

export async function updateMeasurements(jobId: string, measurements: string) {
  await requireAuth();
  measurementsSchema.parse({ jobId, measurements });

  try {
    await db
      .update(alterationJobs)
      .set({ measurementsJson: measurements })
      .where(eq(alterationJobs.id, jobId));

    revalidatePath('/dashboard/alterations');
    return { success: true };
  } catch (error) {
    logger.error('Failed to update measurements', { error: String(error) });
    return { success: false, error: 'Failed to update measurements' };
  }
}

export async function toggleAlterationItem(itemId: string, isCompleted: boolean) {
  await requireAuth();
  z.string().uuid().parse(itemId);

  try {
    await db
      .update(alterationItems)
      .set({ isCompleted })
      .where(eq(alterationItems.id, itemId));

    revalidatePath('/dashboard/alterations');
    return { success: true };
  } catch (error) {
    logger.error('Failed to toggle alteration item', { error: String(error) });
    return { success: false, error: 'Failed to toggle item status' };
  }
}

export async function addAlterationItem(jobId: string, taskName: string, description: string, estimatedPrice: number) {
  await requireAuth();
  alterationItemSchema.parse({ jobId, taskName, description, estimatedPrice });

  try {
    return await db.transaction(async (tx) => {
      await tx.insert(alterationItems).values({
        jobId,
        taskName,
        description,
        estimatedPrice,
      });

      const items = await tx.select().from(alterationItems).where(eq(alterationItems.jobId, jobId));
      const total = items.reduce((sum, item) => sum + item.estimatedPrice, 0);
      await tx.update(alterationJobs).set({ totalEstimatedPrice: total }).where(eq(alterationJobs.id, jobId));

      revalidatePath('/dashboard/alterations');
      return { success: true };
    });
  } catch (error) {
    logger.error('Failed to add alteration item', { error: String(error) });
    return { success: false, error: 'Failed to add item' };
  }
}

export async function deleteAlterationItem(itemId: string, jobId: string) {
  await requireAuth();
  z.string().uuid().parse(itemId);
  z.string().uuid().parse(jobId);

  try {
    return await db.transaction(async (tx) => {
      await tx.delete(alterationItems).where(eq(alterationItems.id, itemId));

      const items = await tx.select().from(alterationItems).where(eq(alterationItems.jobId, jobId));
      const total = items.reduce((sum, item) => sum + item.estimatedPrice, 0);
      await tx.update(alterationJobs).set({ totalEstimatedPrice: total }).where(eq(alterationJobs.id, jobId));

      revalidatePath('/dashboard/alterations');
      return { success: true };
    });
  } catch (error) {
    logger.error('Failed to delete alteration item', { error: String(error) });
    return { success: false, error: 'Failed to delete item' };
  }
}
