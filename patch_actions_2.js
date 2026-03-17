const fs = require('fs');

const fileContent = fs.readFileSync('src/app/dashboard/inventory/actions.ts', 'utf8');

// Replace checkConflict inside reserveItem with checkDressAvailability
const newContent = fileContent.replace(
  /const conflicts = await checkConflict\(itemId, pickupDate, returnDate\);[\s\S]*?if \(conflicts.length > 0\)/m,
  `const availability = await checkDressAvailability(itemId, pickupDate, returnDate);
    if (!availability.available)`
);

fs.writeFileSync('src/app/dashboard/inventory/actions.ts', newContent);
console.log("Actions patched successfully again!");
