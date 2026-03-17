const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

// Fix missing $ sign (replace dollar sign escape properly)
// We know from before it is: message: `${clientName} wedding is in ${days} days — \$${(e.amount / 100).toFixed(2)} ${e.milestone} is overdue`,
// Let's just fix it globally for the P1 alert.
content = content.replace(
  "days — ${",
  "days — \\$${"
);

// We need to completely remove the duplicated header block
const headerBlockRegex = /<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">[\s\S]*?<h1 className="text-3xl font-playfair font-semibold text-rose-950">Good morning, Isabel<\/h1>[\s\S]*?<\/div>\s*<\/div>/m;
content = content.replace(headerBlockRegex, "");

fs.writeFileSync('src/app/dashboard/page.tsx', content);
console.log("Patched UI formatting 2");
