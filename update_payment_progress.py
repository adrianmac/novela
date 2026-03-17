import re

with open('src/app/dashboard/events/[eventId]/page.tsx', 'r') as f:
    content = f.read()

# Add import
import_statement = "import { PaymentProgress } from \"@/components/ui/PaymentProgress\";\n"
if "PaymentProgress" not in content:
    content = content.replace('import { notFound } from "next/navigation";', 'import { notFound } from "next/navigation";\n' + import_statement)


# Replace the old progress bar with the new component
old_progress = """          <div className="min-w-[140px] sm:min-w-[180px] flex flex-col justify-center">
             <div className="flex justify-between items-end mb-2">
               <span className="text-xs font-semibold uppercase tracking-widest text-rose-700/70">Paid</span>
               <span className="text-sm font-bold font-mono text-emerald-700">${(totalCollected/100).toLocaleString()}</span>
             </div>
             <div className="w-full bg-rose-100 h-2.5 rounded-full overflow-hidden shadow-inner">
               <div
                 className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
                 style={{ width: `${progressPercent}%` }}
               ></div>
             </div>
             <div className="mt-2 text-right">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">of ${(totalFinancials/100).toLocaleString()}</span>
             </div>
          </div>"""

new_progress = """          <div className="min-w-[140px] sm:min-w-[220px] flex flex-col justify-center">
             <PaymentProgress
                totalAmount={totalFinancials}
                paidAmount={totalCollected}
                milestones={paymentsRows}
             />
          </div>"""

content = content.replace(old_progress, new_progress)

with open('src/app/dashboard/events/[eventId]/page.tsx', 'w') as f:
    f.write(content)
