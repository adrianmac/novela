const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

const regex = /{\/\* HEADER \*\/}[\s\S]*?{\/\* PRIORITY ALERT BANNER \*\//;
content = content.replace(regex, '{/* PRIORITY ALERT BANNER */}');

fs.writeFileSync('src/app/dashboard/page.tsx', content);
console.log("Patched UI formatting 5");
