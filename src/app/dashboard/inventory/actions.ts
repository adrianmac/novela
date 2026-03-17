'use server'

import { db } from "@/db";
import { inventory, inventoryRentals, events, clients } from "@/db/schema";
import { eq, sql, and, or, lt, gte, lte, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addInventoryItem(data: any) {
  try {
    const [newItem] = await db.insert(inventory).values({
      sku: data.sku,
      name: data.name,
      description: data.description || null,
      size: data.size || null,
      category: data.category,
      rentalPrice: Math.round(data.rentalPrice * 100),
      depositAmount: Math.round(data.depositAmount * 100),
      status: 'available',
      imageUrl: data.imageUrl || null,
    }).returning();

    revalidatePath('/dashboard/inventory');
    return { success: true, item: newItem };
  } catch (err: any) {
    console.error("Add item error", err);
    return { success: false, error: err.message };
  }
}

export async function checkDressAvailability(dressId: string, proposedPickupDate: string, proposedReturnDate: string) {
  // Add 1-day cleaning buffer
  const pReturn = new Date(proposedReturnDate);
  pReturn.setDate(pReturn.getDate() + 1);
  const pReturnStr = pReturn.toISOString().split('T')[0];

  const pPickup = new Date(proposedPickupDate);
  pPickup.setDate(pPickup.getDate() - 1);
  const pPickupStr = pPickup.toISOString().split('T')[0];

  // Find conflicts
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

  // Get current dress details for alternatives
  const [currentDress] = await db.select().from(inventory).where(eq(inventory.id, dressId));
  let alternatives: any[] = [];

  if (currentDress) {
    // Find alternatives (same category and size)
    const allAlternatives = await db.select().from(inventory).where(
      and(
        eq(inventory.category, currentDress.category),
        eq(inventory.size, currentDress.size || ''),
        sql`${inventory.id} != ${dressId}`
      )
    );

    // Check conflicts for alternatives
    for (const alt of allAlternatives) {
      if (alternatives.length >= 3) break;

      const altConflicts = await db.select().from(inventoryRentals).where(
        and(
          eq(inventoryRentals.itemId, alt.id),
          or(eq(inventoryRentals.status, 'reserved'), eq(inventoryRentals.status, 'rented')),
          sql`${inventoryRentals.returnedAt} IS NULL`,
          and(
            lte(inventoryRentals.pickupDate, pReturnStr),
            gte(inventoryRentals.returnDate, pPickupStr)
          )
        )
      );

      if (altConflicts.length === 0) {
        alternatives.push(alt);
      }
    }
  }

  return {
    available: false,
    conflicts: conflictsResult,
    alternatives: alternatives
  };
}

export async function reserveItem(itemId: string, eventId: string, pickupDate: string, returnDate: string) {
  try {
    const availability = await checkDressAvailability(itemId, pickupDate, returnDate);
    if (!availability.available) return { success: false, error: "Dates conflict with an existing rental." };

    await db.insert(inventoryRentals).values({
      itemId,
      eventId,
      status: 'reserved',
      pickupDate,
      returnDate,
    });

    await db.update(inventory).set({ status: 'reserved' }).where(eq(inventory.id, itemId));

    revalidatePath('/dashboard/inventory');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function markItemStatus(itemId: string, newStatus: string) {
  await db.update(inventory).set({ status: newStatus }).where(eq(inventory.id, itemId));
  revalidatePath('/dashboard/inventory');
}

export async function logReturn(rentalId: string, condition: string, notes: string, inCleaning: boolean) {
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
  } catch (err: any) {
    return { success: false, error: err.message };
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
