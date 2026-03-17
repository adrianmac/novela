with open('src/app/dashboard/events/[eventId]/page.tsx', 'r') as f:
    content = f.read()

import_statement = 'import { AlertBanner } from "@/components/ui/AlertBanner";\n'
if 'AlertBanner' not in content:
    content = content.replace('import { PaymentProgress } from "@/components/ui/PaymentProgress";', 'import { PaymentProgress } from "@/components/ui/PaymentProgress";\n' + import_statement)


old_banner = """      {/* 3. BLOCKING ISSUES BANNER (Conditional) */}
      {blockingIssues.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center shadow-sm">
          <div className="bg-red-100 p-2 sm:p-3 rounded-full text-red-600 flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-red-900 text-base sm:text-lg tracking-tight mb-1">{blockingIssues.length} blocking issues:</h3>
            <p className="text-red-700 font-semibold text-sm">
              {blockingIssues.join(' • ')}
            </p>
          </div>
          <button className="h-12 px-6 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold rounded-lg shadow-sm touch-manipulation transition-all hover:shadow-md w-full sm:w-auto uppercase tracking-wider text-sm flex items-center justify-center">
            Resolve all →
          </button>
        </div>
      )}"""

new_banner = """      {/* 3. BLOCKING ISSUES BANNER (Conditional) */}
      {blockingIssues.length > 0 && (
        <AlertBanner
          message={`${blockingIssues.length} blocking issues: ${blockingIssues.join(' • ')}`}
          level="critical"
          action="Resolve all →"
          href={`/dashboard/events/${eventId}#tasks`}
        />
      )}"""

content = content.replace(old_banner, new_banner)

with open('src/app/dashboard/events/[eventId]/page.tsx', 'w') as f:
    f.write(content)
