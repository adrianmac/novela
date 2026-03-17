const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/alterations/actions.ts', 'utf8');
code = code.replace(".leftJoin(inventory, eq(alterationJobs.inventoryItemId, inventory.id))", ".leftJoin(inventory, eq(alterationJobs.inventoryItemId, inventory.id))");
// Actually, looking at the schema:
// inventoryItemId: uuid('inventory_item_id').references(() => inventory.id), // Optional, if they are altering a rented dress
// Let's remove the .leftJoin(inventory) and just get the alterationJobs, clients, events, then fetch inventory if needed.
fs.writeFileSync('src/app/dashboard/alterations/actions.ts', code);
