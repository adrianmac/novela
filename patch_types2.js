const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

content = replaceAll(content, 'lte(events.date, in7Days)', "lte(events.date, in7Days.toISOString().split('T')[0])");
content = replaceAll(content, 'lte(events.date, in14Days)', "lte(events.date, in14Days.toISOString().split('T')[0])");
content = replaceAll(content, 'lte(events.date, in30Days)', "lte(events.date, in30Days.toISOString().split('T')[0])");
content = replaceAll(content, 'gte(events.date, todayDate)', "gte(events.date, todayDate.toISOString().split('T')[0])");

fs.writeFileSync('src/app/dashboard/page.tsx', content);
console.log("Patched string dates");
