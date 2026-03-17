"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Scissors, MessageSquare, Package, Plus, Clock, Users, User, X } from "lucide-react";
import { addAppointment, getClientsAndEvents } from "./actions";
import { STAFF } from "./shared";

type ViewType = "week" | "day";

export default function ScheduleClient({ initialData }: { initialData: any }) {
  const [view, setView] = useState<ViewType>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStaff, setSelectedStaff] = useState<string>("all");
  const [hoveredStaff, setHoveredStaff] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ staffId: string, date: Date } | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const startOfWeek = new Date(currentDate);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0,0,0,0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const appointments = initialData.appointments || [];

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
    // Ideally refetch data for the new week here.
    // For simplicity in this implementation we're filtering the initial data (which needs to cover it).
    // In a full implementation we would use a Server Action with useTransition.
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const getAppointmentsForCell = (staffId: string, dayDate: Date) => {
    return appointments.filter((apt: any) => {
      const aptDate = new Date(apt.date);
      return apt.staffId === staffId &&
             aptDate.getDate() === dayDate.getDate() &&
             aptDate.getMonth() === dayDate.getMonth() &&
             aptDate.getFullYear() === dayDate.getFullYear();
    });
  };

  const displayedStaff = selectedStaff === "all" ? STAFF : STAFF.filter(s => s.id === selectedStaff);

  const formatWeekRange = () => {
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${startOfWeek.toLocaleDateString(undefined, opts)} - ${endOfWeek.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8 bg-stone-50 overflow-hidden">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900 mb-2">Staff Schedule</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm h-10">
              <button onClick={handlePrevWeek} className="px-3 py-2 hover:bg-stone-50 border-r border-stone-200 transition-colors">
                <ChevronLeft size={18} className="text-stone-600" />
              </button>
              <div className="px-4 py-2 text-sm font-bold text-stone-700 bg-white">
                {view === "week" ? formatWeekRange() : currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <button onClick={handleNextWeek} className="px-3 py-2 hover:bg-stone-50 border-l border-stone-200 transition-colors">
                <ChevronRight size={18} className="text-stone-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedStaff}
            onChange={e => setSelectedStaff(e.target.value)}
            className="h-13 px-4 rounded-xl border border-stone-200 text-sm font-medium focus:ring-rose-500 focus:border-rose-500 shadow-sm"
          >
            <option value="all">All Staff</option>
            {STAFF.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <div className="flex bg-stone-200 p-1 rounded-xl h-13 items-center">
             <button
               onClick={() => setView("week")}
               className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors h-full flex items-center ${view === "week" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
             >
               Week
             </button>
             <button
               onClick={() => setView("day")}
               className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors h-full flex items-center ${view === "day" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
             >
               Day
             </button>
          </div>
        </div>
      </div>

      {/* SCHEDULE BODY */}
      <div className="flex flex-1 overflow-hidden bg-white border border-stone-200 rounded-2xl shadow-sm">

        {/* SIDEBAR */}
        <div className="w-[140px] border-r border-stone-200 flex flex-col bg-stone-50 shrink-0">
          <div className="h-16 border-b border-stone-200 flex items-center justify-center font-bold text-xs text-stone-500 uppercase tracking-wider bg-white">
            Staff
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {displayedStaff.map(staff => (
              <div
                key={staff.id}
                className={`p-3 border-b border-stone-100 transition-colors ${hoveredStaff === staff.id ? 'bg-rose-50' : ''}`}
                onMouseEnter={() => setHoveredStaff(staff.id)}
                onMouseLeave={() => setHoveredStaff(null)}
                style={{ height: '140px' }} // Fixed row height
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xs shrink-0">
                    {staff.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-stone-900 truncate">{staff.name}</div>
                    <div className="text-xs text-stone-500 truncate">{staff.role}</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-xs font-medium text-stone-500 mb-1 flex justify-between">
                    <span>Capacity</span>
                    <span>3/{staff.capacityHours}h</span>
                  </div>
                  <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                     <div className="h-full bg-rose-400 rounded-full" style={{ width: `${(3 / staff.capacityHours) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="flex-1 overflow-auto custom-scrollbar relative">
          {view === "week" ? (
             <div className="min-w-[800px]">
               {/* Grid Header */}
               <div className="grid grid-cols-7 sticky top-0 z-10 bg-white shadow-sm">
                 {weekDays.map((d, i) => (
                   <div key={i} className={`h-16 border-b border-r border-stone-200 flex flex-col items-center justify-center ${d.toDateString() === new Date().toDateString() ? 'bg-rose-50 text-rose-800' : 'bg-white'}`}>
                     <div className="text-xs font-bold uppercase tracking-wider text-stone-500">{d.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                     <div className={`text-sm font-bold ${d.toDateString() === new Date().toDateString() ? 'text-rose-800' : 'text-stone-900'}`}>{d.getDate()}</div>
                   </div>
                 ))}
               </div>

               {/* Grid Body */}
               <div>
                 {displayedStaff.map(staff => (
                   <div
                     key={staff.id}
                     className="grid grid-cols-7"
                     style={{ height: '140px' }}
                     onMouseEnter={() => setHoveredStaff(staff.id)}
                     onMouseLeave={() => setHoveredStaff(null)}
                   >
                     {weekDays.map((d, i) => {
                       const cellApts = getAppointmentsForCell(staff.id, d);
                       const isHovered = hoveredStaff === staff.id;
                       return (
                         <div
                           key={i}
                           className={`border-b border-r border-stone-100 p-2 relative group transition-colors ${isHovered ? 'bg-rose-50/30' : ''}`}
                         >
                           {/* Add Button overlay */}
                           <button
                             onClick={() => { setSelectedCell({ staffId: staff.id, date: d }); setIsAddModalOpen(true); }}
                             className="absolute top-1 right-1 p-1 bg-white text-stone-400 hover:text-rose-600 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                             title="Add Appointment"
                           >
                             <Plus size={14} />
                           </button>

                           {/* Appointments */}
                           <div className="space-y-1.5 max-h-full overflow-y-auto no-scrollbar">
                             {cellApts.map((apt: any) => (
                               <div
                                 key={apt.id}
                                 onClick={() => setSelectedAppointment(apt)}
                                 className={`p-1.5 rounded-md text-xs border cursor-pointer hover:shadow-md transition-shadow ${getAptColor(apt.type)}`}
                               >
                                 <div className="font-bold truncate">{apt.clientFirstName} {apt.clientLastName}</div>
                                 <div className="flex items-center justify-between mt-0.5">
                                   <div className="opacity-80 flex items-center gap-1">
                                      <Clock size={10} />
                                      {new Date(apt.date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                                   </div>
                                   {getAptIcon(apt.type)}
                                 </div>
                               </div>
                             ))}
                           </div>
                         </div>
                       )
                     })}
                   </div>
                 ))}
               </div>
             </div>
          ) : (
            <div className="min-w-[600px] h-[800px] flex relative">
              {/* Day View Timeline */}
              <div className="w-16 border-r border-stone-200 shrink-0 bg-stone-50 pt-10">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-16 border-b border-stone-200 text-xs text-stone-400 text-right pr-2 pt-1 font-medium">
                    {i + 9}:00
                  </div>
                ))}
              </div>
              <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${displayedStaff.length}, minmax(0, 1fr))` }}>
                {displayedStaff.map(staff => (
                  <div key={staff.id} className="border-r border-stone-200 relative">
                    {/* Header */}
                    <div className="h-10 bg-white border-b border-stone-200 sticky top-0 flex items-center justify-center font-bold text-sm text-stone-700 z-10">
                      {staff.name}
                    </div>
                    {/* Grid lines */}
                    <div className="relative" style={{ height: `${12 * 64}px` }}>
                      {Array.from({ length: 12 }).map((_, i) => (
                         <div key={i} className="absolute w-full border-b border-stone-100" style={{ top: `${i * 64}px`, height: '64px' }} />
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
                             className={`absolute left-1 right-1 p-2 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-all overflow-hidden z-20 ${getAptColor(apt.type)}`}
                             style={{ top: `${topPx}px`, height: `${heightPx - 4}px` }}
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
      </div>

      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
      {isAddModalOpen && selectedCell && (
        <AddAppointmentModal
          staffId={selectedCell.staffId}
          date={selectedCell.date}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  );
}

function getAptColor(type: string) {
  switch(type) {
    case 'consultation': return 'bg-blue-50 border-blue-200 text-blue-900';
    case 'fitting': return 'bg-rose-50 border-rose-200 text-rose-900';
    case 'pickup': return 'bg-green-50 border-green-200 text-green-900';
    default: return 'bg-stone-100 border-stone-200 text-stone-900';
  }
}

function getAptIcon(type: string) {
  switch(type) {
    case 'consultation': return <MessageSquare size={12} />;
    case 'fitting': return <Scissors size={12} />;
    case 'pickup': return <Package size={12} />;
        default: return null;
  }
}

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


// Append Appointment Detail Modal functionality
// I need to patch the file instead


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
