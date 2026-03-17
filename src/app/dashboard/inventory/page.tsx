import React from 'react';
import { db } from "@/db";
import { inventory, inventoryRentals, events, clients } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import InventoryClient from './InventoryClient';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  // Fetch all inventory items
  const items = await db.select().from(inventory).orderBy(desc(inventory.createdAt));

  // Fetch current active rentals to attach client details
  const activeRentals = await db
    .select({
      id: inventoryRentals.id,
      itemId: inventoryRentals.itemId,
      status: inventoryRentals.status,
      returnDate: inventoryRentals.returnDate,
      pickupDate: inventoryRentals.pickupDate,
      clientName: sql<string>`${clients.firstName} || ' ' || ${clients.lastName}`,
    })
    .from(inventoryRentals)
    .innerJoin(events, eq(inventoryRentals.eventId, events.id))
    .innerJoin(clients, eq(events.clientId, clients.id))
    .where(sql`${inventoryRentals.status} IN ('rented', 'reserved', 'overdue')`);

  // Map active rentals to items
  const itemsWithContext = items.map(item => {
    const rental = activeRentals.find(r => r.itemId === item.id);
    return {
      ...item,
      activeRental: rental || null
    };
  });

  // Calculate stats
  const totalDresses = items.length;
  const availableNow = items.filter(i => i.status === 'available').length;
  const currentlyRented = items.filter(i => i.status === 'rented').length;

  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const dueBackThisWeek = activeRentals.filter(r => {
    const d = new Date(r.returnDate);
    return d >= now && d <= weekFromNow && (r.status === 'rented' || r.status === 'overdue');
  }).length;

  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-rose-950">Inventory</h1>
          <p className="text-rose-700/80 mt-1">Manage dresses, accessories, and decoration assets.</p>
        </div>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Items', value: totalDresses },
          { label: 'Available Now', value: availableNow, color: 'text-emerald-600' },
          { label: 'Currently Rented', value: currentlyRented, color: 'text-amber-600' },
          { label: 'Due Back (7 Days)', value: dueBackThisWeek, color: 'text-rose-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-rose-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-24">
            <span className="text-xs font-bold text-rose-800/60 uppercase tracking-widest">{stat.label}</span>
            <span className={`text-3xl font-serif font-bold ${stat.color || 'text-rose-950'}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      <InventoryClient initialItems={itemsWithContext} />
    </div>
  );
}
