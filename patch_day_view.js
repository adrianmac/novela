const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'src/app/dashboard/staff/schedule/ScheduleClient.tsx');
let code = fs.readFileSync(target, 'utf8');

const blockToReplace = `          ) : (
            <div className="min-w-[600px] h-[800px] flex">
              {/* Day View Timeline Implementation - simplified for demo */}
              <div className="w-16 border-r border-stone-200 shrink-0 bg-stone-50">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-16 border-b border-stone-200 text-xs text-stone-400 text-right pr-2 pt-1 font-medium">
                    {i + 9} AM
                  </div>
                ))}
              </div>
              <div className="flex-1 grid" style={{ gridTemplateColumns: \`repeat(\${displayedStaff.length}, minmax(0, 1fr))\` }}>
                {displayedStaff.map(staff => (
                  <div key={staff.id} className="border-r border-stone-200 relative">
                    {/* Header */}
                    <div className="h-10 bg-white border-b border-stone-200 sticky top-0 flex items-center justify-center font-bold text-sm text-stone-700 z-10">
                      {staff.name}
                    </div>
                    {/* Grid lines */}
                    {Array.from({ length: 12 }).map((_, i) => (
                       <div key={i} className="h-16 border-b border-stone-100 w-full" />
                    ))}
                    {/* Render exact positioning here in full implementation */}
                    <div className="absolute top-12 left-0 right-0 bottom-0 p-2">
                      {getAppointmentsForCell(staff.id, currentDate).map((apt: any) => (
                        <div key={apt.id} className={\`p-2 rounded-lg border shadow-sm mb-2 \${getAptColor(apt.type)}\`}>
                           <div className="font-bold">{apt.clientFirstName} {apt.clientLastName}</div>
                           <div className="text-xs opacity-80 mt-1">{new Date(apt.date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</div>
                           <div className="text-xs font-medium mt-1 uppercase tracking-wider">{apt.type.replace('_', ' ')}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>`;

const newBlock = `          ) : (
            <div className="min-w-[600px] h-[800px] flex relative">
              {/* Day View Timeline */}
              <div className="w-16 border-r border-stone-200 shrink-0 bg-stone-50 pt-10">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-16 border-b border-stone-200 text-xs text-stone-400 text-right pr-2 pt-1 font-medium">
                    {i + 9}:00
                  </div>
                ))}
              </div>
              <div className="flex-1 grid" style={{ gridTemplateColumns: \`repeat(\${displayedStaff.length}, minmax(0, 1fr))\` }}>
                {displayedStaff.map(staff => (
                  <div key={staff.id} className="border-r border-stone-200 relative">
                    {/* Header */}
                    <div className="h-10 bg-white border-b border-stone-200 sticky top-0 flex items-center justify-center font-bold text-sm text-stone-700 z-10">
                      {staff.name}
                    </div>
                    {/* Grid lines */}
                    <div className="relative" style={{ height: \`\${12 * 64}px\` }}>
                      {Array.from({ length: 12 }).map((_, i) => (
                         <div key={i} className="absolute w-full border-b border-stone-100" style={{ top: \`\${i * 64}px\`, height: '64px' }} />
                      ))}
                      {/* Exact positioning of appointments */}
                      {getAppointmentsForCell(staff.id, currentDate).map((apt: any) => {
                         const d = new Date(apt.date);
                         // Convert time to pixels: (hours from 9 AM) * 64 + (minutes / 60) * 64
                         const startHour = d.getHours();
                         const startMinute = d.getMinutes();
                         const minutesFrom9AM = (startHour - 9) * 60 + startMinute;

                         // If before 9 AM, skip or clamp
                         if (minutesFrom9AM < 0) return null;

                         const topPx = (minutesFrom9AM / 60) * 64;

                         // Assume 1 hour duration for visualization purposes (could make this dynamic later)
                         const durationMinutes = 60;
                         const heightPx = (durationMinutes / 60) * 64;

                         return (
                           <div
                             key={apt.id}
                             onClick={() => setSelectedAppointment(apt)}
                             className={\`absolute left-1 right-1 p-2 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-all overflow-hidden z-20 \${getAptColor(apt.type)}\`}
                             style={{ top: \`\${topPx}px\`, height: \`\${heightPx - 4}px\` }}
                           >
                             <div className="font-bold text-xs truncate">{apt.clientFirstName} {apt.clientLastName}</div>
                             <div className="flex justify-between items-center mt-0.5">
                               <div className="text-[10px] opacity-80">{d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</div>
                               {getAptIcon(apt.type)}
                             </div>
                           </div>
                         );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>`;

code = code.replace(blockToReplace, newBlock);
fs.writeFileSync(target, code);
console.log("Successfully patched Day View timeline.");
