import { PaymentProgress } from "@/components/ui/PaymentProgress";
import React from 'react';
import {
  ChevronRight, Plus, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { db } from "@/db";
import { events, clients, appointments, eventServices, payments, tasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from 'next/navigation';



export const revalidate = 0;

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Client Component to handle forms and interactivity
import { DetailInteractions } from './DetailInteractions';

export default async function EventDetail({ params }: { params: { eventId: string } }) {
  const { eventId } = params;

  // 1. Fetch Event
  const [eventRow] = await db.select().from(events).where(eq(events.id, eventId));
  if (!eventRow) {
    notFound();
  }

  // 2. Fetch Client
  const [clientRow] = await db.select().from(clients).where(eq(clients.id, eventRow.clientId));

  // 3. Fetch Services
  const servicesRows = await db.select().from(eventServices).where(eq(eventServices.eventId, eventId));

  // 4. Fetch Appointments
  const appointmentsRows = await db.select().from(appointments).where(eq(appointments.eventId, eventId));

  // 5. Fetch Payments
  const paymentsRows = await db.select().from(payments).where(eq(payments.eventId, eventId));

  // 6. Fetch Tasks
  const tasksRows = await db.select().from(tasks).where(eq(tasks.eventId, eventId));

  // Assemble the UI shape
  const now = new Date();
  const eventDate = new Date(eventRow.date);
  const diffTime = eventDate.getTime() - now.getTime();
  const countdown = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isDanger = countdown < 14;

  const totalCollected = paymentsRows.filter(p => p.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
  const totalFinancials = eventRow.totalValue;
  const progressPercent = Math.min(100, Math.round((totalCollected / totalFinancials) * 100));

  const blockingIssues = [
    ...paymentsRows.filter(p => p.status === 'overdue').map(p => `Payment: ${p.milestone} overdue`),
    ...tasksRows.filter(t => new Date(t.dueDate || '') < now && t.status !== 'completed').map(t => `Task: ${t.title} overdue`)
  ];

  const serviceCardsData = servicesRows.map(s => {
    return {
      name: s.serviceType,
      status: 'ready',
      info: 'View details',
      staff: 'Staff',
      link: 'Go →'
    }
  });

  const apptTimeline = appointmentsRows.sort((a,b) => a.date.getTime() - b.date.getTime()).map(a => ({
    id: a.id,
    type: a.type,
    title: a.type,
    staff: a.staffName || 'Unassigned',
    date: a.date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
    status: a.status
  }));

  // Mock notes (we didn't create a table for this)
  const notesData = [
    { id: '1', author: 'Elena R.', initials: 'ER', role: 'coordinator', text: 'Spoke with the florist. Centerpieces ready soon.', time: '2 hours ago' }
  ];

  return (
    <div className="flex flex-col gap-6 lg:gap-8 pb-10">

      {/* 1. TOP NAVIGATION / BREADCRUMB */}
      <nav className="flex items-center gap-2 text-sm font-semibold text-rose-800/60 uppercase tracking-widest bg-rose-50/50 p-4 rounded-xl border border-rose-100 shadow-sm mt-2 sm:mt-0 overflow-x-auto whitespace-nowrap">
        <a href="/dashboard" className="hover:text-rose-900 transition-colors">Dashboard</a>
        <ChevronRight className="w-4 h-4 text-rose-300" />
        <a href="/dashboard/events" className="hover:text-rose-900 transition-colors">Events</a>
        <ChevronRight className="w-4 h-4 text-rose-300" />
        <span className="text-rose-950 truncate max-w-[200px] sm:max-w-none">{clientRow.firstName} & {clientRow.lastName} — {eventRow.type}</span>
      </nav>

      {/* 2. HERO / QUICK STATS */}
      <section className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-10 justify-between items-start touch-manipulation">

        {/* Left: Client & Event Details */}
        <div className="flex gap-4 sm:gap-6 items-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-100 flex items-center justify-center text-2xl sm:text-3xl font-serif font-bold text-rose-900 flex-shrink-0 shadow-sm">
            {clientRow.firstName[0]}{clientRow.lastName[0]}
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-rose-950 leading-tight mb-2 tracking-tight">
              {clientRow.firstName} & {clientRow.lastName}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base font-semibold text-rose-700/80 uppercase tracking-wider bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 w-fit">
              <span>{eventRow.type}</span>
              <span className="text-rose-300">•</span>
              <span className="text-rose-900 font-bold">{eventDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Right: Countdown & Financial Progress */}
        <div className="flex gap-6 sm:gap-10 w-full sm:w-auto mt-4 sm:mt-0 border-t border-rose-100 sm:border-0 pt-6 sm:pt-0">
          <div className="text-center bg-rose-50 px-6 py-4 rounded-xl border border-rose-100 shadow-sm min-w-[120px]">
            <span className={cn(
              "text-3xl sm:text-4xl font-bold font-serif block mb-1 leading-none tracking-tight",
              isDanger ? "text-red-600" : "text-rose-900"
            )}>
              {countdown}
            </span>
            <span className={cn(
              "text-xs font-semibold uppercase tracking-widest block",
              isDanger ? "text-red-500" : "text-rose-700/70"
            )}>Days left</span>
          </div>

          <div className="min-w-[140px] sm:min-w-[220px] flex flex-col justify-center">
             <PaymentProgress
                totalAmount={totalFinancials}
                paidAmount={totalCollected}
                milestones={paymentsRows}
             />
          </div>
        </div>
      </section>

      {/* 3. BLOCKING ISSUES BANNER (Conditional) */}
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
      )}

      {/* 4. MAIN CONTENT AREA (2 Columns on large screens) */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

        {/* LEFT MAIN COLUMN */}
        <div className="flex-1 w-full space-y-6 lg:space-y-8">

          {/* Services Grid */}
          <section>
            <h2 className="font-serif font-bold text-2xl text-rose-950 mb-4 sm:mb-6 tracking-tight flex items-center gap-3">
              Event Services
              <button className="h-8 w-8 rounded-full bg-rose-100 text-rose-700 hover:bg-rose-200 hover:text-rose-900 flex items-center justify-center transition-colors shadow-sm">
                <Plus className="w-5 h-5" />
              </button>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
               {serviceCardsData.map((s, i) => (
                 <div key={i} className="bg-white border-2 border-rose-100 rounded-xl p-4 sm:p-5 hover:border-rose-300 transition-colors shadow-sm touch-manipulation cursor-pointer group">
                   <div className="flex justify-between items-start mb-3">
                     <h3 className="font-bold text-rose-950 text-base capitalize tracking-tight">{s.name.replace('_', ' ')}</h3>
                     <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-widest shadow-sm">
                       {s.status}
                     </span>
                   </div>
                   <p className="text-sm font-semibold text-rose-700/80 mb-4">{s.info}</p>
                   <div className="pt-3 sm:pt-4 border-t border-rose-50 flex justify-between items-center mt-auto">
                     <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">{s.staff}</span>
                     <span className="text-xs font-bold text-rose-600 group-hover:text-rose-900 transition-colors">{s.link}</span>
                   </div>
                 </div>
               ))}
            </div>
          </section>

          {/* Appointment Timeline */}
          <section className="bg-white rounded-2xl border border-rose-100 p-6 sm:p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-serif font-bold text-2xl text-rose-950 tracking-tight">Timeline</h2>
              <button className="h-10 px-4 sm:px-5 bg-rose-50 text-rose-800 hover:bg-rose-100 font-bold rounded-lg text-sm touch-manipulation transition-colors shadow-sm uppercase tracking-wider flex items-center gap-2 border border-rose-200">
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            <div className="relative">
              {/* Vertical line connecting dots */}
              <div className="absolute left-4 top-4 bottom-4 w-1 bg-rose-100 rounded-full hidden sm:block"></div>

              <div className="space-y-6 sm:space-y-8">
                {apptTimeline.map((appt, i) => {
                  const isDone = appt.status === 'completed';
                  return (
                    <div key={i} className="relative flex items-start gap-4 sm:gap-6 group">
                      {/* Timeline Dot */}
                      <div className="hidden sm:flex relative z-10 w-9 h-9 rounded-full bg-white border-[3px] items-center justify-center flex-shrink-0 mt-1 shadow-sm transition-colors border-emerald-500 text-emerald-500">
                        {isDone && <CheckCircle2 className="w-5 h-5" />}
                      </div>

                      {/* Content Card */}
                      <div className={cn(
                        "flex-1 rounded-xl p-4 sm:p-5 border-2 transition-all cursor-pointer touch-manipulation shadow-sm",
                        isDone ? "bg-gray-50/50 border-gray-100 hover:border-gray-200" :
                        "bg-white border-rose-100 hover:border-rose-300"
                      )}>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                          <div>
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest mb-2 bg-gray-200 text-gray-600">
                              {appt.type}
                            </span>
                            <h4 className={cn(
                              "font-bold text-base sm:text-lg tracking-tight",
                              isDone ? "text-gray-500 line-through decoration-2" : "text-rose-950"
                            )}>
                              {appt.title}
                            </h4>
                          </div>
                          <div className={cn(
                            "font-mono font-bold text-sm bg-white px-3 py-1 rounded-md border shadow-sm",
                            isDone ? "text-gray-400 border-gray-200" : "text-rose-900 border-rose-200"
                          )}>
                            {appt.date}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100/50">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            {appt.staff}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Client Components injected here */}
          <DetailInteractions
            eventId={eventId}
            notesData={notesData}
            eventTasks={tasksRows}
            payments={paymentsRows}
            client={clientRow}
          />

        </div>
      </div>
    </div>
  );
}
