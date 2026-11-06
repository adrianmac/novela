'use server'

import { db } from "@/db";
import { inventory, inventoryRentals, events, clients } from "@/db/schema";
import { eq, sql, and, or, lte, gte, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { inventoryItemSchema, reserveItemSchema, inventoryStatusSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";

export async function addInventoryItem(data: unknown) {
  await requireAuth();
  const parsed = inventoryItemSchema.parse(data);

  try {
    const [newItem] = await db.insert(inventory).values({
      sku: parsed.sku,
      name: parsed.name,
      description: parsed.description || null,
      size: parsed.size || null,
      category: parsed.category,
      rentalPrice: Math.round(parsed.rentalPrice * 100),
      depositAmount: Math.round(parsed.depositAmount * 100),
      status: 'available',
      imageUrl: parsed.imageUrl || null,
    }).returning();

    revalidatePath('/dashboard/inventory');
    return { success: true, item: newItem };
  } catch (err) {
    logger.error("Add item error", { error: String(err) });
    return { success: false, error: "Failed to add inventory item" };
  }
}

export async function checkDressAvailability(dressId: string, proposedPickupDate: string, proposedReturnDate: string) {
  await requireAuth();

  const pReturn = new Date(proposedReturnDate);
  pReturn.setDate(pReturn.getDate() + 1);
  const pReturnStr = pReturn.toISOString().split('T')[0];

  const pPickup = new Date(proposedPickupDate);
  pPickup.setDate(pPickup.getDate() - 1);
  const pPickupStr = pPickup.toISOString().split('T')[0];

  const conflictsResult = await db.select({
    clientName: sql<string>`${clients.firstName} || ' ' || ${clients.lastName}`,
    pickupDate: inventoryRentals.pickupDate,
    returnDate: inventoryRentals.returnDate,
    eventDate: events.date
  })
  .from(inventoryRentals)
  .innerJoin(events, eq(inventoryRentals.eventId, events.id))
  .innerJoin(clients, eq(events.clientId, clients.id))
  .where(
    and(
      eq(inventoryRentals.itemId, dressId),
      or(eq(inventoryRentals.status, 'reserved'), eq(inventoryRentals.status, 'rented')),
      sql`${inventoryRentals.returnedAt} IS NULL`,
      and(
        lte(inventoryRentals.pickupDate, pReturnStr),
        gte(inventoryRentals.returnDate, pPickupStr)
      )
    )
  );

  if (conflictsResult.length === 0) {
    return { available: true };
  }

  const [currentDress] = await db.select().from(inventory).where(eq(inventory.id, dressId));
  let alternatives: typeof currentDress[] = [];

  if (currentDress) {
    const allAlternatives = await db.select().from(inventory).where(
      and(
        eq(inventory.category, currentDress.category),
        currentDress.size ? eq(inventory.size, currentDress.size) : sql`${inventory.size} IS NULL`,
        sql`${inventory.id} != ${dressId}`
      )
    );

    // Batch check conflicts for all alternatives at once
    if (allAlternatives.length > 0) {
      const altIds = allAlternatives.map(a => a.id);
      const altConflicts = await db.select({ itemId: inventoryRentals.itemId }).from(inventoryRentals).where(
        and(
          sql`${inventoryRentals.itemId} IN (${sql.join(altIds.map(id => sql`${id}`), sql`, `)})`,
          or(eq(inventoryRentals.status, 'reserved'), eq(inventoryRentals.status, 'rented')),
          sql`${inventoryRentals.returnedAt} IS NULL`,
          and(
            lte(inventoryRentals.pickupDate, pReturnStr),
            gte(inventoryRentals.returnDate, pPickupStr)
          )
        )
      );
      const conflictedIds = new Set(altConflicts.map(c => c.itemId));
      alternatives = allAlternatives.filter(a => !conflictedIds.has(a.id)).slice(0, 3);
    }
  }

  return {
    available: false,
    conflicts: conflictsResult,
    alternatives
  };
}

export async function reserveItem(itemId: string, eventId: string, pickupDate: string, returnDate: string) {
  await requireAuth();
  reserveItemSchema.parse({ itemId, eventId, pickupDate, returnDate });

  try {
    return await db.transaction(async (tx) => {
      // Lock the inventory row to prevent concurrent reservations
      const [item] = await tx.select().from(inventory).where(eq(inventory.id, itemId)).for('update');
      if (!item || item.status === 'retired') {
        return { success: false, error: "Item is not available for reservation." };
      }

      // Check for date conflicts within the transaction
      const pReturn = new Date(returnDate);
      pReturn.setDate(pReturn.getDate() + 1);
      const pReturnStr = pReturn.toISOString().split('T')[0];
      const pPickup = new Date(pickupDate);
      pPickup.setDate(pPickup.getDate() - 1);
      const pPickupStr = pPickup.toISOString().split('T')[0];

      const conflicts = await tx.select({ id: inventoryRentals.id }).from(inventoryRentals).where(
        and(
          eq(inventoryRentals.itemId, itemId),
          or(eq(inventoryRentals.status, 'reserved'), eq(inventoryRentals.status, 'rented')),
          sql`${inventoryRentals.returnedAt} IS NULL`,
          and(
            lte(inventoryRentals.pickupDate, pReturnStr),
            gte(inventoryRentals.returnDate, pPickupStr)
          )
        )
      );

      if (conflicts.length > 0) {
        return { success: false, error: "Dates conflict with an existing rental." };
      }

      await tx.insert(inventoryRentals).values({
        itemId,
        eventId,
        status: 'reserved',
        pickupDate,
        returnDate,
      });

      await tx.update(inventory).set({ status: 'reserved' }).where(eq(inventory.id, itemId));

      return { success: true };
    });
  } catch (err) {
    logger.error("Reserve item error", { error: String(err) });
    return { success: false, error: "Failed to reserve item" };
  } finally {
    revalidatePath('/dashboard/inventory');
  }
}

export async function markItemStatus(itemId: string, newStatus: string) {
  await requireAuth();
  inventoryStatusSchema.parse({ itemId, status: newStatus });

  try {
    await db.update(inventory).set({ status: newStatus }).where(eq(inventory.id, itemId));
    revalidatePath('/dashboard/inventory');
    return { success: true };
  } catch (err) {
    logger.error("Mark item status error", { error: String(err) });
    return { success: false, error: "Failed to update item status" };
  }
}

export async function logReturn(rentalId: string, condition: string, notes: string, inCleaning: boolean) {
  await requireAuth();

  try {
    const [rental] = await db.update(inventoryRentals).set({
      status: 'returned',
      conditionOnReturn: condition,
      damageNotes: notes || null,
      returnedAt: new Date(),
    }).where(eq(inventoryRentals.id, rentalId)).returning();

    const nextStatus = inCleaning ? 'cleaning' : 'available';
    await db.update(inventory).set({ status: nextStatus }).where(eq(inventory.id, rental.itemId));

    revalidatePath('/dashboard/inventory');
    return { success: true };
  } catch (err) {
    logger.error("Log return error", { error: String(err) });
    return { success: false, error: "Failed to process return" };
  }
}

export async function searchEvents(query: string) {
  const q = `%${query}%`;
  const results = await db
    .select({
      id: events.id,
      clientName: sql<string>`${clients.firstName} || ' ' || ${clients.lastName}`,
      date: events.date,
      type: events.type,
    })
    .from(events)
    .innerJoin(clients, eq(events.clientId, clients.id))
    .where(or(
      sql`${clients.firstName} ILIKE ${q}`,
      sql`${clients.lastName} ILIKE ${q}`,
      sql`${events.type} ILIKE ${q}`
    ))
    .limit(10);
  return results;
}
