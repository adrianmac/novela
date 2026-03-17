const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

const bannerToReplace = `{/* PRIORITY ALERT BANNER (If tasks overdue or payments overdue) */}
      {overduePaymentsList.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex gap-4 items-start">
          <div className="bg-rose-100 p-2 rounded-lg text-rose-700 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-rose-900">{overduePaymentsList.length} action{overduePaymentsList.length === 1 ? '' : 's'} require attention</h3>
            <p className="text-rose-700 text-sm mt-1">Including {overduePaymentsList.length} overdue payment{overduePaymentsList.length === 1 ? '' : 's'}. Follow up to secure revenue.</p>
          </div>
          <button className="h-13 px-4 rounded-lg bg-white border border-rose-200 text-rose-800 font-medium whitespace-nowrap hover:bg-rose-50 transition-colors">
            Review alerts
          </button>
        </div>
      )}`;

const newBanner = `{/* PRIORITY ALERT BANNER */}
      {highestPriorityAlert && (
        <div className={cn(
          "rounded-xl p-4 flex gap-4 items-center border",
          highestPriorityAlert.level === 'critical' || highestPriorityAlert.level === 'high'
            ? "bg-[#FFF3CD] border-amber-200"
            : highestPriorityAlert.level === 'medium'
            ? "bg-blue-50 border-blue-200"
            : "bg-gray-50 border-gray-200"
        )}>
          <div className={cn(
            "p-2 rounded-lg shrink-0",
             highestPriorityAlert.level === 'critical' || highestPriorityAlert.level === 'high'
               ? "bg-amber-100 text-amber-700"
               : highestPriorityAlert.level === 'medium'
               ? "bg-blue-100 text-blue-700"
               : "bg-gray-200 text-gray-700"
          )}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className={cn(
               "font-semibold",
               highestPriorityAlert.level === 'critical' || highestPriorityAlert.level === 'high'
                 ? "text-amber-900"
                 : highestPriorityAlert.level === 'medium'
                 ? "text-blue-900"
                 : "text-gray-900"
            )}>{highestPriorityAlert.message}</h3>
          </div>
          <Link href={highestPriorityAlert.href} className={cn(
            "h-10 px-4 rounded-lg bg-white border font-medium whitespace-nowrap flex items-center transition-colors",
             highestPriorityAlert.level === 'critical' || highestPriorityAlert.level === 'high'
               ? "border-amber-200 text-amber-800 hover:bg-amber-50"
               : highestPriorityAlert.level === 'medium'
               ? "border-blue-200 text-blue-800 hover:bg-blue-50"
               : "border-gray-200 text-gray-800 hover:bg-gray-100"
          )}>
            {highestPriorityAlert.action}
          </Link>
        </div>
      )}`;

content = content.replace(bannerToReplace, newBanner);
fs.writeFileSync('src/app/dashboard/page.tsx', content);
console.log("Patched banner");
