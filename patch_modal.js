const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'src/app/dashboard/staff/schedule/ScheduleClient.tsx');
let code = fs.readFileSync(target, 'utf8');

// Need to replace the AddAppointmentModal component definition
const modalStart = code.indexOf('function AddAppointmentModal(');
const modalEnd = code.indexOf('// Append Appointment Detail Modal functionality');

if (modalStart !== -1 && modalEnd !== -1) {
  const newModal = `
import { addAppointment, getClientsAndEvents } from "./actions";

function AddAppointmentModal({ staffId, date, onClose }: { staffId: string, date: Date, onClose: () => void }) {
  const staff = STAFF.find(s => s.id === staffId);
  const [time, setTime] = useState("10:00");
  const [type, setType] = useState("consultation");
  const [clientId, setClientId] = useState("");
  const [eventId, setEventId] = useState("");
  const [data, setData] = useState<{clients: any[], events: any[]}>({ clients: [], events: [] });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getClientsAndEvents().then(setData);
  }, []);

  const handleSave = async () => {
    if (!clientId || !eventId) {
      setError("Client and Event are required.");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    // Construct datetime
    const [hours, minutes] = time.split(':');
    const aptDate = new Date(date);
    aptDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    const res = await addAppointment({
      staffId,
      date: aptDate,
      type,
      clientId: parseInt(clientId, 10),
      eventId: parseInt(eventId, 10)
    });

    if (res?.error) {
      setError(res.error);
      setIsSubmitting(false);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-stone-100">
          <h2 className="font-serif text-2xl font-bold text-stone-900">Add Appointment</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100 text-sm">
             <div className="flex items-center gap-2 font-medium text-stone-700">
               <User size={16} className="text-stone-400" /> {staff?.name}
             </div>
             <div className="flex items-center gap-2 font-medium text-stone-700">
               <CalendarIcon size={16} className="text-stone-400" /> {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
             </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">Time</label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full h-13 px-4 rounded-xl border border-stone-300 focus:ring-rose-500 focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full h-13 px-4 rounded-xl border border-stone-300 focus:ring-rose-500 focus:border-rose-500 bg-white">
              <option value="consultation">Consultation</option>
              <option value="fitting">Fitting</option>
              <option value="pickup">Pickup</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">Client</label>
            <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full h-13 px-4 rounded-xl border border-stone-300 focus:ring-rose-500 focus:border-rose-500 bg-white">
              <option value="">Select a client...</option>
              {data.clients.map(c => (
                <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">Event</label>
            <select value={eventId} onChange={e => setEventId(e.target.value)} disabled={!clientId} className="w-full h-13 px-4 rounded-xl border border-stone-300 focus:ring-rose-500 focus:border-rose-500 bg-white disabled:bg-stone-50 disabled:text-stone-400">
              <option value="">Select an event...</option>
              {data.events.filter(e => !clientId || e.clientId === parseInt(clientId, 10)).map(e => (
                <option key={e.id} value={e.id}>{e.type.replace('_', ' ')} - {new Date(e.date).toLocaleDateString()}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-6 border-t border-stone-100 flex gap-4">
          <button onClick={onClose} disabled={isSubmitting} className="flex-1 h-13 font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSave} disabled={isSubmitting} className="flex-1 h-13 font-bold text-white bg-rose-800 hover:bg-rose-900 rounded-xl transition-colors disabled:opacity-50">
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

`;

  // also need to add useEffect to imports
  let importsEnd = code.lastIndexOf('import ');
  let importBlockEnd = code.indexOf(';', importsEnd) + 1;
  let hasUseEffect = code.includes('useEffect');

  if (!hasUseEffect) {
    code = code.replace('import { useState }', 'import { useState, useEffect }');
  }

  code = code.slice(0, modalStart) + newModal + code.slice(modalEnd);

  // We need to move the import { addAppointment... } to the top of the file
  let newModalImportIndex = code.indexOf('import { addAppointment');
  if (newModalImportIndex !== -1) {
     let importString = 'import { addAppointment, getClientsAndEvents } from "./actions";\n';
     code = code.replace(importString, '');
     code = importString + code;
  }

  fs.writeFileSync(target, code);
  console.log("Successfully patched AddAppointmentModal");
} else {
  console.log("Could not find modal definition.");
}
