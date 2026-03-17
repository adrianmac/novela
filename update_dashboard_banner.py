with open('src/app/dashboard/page.tsx', 'r') as f:
    content = f.read()

import_statement = 'import { AlertBanner } from "@/components/ui/AlertBanner";\n'
if 'AlertBanner' not in content:
    content = content.replace('import { cn } from "@/lib/utils";', 'import { cn } from "@/lib/utils";\n' + import_statement)


old_banner = """      {/* PRIORITY ALERT BANNER */}
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
      )}"""

new_banner = """      {/* PRIORITY ALERT BANNER */}
      {highestPriorityAlert && (
        <AlertBanner
          message={highestPriorityAlert.message}
          level={highestPriorityAlert.level as any}
          action={highestPriorityAlert.action}
          href={highestPriorityAlert.href}
        />
      )}"""

content = content.replace(old_banner, new_banner)

with open('src/app/dashboard/page.tsx', 'w') as f:
    f.write(content)
