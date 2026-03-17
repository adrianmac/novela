const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/staff/schedule/ScheduleClient.tsx', 'utf8');

content = content.replace('default: return nu\n\nfunction AddAppointmentModal', '    default: return null;\n  }\n}\n\nfunction AddAppointmentModal');

fs.writeFileSync('src/app/dashboard/staff/schedule/ScheduleClient.tsx', content);
