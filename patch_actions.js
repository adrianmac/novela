const fs = require('fs');

const fileContent = fs.readFileSync('src/app/dashboard/inventory/actions.ts', 'utf8');
const newContent = fileContent.replace(
  /export async function checkConflict[\s\S]*?return conflicts;\n}/m,
  `export async function checkDressAvailability(dressId: string, proposedPickupDate: string, proposedReturnDate: string) {
  // Add 1-day cleaning buffer
  const pReturn = new Date(proposedReturnDate);
  pReturn.setDate(pReturn.getDate() + 1);
  const pReturnStr = pReturn.toISOString().split('T')[0];

  const pPickup = new Date(proposedPickupDate);
  pPickup.setDate(pPickup.getDate() - 1);
  const pPickupStr = pPickup.toISOString().split('T')[0];

  // Find conflicts
  const conflictsResult = await db.select({
    clientName: sql<string>\`\${clients.firstName} || ' ' || \${clients.lastName}\`,
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
      sql\`\${inventoryRentals.returnedAt} IS NULL\`,
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
        sql\`\${inventory.id} != \${dressId}\`
      )
    );

    // Check conflicts for alternatives
    for (const alt of allAlternatives) {
      if (alternatives.length >= 3) break;

      const altConflicts = await db.select().from(inventoryRentals).where(
        and(
          eq(inventoryRentals.itemId, alt.id),
          or(eq(inventoryRentals.status, 'reserved'), eq(inventoryRentals.status, 'rented')),
          sql\`\${inventoryRentals.returnedAt} IS NULL\`,
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
}`
);

fs.writeFileSync('src/app/dashboard/inventory/actions.ts', newContent.replace('import { eq, sql, and, or, lt, gte, desc } from "drizzle-orm";', 'import { eq, sql, and, or, lt, gte, lte, desc } from "drizzle-orm";'));
console.log("Actions patched successfully!");
