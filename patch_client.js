const fs = require('fs');

const fileContent = fs.readFileSync('src/app/dashboard/inventory/InventoryClient.tsx', 'utf8');

// 1. Add checkDressAvailability to imports
let newContent = fileContent.replace(
  "import { addInventoryItem, reserveItem, markItemStatus, logReturn, searchEvents } from './actions';",
  "import { addInventoryItem, reserveItem, markItemStatus, logReturn, searchEvents, checkDressAvailability } from './actions';"
);

// 2. Add state variables for availability
newContent = newContent.replace(
  "const [reserveError, setReserveError] = useState('');",
  `const [reserveError, setReserveError] = useState('');
  const [availabilityCheck, setAvailabilityCheck] = useState<any>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);`
);

// 3. Add effect to check availability when dates or selectedEvent changes
newContent = newContent.replace(
  /const selectEventForReservation = \(evt: any\) => {[\s\S]*?};/,
  `const selectEventForReservation = (evt: any) => {
    setSelectedEvent(evt);
    // Auto populate dates (pickup = event - 1 day, return = event + 2 days)
    const eDate = new Date(evt.date);
    const pDate = new Date(eDate); pDate.setDate(pDate.getDate() - 1);
    const rDate = new Date(eDate); rDate.setDate(rDate.getDate() + 2);
    setReserveDates({
      pickup: pDate.toISOString().split('T')[0],
      return: rDate.toISOString().split('T')[0]
    });
  };

  useEffect(() => {
    async function checkAvailability() {
      if (reserveModalOpen && selectedEvent && reserveDates.pickup && reserveDates.return) {
        setIsCheckingAvailability(true);
        setAvailabilityCheck(null);
        try {
          const res = await checkDressAvailability(reserveModalOpen.item.id, reserveDates.pickup, reserveDates.return);
          setAvailabilityCheck(res);
        } catch (e) {
          console.error("Failed to check availability", e);
        }
        setIsCheckingAvailability(false);
      } else {
        setAvailabilityCheck(null);
      }
    }

    // Add small debounce
    const timeout = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeout);
  }, [reserveDates.pickup, reserveDates.return, selectedEvent, reserveModalOpen]);`
);

// 4. Update Modal UI
const modalContentRegex = /<div className="grid grid-cols-2 gap-4">[\s\S]*?{reserveError && <div className="text-red-600 bg-red-50 p-3 rounded-lg text-sm font-semibold border border-red-200">{reserveError}<\/div>}\s*<\/div>/;

newContent = newContent.replace(modalContentRegex, `<div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-rose-800">Pickup Date *</label>
                    <input type="date" value={reserveDates.pickup} onChange={e => setReserveDates({...reserveDates, pickup: e.target.value})} className="w-full h-13 sm:h-11 border border-rose-200 rounded-xl px-3 mt-1 outline-none focus:ring-2 focus:ring-rose-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-rose-800">Return Date *</label>
                    <input type="date" value={reserveDates.return} onChange={e => setReserveDates({...reserveDates, return: e.target.value})} className="w-full h-13 sm:h-11 border border-rose-200 rounded-xl px-3 mt-1 outline-none focus:ring-2 focus:ring-rose-500" />
                  </div>
                </div>

                <div className="mt-4">
                  {isCheckingAvailability ? (
                    <div className="flex items-center gap-2 text-rose-600 text-sm font-medium">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-600"></div>
                      Checking availability...
                    </div>
                  ) : availabilityCheck ? (
                    availabilityCheck.available ? (
                      <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-sm font-semibold">
                        <CheckCircle2 className="w-5 h-5" />
                        This dress is available for your dates
                      </div>
                    ) : (
                      <div className="text-red-800 bg-red-50 p-4 rounded-lg border border-red-200 text-sm">
                        <div className="font-bold flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          Unavailable
                        </div>
                        {availabilityCheck.conflicts.map((c: any, i: number) => (
                          <div key={i} className="mb-3 font-medium text-red-700/80">
                            This dress is already reserved from {new Date(c.pickupDate).toLocaleDateString()} to {new Date(c.returnDate).toLocaleDateString()} for {c.clientName}.
                          </div>
                        ))}

                        {availabilityCheck.alternatives && availabilityCheck.alternatives.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-red-200/50">
                            <div className="font-bold mb-2 text-red-900">Suggested alternatives:</div>
                            <div className="space-y-2">
                              {availabilityCheck.alternatives.map((alt: any) => (
                                <div key={alt.id} className="flex justify-between items-center bg-white p-2 rounded border border-red-100 shadow-sm">
                                  <div>
                                    <div className="font-bold text-gray-900 text-xs">{alt.sku} - {alt.name}</div>
                                    <div className="text-[10px] text-gray-500">{alt.size} • {alt.category}</div>
                                  </div>
                                  <button onClick={() => {
                                      setReserveModalOpen({item: alt});
                                      setAvailabilityCheck(null);
                                    }} className="text-xs bg-rose-100 hover:bg-rose-200 text-rose-900 px-3 py-1.5 rounded-lg font-bold transition-colors">
                                    Select
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  ) : null}
                </div>

                {reserveError && <div className="text-red-600 bg-red-50 p-3 rounded-lg text-sm font-semibold border border-red-200 mt-4">{reserveError}</div>}
              </div>`);

newContent = newContent.replace(
  "setReserveModalOpen(null); setSelectedEvent(null); setEventSearch(''); setReserveError('');",
  "setReserveModalOpen(null); setSelectedEvent(null); setEventSearch(''); setReserveError(''); setAvailabilityCheck(null);"
);

newContent = newContent.replace(
  "disabled={isReserving}",
  "disabled={isReserving || isCheckingAvailability || (availabilityCheck && !availabilityCheck.available)}"
);

fs.writeFileSync('src/app/dashboard/inventory/InventoryClient.tsx', newContent);
console.log("Client patched successfully!");
