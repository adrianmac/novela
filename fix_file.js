const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/staff/schedule/ScheduleClient.tsx', 'utf8');

// The file has some weird syntax around line 410-430
// Let's just grab the whole file and ensure it is valid
if (!content.includes('import { useState, useEffect }')) {
  content = content.replace('import { useState }', 'import { useState, useEffect }');
}

fs.writeFileSync('src/app/dashboard/staff/schedule/ScheduleClient.tsx', content);
