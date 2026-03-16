import React from 'react';
import {
  AlertTriangle, ArrowRight, PlusCircle,
  RefreshCcw, MessageSquare, ChevronRight, Shirt
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// MOCK DATA - IN A REAL APP THIS IS FETCHED WITH DRIZZLE
const stats = {
  revenue: 24500,
  events: { weddings: 12, quinces: 8 },
  dressesRented: { out: 14, total: 45 },
  overdue: { amount: 1200, clients: 3 }
};

const appointments = [
  { id: 1, time: '10:00 AM', initials: 'SJ', client: 'Sarah Jenkins', type: 'Dress Fitting', staff: 'Isabel', status: 'confirmed' },
  { id: 2, time: '11:30 AM', initials: 'MR', client: 'Maria Rodriguez', type: 'Consultation', staff: 'Elena', status: 'checked_in' },
  { id: 3, time: '1:00 PM', initials: 'TL', client: 'Tina Lopez', type: 'Decoration Planning', staff: 'Isabel', status: 'upcoming' },
  { id: 4, time: '2:30 PM', initials: 'AP', client: 'Ashley Perez', type: 'Pickup', staff: 'Elena', status: 'upcoming' },
  { id: 5, time: '4:00 PM', initials: 'CB', client: 'Chloe Barnes', type: 'Dress Try-on', staff: 'Isabel', status: 'upcoming' },
];

const upcomingEvents = [
  { id: 1, date: '14 Nov', client: 'Emily & John', type: 'wedding', services: ['Dress', 'Alter', 'Plan'], value: 4500, payment: 'paid', countdown: 12 },
  { id: 2, date: '22 Nov', client: "Sofia's 15th", type: 'quinceanera', services: ['Dress', 'Deco'], value: 2100, payment: 'pending', countdown: 20 },
  { id: 3, date: '05 Dec', client: 'Jessica & Mark', type: 'wedding', services: ['Plan', 'Deco'], value: 6800, payment: 'overdue', countdown: 5 },
  { id: 4, date: '10 Dec', client: "Valeria's 15th", type: 'quinceanera', services: ['Dress'], value: 800, payment: 'paid', countdown: 38 },
];

const paymentsDue = [
  { id: 1, client: 'Jessica & Mark', milestone: 'Final Payment', date: 'Due 3 days ago', amount: 3400, status: 'overdue' },
  { id: 2, client: 'Maria Rodriguez', milestone: '50% Milestone', date: 'Tomorrow', amount: 1050, status: 'soon' },
  { id: 3, client: 'Sarah Jenkins', milestone: 'Deposit', date: 'In 3 days', amount: 500, status: 'soon' },
];

export default async function DashboardPage() {
  // In a real app we'd fetch stats, appointments, events, and payments from Supabase here

  return (
    <div className="flex flex-col gap-6 lg:gap-8 max-w-[1400px] mx-auto pb-8 sm:pb-0">

      {/* Alert Banner (Highest Priority) */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row gap-3 sm:items-center justify-between touch-manipulation cursor-pointer hover:bg-amber-100/50 transition-colors">
        <div className="flex items-start sm:items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-full text-amber-600 mt-1 sm:mt-0 flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-amber-900 font-semibold text-base sm:text-sm">Action Required: Jessica & Mark (Wedding)</h3>
            <p className="text-amber-700 text-sm mt-0.5">Event is 5 days away and final payment of $3,400 is overdue.</p>
          </div>
        </div>
        <button className="h-13 sm:h-10 px-4 bg-amber-600 text-white rounded-md text-base sm:text-sm font-medium hover:brightness-110 active:scale-[0.97] flex-shrink-0 flex items-center justify-center gap-2 mt-2 sm:mt-0">
          Review & Send Reminder <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Revenue this month', value: `$${stats.revenue.toLocaleString()}`, color: 'text-emerald-700' },
          { label: 'Active events', value: `${stats.events.weddings + stats.events.quinces}`, sub: `${stats.events.weddings} W • ${stats.events.quinces} Q`, color: 'text-[#1C1012]' },
          { label: 'Dresses rented out', value: `${stats.dressesRented.out}`, sub: `of ${stats.dressesRented.total} available`, color: 'text-[#1C1012]' },
          { label: 'Payments overdue', value: `$${stats.overdue.amount.toLocaleString()}`, sub: `${stats.overdue.clients} clients`, color: 'text-red-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-lg border border-rose-100 p-5 flex flex-col justify-center">
            <h4 className="text-[#8B7355] text-xs font-bold uppercase tracking-wider mb-2">{stat.label}</h4>
            <div className="flex items-baseline gap-2">
              <span className={cn("text-3xl font-serif font-bold", stat.color)}>{stat.value}</span>
              {stat.sub && <span className="text-sm font-medium text-gray-500 font-mono">{stat.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-start">

        {/* Left Column */}
        <div className="flex flex-col gap-6 lg:gap-8">

          {/* Card 1: Today's Appointments */}
          <section className="bg-white rounded-lg border border-rose-100 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-rose-100 flex items-center justify-between">
              <h2 className="font-serif font-bold text-xl text-[#1C1012]">Today&apos;s Appointments</h2>
              <button className="text-[#C9697A] text-sm font-semibold hover:underline px-2 py-1 h-10 flex items-center">View Calendar</button>
            </div>
            <div className="divide-y divide-rose-50">
              {appointments.map((apt) => (
                <div key={apt.id} className="flex items-center gap-4 px-5 py-3 min-h-[56px] hover:bg-rose-50 cursor-pointer active:bg-rose-100 touch-manipulation group transition-colors">
                  <span className="w-16 font-mono text-sm text-[#8B7355] font-semibold">{apt.time}</span>
                  <div className="w-10 h-10 rounded-full bg-rose-100 text-[#C9697A] font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {apt.initials}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#1C1012] truncate leading-tight text-base sm:text-sm">{apt.client}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{apt.type} • w/ {apt.staff}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-3">
                     {apt.status === 'confirmed' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Confirmed</span>}
                     {apt.status === 'checked_in' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Checked In</span>}
                     {apt.status === 'upcoming' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Upcoming</span>}
                     <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#C9697A]" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Card 2: Upcoming Events */}
          <section className="bg-white rounded-lg border border-rose-100 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-rose-100 flex items-center justify-between">
              <h2 className="font-serif font-bold text-xl text-[#1C1012]">Upcoming Events</h2>
              <button className="text-[#C9697A] text-sm font-semibold hover:underline px-2 py-1 h-10 flex items-center">View All Events</button>
            </div>
            <div className="divide-y divide-rose-50 overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 font-semibold w-24">Date</th>
                    <th className="px-5 py-3 font-semibold">Event / Client</th>
                    <th className="px-5 py-3 font-semibold">Services</th>
                    <th className="px-5 py-3 font-semibold text-right">Countdown</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50">
                  {upcomingEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-rose-50 cursor-pointer active:bg-rose-100 touch-manipulation h-16 transition-colors">
                      <td className="px-5 whitespace-nowrap text-sm font-mono text-[#1C1012] font-semibold">{event.date}</td>
                      <td className="px-5">
                        <div className="flex items-center gap-2">
                           <span className={cn(
                             "inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold tracking-wider",
                             event.type === 'wedding' ? "bg-rose-100 text-rose-700" : "bg-purple-100 text-purple-700"
                           )}>
                             {event.type === 'wedding' ? 'W' : 'Q'}
                           </span>
                           <span className="font-serif font-bold text-[#1C1012]">{event.client}</span>
                        </div>
                      </td>
                      <td className="px-5">
                        <div className="flex gap-1">
                          {event.services.map(s => (
                            <span key={s} className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs font-medium">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 text-right">
                         <span className={cn(
                           "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold",
                           event.countdown < 7 ? "bg-red-100 text-red-800" :
                           event.countdown <= 14 ? "bg-amber-100 text-amber-800" :
                           "bg-emerald-100 text-emerald-800"
                         )}>
                           {event.countdown} days
                         </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6 lg:gap-8">

          {/* Card 4: Quick Actions Grid */}
          <section className="grid grid-cols-2 gap-3 sm:gap-4">
             <button className="flex flex-col items-center justify-center gap-2 bg-white border border-rose-100 rounded-lg p-4 h-24 hover:bg-rose-50 active:scale-[0.97] touch-manipulation transition-all text-[#1C1012]">
               <div className="bg-rose-100 text-rose-700 p-2 rounded-full">
                 <Shirt className="w-5 h-5" />
               </div>
               <span className="text-xs font-bold uppercase tracking-wide text-center">New Rental</span>
             </button>
             <button className="flex flex-col items-center justify-center gap-2 bg-white border border-rose-100 rounded-lg p-4 h-24 hover:bg-rose-50 active:scale-[0.97] touch-manipulation transition-all text-[#1C1012]">
               <div className="bg-emerald-100 text-emerald-700 p-2 rounded-full">
                 <RefreshCcw className="w-5 h-5" />
               </div>
               <span className="text-xs font-bold uppercase tracking-wide text-center">Log Return</span>
             </button>
             <button className="flex flex-col items-center justify-center gap-2 bg-white border border-rose-100 rounded-lg p-4 h-24 hover:bg-rose-50 active:scale-[0.97] touch-manipulation transition-all text-[#1C1012]">
               <div className="bg-purple-100 text-purple-700 p-2 rounded-full">
                 <PlusCircle className="w-5 h-5" />
               </div>
               <span className="text-xs font-bold uppercase tracking-wide text-center">Create Pkg</span>
             </button>
             <button className="flex flex-col items-center justify-center gap-2 bg-white border border-rose-100 rounded-lg p-4 h-24 hover:bg-rose-50 active:scale-[0.97] touch-manipulation transition-all text-[#1C1012]">
               <div className="bg-amber-100 text-amber-700 p-2 rounded-full">
                 <MessageSquare className="w-5 h-5" />
               </div>
               <span className="text-xs font-bold uppercase tracking-wide text-center">Send SMS</span>
             </button>
          </section>

          {/* Card 3: Payments Due */}
          <section className="bg-white rounded-lg border border-rose-100 overflow-hidden shadow-sm flex flex-col h-[400px]">
            <div className="px-5 py-4 border-b border-rose-100 flex items-center justify-between flex-shrink-0">
              <h2 className="font-serif font-bold text-xl text-[#1C1012]">Payments Due</h2>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-rose-50">
              {paymentsDue.map((payment) => (
                <div key={payment.id} className="p-5 flex flex-col gap-3 hover:bg-rose-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0",
                        payment.status === 'overdue' ? "bg-red-500" : "bg-amber-400"
                      )} />
                      <div>
                        <p className="font-semibold text-base sm:text-sm text-[#1C1012]">{payment.client}</p>
                        <p className="text-sm text-[#8B7355] mt-0.5">{payment.milestone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-base sm:text-sm text-[#1C1012]">${payment.amount}</p>
                      <p className={cn(
                        "text-xs font-semibold mt-0.5",
                        payment.status === 'overdue' ? "text-red-600" : "text-amber-700"
                      )}>{payment.date}</p>
                    </div>
                  </div>
                  {payment.status === 'overdue' && (
                    <button className="h-10 mt-1 w-full bg-white border border-rose-200 text-[#C9697A] font-semibold text-sm rounded hover:bg-rose-50 active:bg-rose-100 touch-manipulation flex items-center justify-center gap-2 transition-colors">
                      Send Reminder
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-rose-100 bg-gray-50 flex-shrink-0">
               <button className="h-10 w-full text-center text-[#8B7355] text-sm font-semibold hover:text-[#1C1012] touch-manipulation">
                 View all pending invoices
               </button>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
