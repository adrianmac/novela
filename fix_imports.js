const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/staff/schedule/ScheduleClient.tsx', 'utf8');

// The file has import { addAppointment } twice
content = content.replace('import { addAppointment, getClientsAndEvents } from "./actions";\n', '');
content = content.replace('import { addAppointment } from "./actions";', 'import { addAppointment, getClientsAndEvents } from "./actions";');

fs.writeFileSync('src/app/dashboard/staff/schedule/ScheduleClient.tsx', content);
