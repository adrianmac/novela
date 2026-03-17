const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

// The DB schema specifies events.date is a string (PgDateString).
// So we must pass strings like `YYYY-MM-DD` instead of Date objects.

function fixDateString(varName) {
  content = content.replace(new RegExp(\`lte\\\\(events.date, \${varName}\\\\)\`, 'g'), \`lte(events.date, \${varName}.toISOString().split('T')[0])\`);
  content = content.replace(new RegExp(\`gte\\\\(events.date, \${varName}\\\\)\`, 'g'), \`gte(events.date, \${varName}.toISOString().split('T')[0])\`);
  content = content.replace(new RegExp(\`lt\\\\(clients.createdAt, \${varName}\\\\)\`, 'g'), \`lt(clients.createdAt, \${varName})\`);
}

fixDateString('in7Days');
fixDateString('in14Days');
fixDateString('in30Days');
fixDateString('todayDate');
fixDateString('ago60Days');

fs.writeFileSync('src/app/dashboard/page.tsx', content);
console.log("Patched date typing");
