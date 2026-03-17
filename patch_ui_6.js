const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

content = content.replace('{/* PRIORITY ALERT BANNER */}}', '{/* PRIORITY ALERT BANNER */}');

fs.writeFileSync('src/app/dashboard/page.tsx', content);
console.log("Patched UI formatting 6");
