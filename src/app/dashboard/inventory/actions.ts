'use server'

import { db } from "@/db";
import { inventory, inventoryRentals, events, clients } from "@/db/schema";
import { eq, sql, and, or, lt, gte, desc } from "drizzle-orm";
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

export async function checkConflict(itemId: string, pickupDate: string, returnDate: string) {
  // Check if there are any rentals for this item overlapping the requested dates
  const conflicts = await db.select().from(inventoryRentals).where(
    and(
      eq(inventoryRentals.itemId, itemId),
      or(
        and(gte(inventoryRentals.pickupDate, pickupDate), lt(inventoryRentals.pickupDate, returnDate)),
        and(gte(inventoryRentals.returnDate, pickupDate), lt(inventoryRentals.returnDate, returnDate)),
        and(lt(inventoryRentals.pickupDate, pickupDate), gte(inventoryRentals.returnDate, returnDate))
      )
    )
  );
  return conflicts;
}

export async function reserveItem(itemId: string, eventId: string, pickupDate: string, returnDate: string) {
  try {
    const conflicts = await checkConflict(itemId, pickupDate, returnDate);
    if (conflicts.length > 0) return { success: false, error: "Dates conflict with an existing rental." };

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
