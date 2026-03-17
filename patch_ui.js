const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

// 1. Fix missing $ in P1 alert message. Wait, let me check the existing string.
// message: \`\${clientName} wedding is in \${days} days — $\${(e.amount / 100).toFixed(2)} \${e.milestone} is overdue\`,
// The \$ might have been eaten by bash templating or replace regexes earlier if I didn't escape it properly.
// Let's replace the raw string.

content = content.replace(
  "message: `${clientName} wedding is in ${days} days — $${(e.amount / 100).toFixed(2)} ${e.milestone} is overdue`,",
  "message: `${clientName} wedding is in ${days} days — \\$${(e.amount / 100).toFixed(2)} ${e.milestone} is overdue`,"
);
// In case the dollar sign was completely stripped:
content = content.replace(
  "message: `${clientName} wedding is in ${days} days — ${(e.amount / 100).toFixed(2)} ${e.milestone} is overdue`,",
  "message: `${clientName} wedding is in ${days} days — $${(e.amount / 100).toFixed(2)} ${e.milestone} is overdue`,"
);

// 2. Fix the corrupted header
content = content.replace(
  "TodayToday's Scheduleapos;s Schedule",
  "Today's Schedule"
);

// 3. Remove the duplicated "Good morning, Isabel" header
// Looking at the page structure, there's likely a header block right after `export default async function DashboardOverview() {`
// Let's find it.
const headerBlockToReplace = `<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-rose-950">Good morning, Isabel</h1>
          <p className="text-rose-600 mt-1">{todayAppts.length} appointments today</p>
        </div>
        <div className="flex gap-3">
          <button className="h-13 w-13 rounded-xl border border-rose-200 text-rose-800 flex items-center justify-center hover:bg-rose-50 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="h-13 px-5 rounded-xl bg-rose-700 text-white font-medium flex items-center justify-center gap-2 hover:bg-rose-800 transition-colors">
            <UserPlus className="w-5 h-5" />
            <span className="hidden sm:inline">New client</span>
          </button>
        </div>
      </div>`;

content = content.replace(headerBlockToReplace, "");

fs.writeFileSync('src/app/dashboard/page.tsx', content);
console.log("Patched UI formatting");
