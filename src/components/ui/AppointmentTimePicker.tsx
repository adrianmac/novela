"use client";

import { useState, useEffect } from "react";
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeSlot {
  time: string; // HH:mm
  available: boolean;
}

interface AppointmentTimePickerProps {
  orgId: string;
  staffId?: string;
  onSelect: (data: { date: Date; startTime: string; endTime: string; staffId?: string }) => void;
  className?: string;
}

export function AppointmentTimePicker({ orgId, staffId = 'any', onSelect, className }: AppointmentTimePickerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [slots, setSlots] = useState<Record<string, TimeSlot[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date, time: string } | null>(null);

  // Desktop shows a week, Mobile shows a single day. We'll use CSS to hide/show columns.
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start

  const fetchAvailability = async (start: Date, end: Date) => {
    setIsLoading(true);
    try {
      const startStr = format(start, 'yyyy-MM-dd');
      const endStr = format(end, 'yyyy-MM-dd');
      const res = await fetch(`/api/availability?startDate=${startStr}&endDate=${endStr}&staffId=${staffId}`);
      if (res.ok) {
        const data = await res.json();
        setSlots(data.slots);
      }
    } catch (e) {
      console.error("Error fetching slots", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch a full week of availability
    const weekEnd = addDays(weekStart, 6);
    fetchAvailability(weekStart, weekEnd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart, staffId]);

  const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));

  // Mobile swipe navigation for single day view
  const handleNextDay = () => setCurrentDate(addDays(currentDate, 1));
  const handlePrevDay = () => setCurrentDate(subDays(currentDate, 1));

  const handleSlotClick = (dateStr: string, time: string) => {
    const slotDate = new Date(`${dateStr}T${time}:00`);
    setSelectedSlot({ date: slotDate, time });

    // Calculate end time (30 mins later)
    const endTime = new Date(slotDate.getTime() + 30 * 60000);
    const endTimeStr = format(endTime, 'HH:mm');

    onSelect({
      date: slotDate,
      startTime: time,
      endTime: endTimeStr,
      staffId: staffId === 'any' ? undefined : staffId
    });
  };

  const renderSlotList = (dateStr: string, slotData: TimeSlot[] = []) => {
    const morning = slotData.filter(s => parseInt(s.time.split(':')[0]) < 12);
    const afternoon = slotData.filter(s => {
      const h = parseInt(s.time.split(':')[0]);
      return h >= 12 && h < 17;
    });
    const evening = slotData.filter(s => parseInt(s.time.split(':')[0]) >= 17);

    const renderSection = (title: string, slots: TimeSlot[]) => (
      <div className="mb-6">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 border-b pb-1">{title}</h4>
        <div className="space-y-2">
          {slots.map((s, i) => {
             const isSelected = selectedSlot && format(selectedSlot.date, 'yyyy-MM-dd') === dateStr && selectedSlot.time === s.time;
             return (
               <button
                 key={i}
                 disabled={!s.available}
                 onClick={() => handleSlotClick(dateStr, s.time)}
                 className={cn(
                   "w-full py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 border",
                   !s.available
                     ? "bg-gray-50 text-gray-400 border-transparent line-through cursor-not-allowed opacity-60"
                     : isSelected
                     ? "bg-blue-600 text-white border-blue-600 shadow-md transform scale-[1.02]"
                     : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-700 hover:shadow-sm"
                 )}
               >
                 {s.time}
                 {s.available && !isSelected && <span className="block text-[10px] text-gray-400 font-normal">Available</span>}
                 {isSelected && <span className="block text-[10px] text-blue-100 font-normal">Selected</span>}
               </button>
             );
          })}
          {slots.length === 0 && <div className="text-sm text-gray-400 italic">No slots</div>}
        </div>
      </div>
    );

    return (
      <div className="flex-1 min-w-[140px] px-2 snap-center">
        {renderSection('Morning', morning)}
        {renderSection('Afternoon', afternoon)}
        {renderSection('Evening', evening)}
      </div>
    );
  };

  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  return (
    <div className={cn("bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col", className)}>

      {/* Header Navigation */}
      <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center sticky top-0 z-10">
        <button onClick={handlePrevWeek} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 hover:shadow-sm transition-all text-gray-600 hover:text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 font-medium text-gray-800 bg-white px-4 py-1.5 rounded-full border shadow-sm">
          <CalendarIcon className="w-4 h-4 text-blue-600" />
          {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
        </div>
        <button onClick={handleNextWeek} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 hover:shadow-sm transition-all text-gray-600 hover:text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 relative min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Mobile View (Single Day Carousel) */}
        <div className="md:hidden">
            {/* Day selector for mobile */}
            <div className="flex overflow-x-auto gap-2 pb-4 snap-x no-scrollbar">
                {days.map((d, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentDate(d)}
                        className={cn(
                            "flex-col items-center justify-center p-3 rounded-xl min-w-[64px] border snap-center transition-all",
                            isSameDay(d, currentDate) ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm" : "bg-white border-gray-100 text-gray-500 hover:bg-gray-50"
                        )}
                    >
                        <span className="text-xs uppercase font-bold block mb-1">{format(d, 'EEE')}</span>
                        <span className="text-lg font-light">{format(d, 'd')}</span>
                    </button>
                ))}
            </div>

            <div className="mt-4 border-t pt-4">
               {renderSlotList(format(currentDate, 'yyyy-MM-dd'), slots[format(currentDate, 'yyyy-MM-dd')])}
            </div>
        </div>

        {/* Desktop View (7 Day Columns) */}
        <div className="hidden md:flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {days.map((d, i) => {
            const dateStr = format(d, 'yyyy-MM-dd');
            const isToday = isSameDay(d, new Date());
            return (
              <div key={i} className={cn("flex-1 min-w-[140px] flex flex-col border-r last:border-0 pr-4 last:pr-0", isToday && "bg-blue-50/30 rounded-lg p-2 -m-2")}>
                <div className="text-center mb-6 sticky top-0 bg-white/95 backdrop-blur-sm py-2 z-10 border-b">
                  <span className={cn("text-xs font-bold uppercase tracking-widest block mb-1", isToday ? "text-blue-600" : "text-gray-500")}>
                    {format(d, 'EEEE')}
                  </span>
                  <span className={cn("text-xl font-light", isToday ? "text-blue-900" : "text-gray-900")}>
                    {format(d, 'MMM d')}
                  </span>
                </div>
                {renderSlotList(dateStr, slots[dateStr])}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
