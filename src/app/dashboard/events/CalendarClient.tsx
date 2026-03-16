'use client';

import React, { useState } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Plus
} from 'lucide-react';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays,

} from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type EventType = {
  id: string; type: string; date: string; title: string; time: string;
  services: string[]; venue: string; totalValue: number; balance: string; countdown: number;
};
type AppointmentType = {
  id: string; type: string; date: string; title: string; time: string;
};

export default function CalendarClient({
  initialEvents, initialAppointments
}: {
  initialEvents: EventType[], initialAppointments: AppointmentType[]
}) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // Mock current date: Mar 1, 2026
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2026, 2, 16)); // Mock today: Mar 16, 2026

  const [view, setView] = useState<'month'|'list'>('month');
  const [filterType, setFilterType] = useState<'all'|'weddings'|'quinces'>('all');
  const [filterService, setFilterService] = useState<'all'|'planning'|'dress_rental'>('all');
  const [sidebarTab, setSidebarTab] = useState<'upcoming'|'selected'>('selected');

  // Month navigation
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Calendar grid logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = [];
  let day = startDate;
  while (day <= endDate) {
    calendarDays.push(day);
    day = addDays(day, 1);
  }

  // Filtering Logic
  const filteredEvents = initialEvents.filter(e => {
    if (filterType === 'weddings' && e.type !== 'wedding') return false;
    if (filterType === 'quinces' && e.type !== 'quinceanera') return false;
    if (filterService !== 'all' && !e.services.includes(filterService)) return false;
    return true;
  });

  const filteredAppointments = initialAppointments.filter(() => {
    // If we are filtering strictly for weddings or quinces, maybe hide unrelated appointments
    // But for this mockup, we'll just show them unless specifically filtered out
    return true;
  });

  const getDayItems = (d: Date) => {
    const dayStr = format(d, 'yyyy-MM-dd');
    const evts = filteredEvents.filter(e => e.date === dayStr);
    const apts = filteredAppointments.filter(a => a.date === dayStr);
    return { evts, apts };
  };

  const handleDayClick = (d: Date) => {
    setSelectedDate(d);
    setSidebarTab('selected');
  };

  // Sidebar Data
  const upcomingEvents = filteredEvents.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 6);

  const selectedDayItems = selectedDate ? getDayItems(selectedDate) : { evts: [], apts: [] };

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Topbar */}
      <header className="px-4 sm:px-6 py-4 border-b border-rose-100 flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-[#8B7355] font-medium mb-1">Dashboard › <span className="text-[#C9697A]">Events</span></div>
          <h1 className="font-serif font-bold text-2xl text-[#1C1012] leading-tight flex items-baseline gap-3">
            Events calendar
            <span className="text-sm font-sans font-normal text-gray-500 hidden sm:inline-block">14 active events · 8 weddings · 6 quinceañeras</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setView('month')}
              className={cn("px-3 h-10 rounded-md text-sm font-medium touch-manipulation transition-colors", view === 'month' ? "bg-white text-[#1C1012] shadow-sm" : "text-gray-500 hover:text-[#1C1012]")}
            >
              Month
            </button>
            <button
              onClick={() => setView('list')}
              className={cn("px-3 h-10 rounded-md text-sm font-medium touch-manipulation transition-colors", view === 'list' ? "bg-white text-[#1C1012] shadow-sm" : "text-gray-500 hover:text-[#1C1012]")}
            >
              List
            </button>
          </div>
          <button className="h-13 sm:h-10 px-5 bg-[#C9697A] text-white rounded-md text-base sm:text-sm font-medium hover:brightness-110 active:scale-[0.97] touch-manipulation flex items-center gap-2">
            <Plus className="w-4 h-4" /> New event
          </button>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="px-4 sm:px-6 py-3 border-b border-rose-100 flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8F4F0]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#8B7355] uppercase tracking-wider mr-2">Show:</span>
          {['all', 'weddings', 'quinces'].map(t => (
            <button key={t} onClick={() => setFilterType(t as 'all'|'weddings'|'quinces')} className={cn(
              "h-10 px-3 rounded-full text-sm font-semibold touch-manipulation transition-colors border",
              filterType === t ? "bg-[#1C1012] text-white border-[#1C1012]" : "bg-white text-gray-600 border-gray-200 hover:border-[#C9697A]"
            )}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
          <div className="w-px h-6 bg-rose-200 mx-2 hidden sm:block"></div>
          <span className="text-xs font-bold text-[#8B7355] uppercase tracking-wider mr-2 hidden sm:block">Services:</span>
          <button onClick={() => setFilterService(filterService === 'planning' ? 'all' : 'planning')} className={cn(
            "h-10 px-3 rounded-full text-sm font-semibold touch-manipulation transition-colors border",
            filterService === 'planning' ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-white text-gray-600 border-gray-200 hover:border-blue-200"
          )}>Event planning</button>
          <button onClick={() => setFilterService(filterService === 'dress_rental' ? 'all' : 'dress_rental')} className={cn(
            "h-10 px-3 rounded-full text-sm font-semibold touch-manipulation transition-colors border",
            filterService === 'dress_rental' ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-white text-gray-600 border-gray-200 hover:border-amber-200"
          )}>Dress rental</button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="h-10 w-10 flex items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.97] touch-manipulation">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-serif font-bold text-[#1C1012] min-w-[120px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button onClick={nextMonth} className="h-10 w-10 flex items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.97] touch-manipulation">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Main Layout: Calendar + Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Calendar Grid */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-rose-100 flex-shrink-0 bg-gray-50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex-1 grid grid-cols-7 grid-rows-5 sm:grid-rows-6 border-b border-rose-100">
            {calendarDays.map((d) => {
              const { evts, apts } = getDayItems(d);
              const isToday = isSameDay(d, new Date(2026, 2, 16)); // Mock today
              const isSelected = selectedDate && isSameDay(d, selectedDate);
              const totalChips = evts.length + apts.length;
              const displayEvts = evts.slice(0, 2);
              const displayApts = apts.slice(0, Math.max(0, 2 - evts.length));
              const hiddenCount = totalChips - (displayEvts.length + displayApts.length);

              return (
                <div
                  key={d.toISOString()}
                  onClick={() => handleDayClick(d)}
                  className={cn(
                    "min-h-[80px] border-r border-b border-rose-100 p-1 sm:p-2 cursor-pointer hover:bg-rose-50 transition-colors touch-manipulation group relative",
                    !isSameMonth(d, monthStart) && "bg-gray-50/50",
                    isToday && "ring-2 ring-inset ring-blue-500",
                    isSelected && !isToday && "bg-rose-50 ring-1 ring-inset ring-[#C9697A]"
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={cn(
                      "text-xs sm:text-sm font-semibold w-6 h-6 flex items-center justify-center rounded-full",
                      isToday ? "bg-blue-500 text-white" : "text-gray-700",
                      !isSameMonth(d, monthStart) && !isToday && "text-gray-400"
                    )}>
                      {format(d, 'd')}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    {displayEvts.map(e => (
                      <div key={e.id} className={cn(
                        "text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded truncate",
                        e.type === 'wedding' ? "bg-rose-100 text-rose-800" : "bg-purple-100 text-purple-800"
                      )}>
                        {e.time} {e.title}
                      </div>
                    ))}
                    {displayApts.map(a => {
                      let color = "bg-gray-100 text-gray-800";
                      if(a.type === 'fitting') color = "bg-emerald-100 text-emerald-800";
                      if(a.type === 'decoration') color = "bg-amber-100 text-amber-800";
                      if(a.type === 'consultation') color = "bg-blue-100 text-blue-800";
                      if(a.type === 'pickup') color = "bg-[#d1e7dd] text-[#0f5132]"; // dark green

                      return (
                        <div key={a.id} className={cn("text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded truncate", color)}>
                          {a.time} {a.title}
                        </div>
                      );
                    })}
                    {hiddenCount > 0 && (
                      <div className="text-[10px] sm:text-xs font-bold text-gray-500 px-1 hover:underline">
                        +{hiddenCount} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar Panel */}
        <aside className="hidden lg:flex flex-col w-[280px] sm:w-[320px] bg-[#F8F4F0] border-l border-rose-100 flex-shrink-0 z-10 overflow-hidden">
          <div className="flex border-b border-rose-100">
            <button onClick={() => setSidebarTab('upcoming')} className={cn(
              "flex-1 h-14 text-sm font-bold uppercase tracking-wider touch-manipulation transition-colors",
              sidebarTab === 'upcoming' ? "text-[#1C1012] border-b-2 border-[#C9697A] bg-white" : "text-gray-500 hover:text-[#1C1012] bg-[#F8F4F0]"
            )}>Upcoming</button>
            <button onClick={() => setSidebarTab('selected')} className={cn(
              "flex-1 h-14 text-sm font-bold uppercase tracking-wider touch-manipulation transition-colors",
              sidebarTab === 'selected' ? "text-[#1C1012] border-b-2 border-[#C9697A] bg-white" : "text-gray-500 hover:text-[#1C1012] bg-[#F8F4F0]"
            )}>Selected</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

            {sidebarTab === 'selected' && selectedDate && (
              <div className="mb-2">
                <h3 className="font-serif font-bold text-lg text-[#1C1012]">{format(selectedDate, 'MMM d, yyyy')}</h3>
                <p className="text-sm text-[#8B7355]">{selectedDayItems.evts.length} events, {selectedDayItems.apts.length} appointments</p>
              </div>
            )}

            {/* List to render */}
            {(sidebarTab === 'upcoming' ? upcomingEvents : selectedDayItems.evts).length === 0 && sidebarTab === 'selected' && selectedDayItems.apts.length === 0 ? (
               <div className="text-center py-10">
                 <CalendarIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                 <p className="text-gray-500 font-medium">No events this day</p>
               </div>
            ) : null}

            {(sidebarTab === 'upcoming' ? upcomingEvents : selectedDayItems.evts).map(e => (
              <div key={e.id} className={cn(
                "bg-white rounded-lg p-4 border-l-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98] touch-manipulation",
                e.type === 'wedding' ? "border-l-rose-400" : "border-l-purple-400"
              )}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase",
                      e.type === 'wedding' ? "bg-rose-50 text-rose-700" : "bg-purple-50 text-purple-700"
                    )}>{e.type}</span>
                    <span className="text-xs text-gray-500 font-mono">{e.date} • {e.time}</span>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                    e.countdown <= 7 ? "bg-red-100 text-red-700" :
                    e.countdown <= 14 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                  )}>{e.countdown}d</span>
                </div>
                <h4 className="font-serif font-bold text-[#1C1012] text-lg leading-tight mb-1">{e.title}</h4>
                <p className="text-sm text-gray-500 mb-3">{e.venue}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {e.services.map(s => <span key={s} className="bg-gray-100 text-gray-600 text-[10px] font-semibold px-1.5 py-0.5 rounded">{s.replace('_', ' ')}</span>)}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-rose-50">
                   <span className="font-mono font-bold text-sm text-[#1C1012]">${e.totalValue}</span>
                   <span className={cn(
                     "text-xs font-semibold",
                     e.balance === 'paid' ? "text-emerald-600" :
                     e.balance === 'overdue' ? "text-red-600" : "text-amber-600"
                   )}>{e.balance.toUpperCase()}</span>
                </div>
              </div>
            ))}

            {sidebarTab === 'selected' && selectedDayItems.apts.map(a => {
                let color = "border-l-gray-400 bg-gray-50";
                let badge = "bg-gray-200 text-gray-700";
                if(a.type === 'fitting') { color = "border-l-emerald-400"; badge = "bg-emerald-100 text-emerald-800"; }
                if(a.type === 'decoration') { color = "border-l-amber-400"; badge = "bg-amber-100 text-amber-800"; }
                if(a.type === 'consultation') { color = "border-l-blue-400"; badge = "bg-blue-100 text-blue-800"; }
                if(a.type === 'pickup') { color = "border-l-[#198754]"; badge = "bg-[#d1e7dd] text-[#0f5132]"; }

                return (
                  <div key={a.id} className={cn("bg-white rounded-lg p-3 border-l-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98] touch-manipulation", color)}>
                     <div className="flex justify-between items-start mb-1">
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase", badge)}>{a.type}</span>
                        <span className="text-xs text-gray-500 font-mono">{a.time}</span>
                     </div>
                     <h4 className="font-semibold text-[#1C1012] text-sm mt-1">{a.title}</h4>
                  </div>
                );
            })}
          </div>
        </aside>

      </div>

      {/* Legend Bottom Bar */}
      <div className="px-4 sm:px-6 py-2 border-t border-rose-100 bg-[#FDF5F6] flex-shrink-0 flex flex-wrap items-center gap-3 sm:gap-6 text-xs font-medium text-gray-600">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-rose-200"></div> Wedding</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-purple-200"></div> Quinceañera</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-200"></div> Fitting</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-amber-200"></div> Decoration setup</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-blue-200"></div> Consultation</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#d1e7dd]"></div> Pickup/return</div>
      </div>

    </div>
  );
}
