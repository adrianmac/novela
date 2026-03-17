const fs = require('fs');
const path = './src/app/dashboard/staff/schedule/ScheduleClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add state for Appointment Details
content = content.replace(
  'const [selectedCell, setSelectedCell] = useState<{ staffId: string, date: Date } | null>(null);',
  'const [selectedCell, setSelectedCell] = useState<{ staffId: string, date: Date } | null>(null);\n  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);'
);

// Add click handler to appointment div
content = content.replace(
  '<div \n                                 key={apt.id} \n                                 className={`p-1.5 rounded-md text-xs border cursor-pointer hover:shadow-md transition-shadow ${getAptColor(apt.type)}`}\n                               >',
  '<div \n                                 key={apt.id} \n                                 onClick={() => setSelectedAppointment(apt)}\n                                 className={`p-1.5 rounded-md text-xs border cursor-pointer hover:shadow-md transition-shadow ${getAptColor(apt.type)}`}\n                               >'
);

// Add AppointmentDetailModal to render
content = content.replace(
  '      {isAddModalOpen && selectedCell && (',
  `      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
      {isAddModalOpen && selectedCell && (`
);

// Add AppointmentDetailModal Component
content += `\n
function AppointmentDetailModal({ appointment, onClose }: { appointment: any, onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-stone-900/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-stone-100">
          <h2 className="font-serif text-2xl font-bold text-stone-900">Appointment Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Client</div>
            <div className="font-medium text-stone-900">{appointment.clientFirstName} {appointment.clientLastName}</div>
          </div>
          <div>
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Time</div>
            <div className="font-medium text-stone-900">{new Date(appointment.date).toLocaleString(undefined, { weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</div>
          </div>
          <div>
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Staff</div>
            <div className="font-medium text-stone-900">{appointment.staffName}</div>
          </div>
          <div>
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Type</div>
            <div className="font-medium text-stone-900 capitalize">{appointment.type.replace('_', ' ')}</div>
          </div>
          <div>
             <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Status</div>
             <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold capitalize">{appointment.status}</span>
          </div>
        </div>

        <div className="p-6 border-t border-stone-100 flex gap-4">
           <button onClick={onClose} className="flex-1 h-13 font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(path, content);
