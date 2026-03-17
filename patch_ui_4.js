const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

const regex = /{\/\* HEADER \*\/}[\s\S]*?{\/\* ALERT BANNER \*\//;
content = content.replace(regex, '{/* ALERT BANNER */}');

content = content.replace(
  "days — ${",
  "days — \\$${"
);

fs.writeFileSync('src/app/dashboard/page.tsx', content);
console.log("Patched UI formatting 4");
