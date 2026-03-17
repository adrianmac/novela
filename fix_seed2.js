const fs = require('fs');
let code = fs.readFileSync('src/db/seed.ts', 'utf8');

if (!code.includes('await seedAlterations();')) {
    code = code.replace('await db.delete(schema.inventoryRentals);', 'await db.delete(schema.alterationItems);\n  await db.delete(schema.alterationJobs);\n  await db.delete(schema.inventoryRentals);');
    code = code.replace('console.log(\'Database seeded successfully.\');', 'await seedAlterations();\n  console.log(\'Database seeded successfully.\');');
    fs.writeFileSync('src/db/seed.ts', code);
}
