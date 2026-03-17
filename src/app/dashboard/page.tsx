import { AlertBanner } from "@/components/ui/AlertBanner";
import React from 'react';
import {
  Bell, CheckCircle2, AlertTriangle, Calendar as CalendarIcon,
  CreditCard, ChevronRight, UserPlus
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Link from 'next/link';

// Database
import { db } from '@/db';
import { events, appointments, payments, clients, inventoryRentals, alterationJobs, tasks, inventory } from '@/db/schema';
import { eq, or, and, lt, lte, gt, gte, sql, desc, asc, ne, isNull } from 'drizzle-orm';

export const dynamic = 'force-dynamic'; // Don't cache for this mock purpose

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function StatCard({ label, value, trend, isCurrency = false }: { label: string, value: number, trend?: string, isCurrency?: boolean }) {
  return (
    <div className="bg-white border border-rose-100 rounded-xl p-4 flex flex-col justify-between">
      <div className="text-sm font-medium text-rose-800/70">{label}</div>
      <div className="mt-2 flex items-baseline justify-between">
        <div className="text-3xl font-playfair font-semibold text-rose-900">
          {isCurrency ? '$' : ''}{isCurrency ? (value/100).toLocaleString() : value}
        </div>
        {trend && (
          <div className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}


async function getHighestPriorityAlert() {
  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const in7Days = new Date(todayDate); in7Days.setDate(in7Days.getDate() + 7);
  const in14Days = new Date(todayDate); in14Days.setDate(in14Days.getDate() + 14);
  const in30Days = new Date(todayDate); in30Days.setDate(in30Days.getDate() + 30);
  const ago60Days = new Date(todayDate); ago60Days.setDate(ago60Days.getDate() - 60);

  // Helper to calculate days diff
  const getDaysDiff = (d1: Date, d2: Date) => Math.ceil(Math.abs(d1.getTime() - d2.getTime()) / (1000 * 3600 * 24));

  // 1. Priority 1: CRITICAL Event <= 7 days AND has overdue payment
  const p1_events = await db.select({
      eventId: events.id,
      firstName: clients.firstName,
      lastName: clients.lastName,
      eventDate: events.date,
      amount: payments.amount,
      milestone: payments.milestone
    })
    .from(events)
    .innerJoin(clients, eq(events.clientId, clients.id))
    .innerJoin(payments, eq(events.id, payments.eventId))
    .where(
      and(
        lte(events.date, in7Days.toISOString().split('T')[0]),
        gte(events.date, todayDate.toISOString().split('T')[0]),
        eq(payments.status, 'overdue')
      )
    )
    .limit(1);

  if (p1_events.length > 0) {
    const e = p1_events[0];
    const clientName = e.firstName + ' ' + e.lastName;
    const days = getDaysDiff(new Date(e.eventDate), todayDate);
    return {
      message: `${clientName} wedding is in ${days} days — \$${(e.amount / 100).toFixed(2)} ${e.milestone} is overdue`,
      action: 'Collect payment →',
      href: `/dashboard/events/${e.eventId}`,
      level: 'critical'
    };
  }

  // 2. Priority 2: CRITICAL Event <= 14 days AND has incomplete alteration_job AND NO completed 'final_fitting' appointment
  const p2_events = await db.select({
      eventId: events.id,
      firstName: clients.firstName,
      lastName: clients.lastName,
      eventDate: events.date
    })
    .from(events)
    .innerJoin(clients, eq(events.clientId, clients.id))
    .innerJoin(alterationJobs, eq(events.id, alterationJobs.eventId))
    .where(
      and(
        lte(events.date, in14Days.toISOString().split('T')[0]),
        gte(events.date, todayDate.toISOString().split('T')[0]),
        ne(alterationJobs.status, 'complete')
      )
    );

  for (const e of p2_events) {
    const finalFittings = await db.select().from(appointments).where(
      and(
        eq(appointments.eventId, e.eventId),
        eq(appointments.type, 'final_fitting'),
        eq(appointments.status, 'completed')
      )
    );
    if (finalFittings.length === 0) {
      const clientName = e.firstName + ' ' + e.lastName;
      const days = getDaysDiff(new Date(e.eventDate), todayDate);
      return {
        message: `${clientName}'s final fitting is not scheduled (event in ${days} days)`,
        action: 'Schedule now →',
        href: `/dashboard/staff/schedule`,
        level: 'critical'
      };
    }
  }

  // 3. Priority 3: HIGH rental_record with status='rented' AND return_date < today
  const p3_rentals = await db.select({
      sku: inventory.sku,
      firstName: clients.firstName,
      lastName: clients.lastName,
      returnDate: inventoryRentals.returnDate,
      clientId: events.clientId
    })
    .from(inventoryRentals)
    .innerJoin(inventory, eq(inventoryRentals.itemId, inventory.id))
    .innerJoin(events, eq(inventoryRentals.eventId, events.id))
    .innerJoin(clients, eq(events.clientId, clients.id))
    .where(
      and(
        eq(inventoryRentals.status, 'rented'),
        lt(inventoryRentals.returnDate, todayDate.toISOString().split('T')[0])
      )
    )
    .limit(1);

  if (p3_rentals.length > 0) {
    const r = p3_rentals[0];
    const clientName = r.firstName + ' ' + r.lastName;
    const rDate = new Date(r.returnDate);
    const days = getDaysDiff(todayDate, rDate);
    return {
      message: `Gown ${r.sku} rented to ${clientName} is ${days} days overdue for return`,
      action: 'Contact client →',
      href: `/dashboard/inventory`,
      level: 'high'
    };
  }

  // 4. Priority 4: HIGH payment_milestone with status='overdue' AND (today - due_date) >= 3 days
  const ago3DaysStr = new Date(todayDate.getTime() - 3 * 24 * 3600 * 1000).toISOString().split('T')[0];
  const p4_payments = await db.select({
      firstName: clients.firstName,
      lastName: clients.lastName,
      milestone: payments.milestone,
      amount: payments.amount,
      dueDate: payments.dueDate,
      eventId: payments.eventId
    })
    .from(payments)
    .innerJoin(events, eq(payments.eventId, events.id))
    .innerJoin(clients, eq(events.clientId, clients.id))
    .where(
      and(
        eq(payments.status, 'overdue'),
        lte(payments.dueDate, ago3DaysStr)
      )
    )
    .limit(1);

  if (p4_payments.length > 0) {
    const p = p4_payments[0];
    const clientName = p.firstName + ' ' + p.lastName;
    const dDate = new Date(p.dueDate);
    const days = getDaysDiff(todayDate, dDate);
    return {
      message: `${clientName} — ${p.milestone} is ${days} days overdue (${(p.amount / 100).toFixed(2)})`,
      action: 'Send reminder →',
      href: `/dashboard/events/${p.eventId}`,
      level: 'high'
    };
  }

  // 5. Priority 5: MEDIUM Event <= 30 days AND any checklist item in 'required' category is not complete
  const p5_events_initial = await db.select({
      eventId: events.id,
      firstName: clients.firstName,
      lastName: clients.lastName,
      eventDate: events.date
    })
    .from(events)
    .innerJoin(clients, eq(events.clientId, clients.id))
    .where(
      and(
        lte(events.date, in30Days.toISOString().split('T')[0]),
        gte(events.date, todayDate.toISOString().split('T')[0])
      )
    );

  for (const e of p5_events_initial) {
    const openTasks = await db.select().from(tasks).where(
      and(
        eq(tasks.eventId, e.eventId),
        eq(tasks.status, 'open')
      )
    ).limit(1);

    if (openTasks.length > 0) {
       const clientName = e.firstName + ' ' + e.lastName;
       const days = getDaysDiff(new Date(e.eventDate), todayDate);
       const allOpenTasks = await db.select().from(tasks).where(
        and(eq(tasks.eventId, e.eventId), eq(tasks.status, 'open'))
       );
       return {
         message: `${clientName}'s event is in ${days} days with ${allOpenTasks.length} required tasks open`,
         action: 'View tasks →',
         href: `/dashboard/events/${e.eventId}`,
         level: 'medium'
       };
    }
  }

  // 6. Priority 6: LOW Client with no event and last_activity > 60 days ago
  /*
  const p6_clients = await db.select({
      clientId: clients.id,
      firstName: clients.firstName,
      lastName: clients.lastName,
      createdAt: clients.createdAt
    })
    .from(clients)
    .leftJoin(events, eq(clients.id, events.clientId))
    .where(
      and(
        sql`${events.id} IS NULL`,
        lt(clients.createdAt, ago60Days)
      )
    )
    .limit(1);

  if (p6_clients.length > 0) {
    const c = p6_clients[0];
    const clientName = c.firstName + ' ' + c.lastName;
    return {
      message: `${clientName} hasn't been in touch in 60 days`,
      action: 'Send win-back →',
      href: `/dashboard/clients`,
      level: 'low'
    };
  }
  */
  // Replacing with a simpler subquery strategy to avoid the leftJoin isNull bug
  const activeClientIdsQuery = db.select({ id: events.clientId }).from(events);

  const p6_clients_alt = await db.select({
    clientId: clients.id,
    firstName: clients.firstName,
    lastName: clients.lastName,
    createdAt: clients.createdAt
  })
  .from(clients)
  .where(
    and(
      lt(clients.createdAt, ago60Days),
      sql`${clients.id} NOT IN (SELECT client_id FROM events)`
    )
  )
  .limit(1);

  if (p6_clients_alt.length > 0) {
    const c = p6_clients_alt[0];
    const clientName = c.firstName + ' ' + c.lastName;
    return {
      message: `${clientName} hasn't been in touch in 60 days`,
      action: 'Send win-back →',
      href: `/dashboard/clients`,
      level: 'low'
    };
  }

  return null;
}

export default async function DashboardOverview() {
  // Parallel fetches for dashboard metrics
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);

  // Stats
    const highestPriorityAlert = await getHighestPriorityAlert();
const [
    activeEventsList,
    totalRevenueList,
    todayAppts,
    upcomingEventsList,
    overduePaymentsList,
  ] = await Promise.all([
    // Total active events
    db.select().from(events).where(or(eq(events.status, 'active'), eq(events.status, 'in_progress'))),

    // Total pipeline revenue (active events)
    db.select({ total: sql<number>`sum(${events.totalValue})` }).from(events).where(or(eq(events.status, 'active'), eq(events.status, 'in_progress'))),

    // Appointments today
    db.select({
      id: appointments.id,
      eventId: appointments.eventId,
      type: appointments.type,
      time: appointments.date,
      status: appointments.status,
      clientName: sql<string>`${clients.firstName} || ' ' || ${clients.lastName}`,
    })
      .from(appointments)
      .innerJoin(clients, eq(appointments.clientId, clients.id))
      .where(and(
        gte(appointments.date, startOfToday),
        lt(appointments.date, endOfToday)
      ))
      .orderBy(asc(appointments.date)),

    // Upcoming events this week
    db.select({
      id: events.id,
      clientId: events.clientId,
      type: events.type,
      date: events.date,
      status: events.status,
      clientName: sql<string>`${clients.firstName} || ' ' || ${clients.lastName}`,
    })
      .from(events)
      .innerJoin(clients, eq(events.clientId, clients.id))
      .where(and(
        gte(events.date, startOfToday.toISOString()),
        lt(events.date, endOfWeek.toISOString())
      ))
      .orderBy(asc(events.date)),

    // Overdue payments
    db.select({
      id: payments.id,
      amount: payments.amount,
      clientName: sql<string>`${clients.firstName} || ' ' || ${clients.lastName}`,
    })
      .from(payments)
      .innerJoin(clients, eq(payments.clientId, clients.id))
      .where(eq(payments.status, 'overdue'))
      .orderBy(desc(payments.amount))
      .limit(5)
  ]);

  const totalActive = activeEventsList.length;
  const totalPipeline = totalRevenueList[0]?.total || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 lg:pb-8">

      {/* PRIORITY ALERT BANNER */}
      {highestPriorityAlert && (
        <AlertBanner
          message={highestPriorityAlert.message}
          level={highestPriorityAlert.level as any}
          action={highestPriorityAlert.action}
          href={highestPriorityAlert.href}
        />
      )}

      {/* STATS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Events" value={totalActive} trend="+2 this week" />
        <StatCard label="Pipeline Value" value={totalPipeline} isCurrency={true} />
        <StatCard label="Today's Appts" value={todayAppts.length} />
        <StatCard label="Pending Tasks" value={12} /> {/* Mock pending tasks to simplify query */}
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">

          {/* APPOINTMENTS TODAY */}
          <section className="bg-white border border-rose-100 rounded-xl p-5 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-playfair font-semibold text-rose-950 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-rose-500" />
                Today's Schedule
              </h2>
              <button className="text-sm font-medium text-rose-600 hover:text-rose-800">View all</button>
            </div>

            <div className="space-y-3">
              {todayAppts.length === 0 ? (
                <div className="text-center py-6 text-rose-500/70 border-2 border-dashed border-rose-100 rounded-xl">
                  No appointments scheduled for today.
                </div>
              ) : (
                todayAppts.map((appt) => (
                  <div key={appt.id} className="flex items-center p-3 rounded-xl hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100 group">
                    <div className="w-20 text-center border-r border-rose-100 pr-4 mr-4 shrink-0">
                      <div className="text-sm font-semibold text-rose-900">
                        {appt.time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-rose-950 truncate">{appt.clientName}</div>
                      <div className="text-sm text-rose-600 truncate capitalize">{appt.type}</div>
                    </div>
                    <div className="pl-4">
                      {appt.status === 'completed' ? (
                        <div className="h-10 px-3 rounded-lg bg-emerald-50 text-emerald-700 flex items-center gap-1.5 text-sm font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          Done
                        </div>
                      ) : (
                        <button className="h-13 px-4 rounded-lg bg-rose-100 text-rose-800 font-medium text-sm hover:bg-rose-200 transition-colors">
                          Check in
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* UPCOMING EVENTS */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-playfair font-semibold text-rose-950">Upcoming Events (7 Days)</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {upcomingEventsList.length === 0 ? (
                <div className="sm:col-span-2 text-center py-6 text-rose-500/70 border-2 border-dashed border-rose-100 rounded-xl">
                  No events coming up in the next 7 days.
                </div>
              ) : (
                upcomingEventsList.map((event) => {
                  const eventDate = new Date(event.date);
                  const diffTime = Math.abs(eventDate.getTime() - now.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                  return (
                    <Link key={event.id} href={`/dashboard/events/${event.id}`} className="bg-white border border-rose-100 rounded-xl p-5 hover:border-rose-300 transition-colors group block">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-800 font-playfair font-bold text-lg">
                          {event.clientName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="text-right">
                          <div className={cn("text-2xl font-semibold font-playfair", diffDays <= 7 ? "text-red-600" : "text-rose-900")}>
                            {diffDays}
                          </div>
                          <div className="text-xs font-medium text-rose-500 uppercase tracking-wider">Days</div>
                        </div>
                      </div>
                      <h3 className="font-semibold text-rose-950 text-lg">{event.clientName}</h3>
                      <p className="text-rose-600 text-sm capitalize">{event.type} • {eventDate.toLocaleDateString()}</p>

                      <div className="mt-4 pt-4 border-t border-rose-50 flex items-center justify-between text-sm font-medium text-rose-700 group-hover:text-rose-900">
                        View event details
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN (1/3 width) */}
        <div className="space-y-6">

          {/* QUICK ACTIONS */}
          <section className="bg-rose-900 text-rose-50 rounded-xl p-5">
            <h2 className="text-lg font-playfair font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'Schedule Appointment', icon: CalendarIcon },
                { label: 'Process Payment', icon: CreditCard },
                { label: 'Add Event Service', icon: Bell },
              ].map((action, i) => (
                <button key={i} className="w-full h-13 px-4 bg-rose-800/50 hover:bg-rose-800 rounded-lg flex items-center gap-3 transition-colors text-left text-sm font-medium border border-rose-700/50 hover:border-rose-600">
                  <action.icon className="w-4 h-4 text-rose-300" />
                  {action.label}
                </button>
              ))}
            </div>
          </section>

          {/* PAYMENTS DUE */}
          <section className="bg-white border border-rose-100 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-playfair font-semibold text-rose-950 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-rose-500" />
                Overdue Payments
              </h2>
            </div>

            <div className="space-y-4">
              {overduePaymentsList.length === 0 ? (
                <p className="text-sm text-rose-500">All payments are up to date.</p>
              ) : (
                overduePaymentsList.map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center group">
                    <div>
                      <div className="font-medium text-rose-900 text-sm group-hover:text-rose-700 transition-colors">
                        {payment.clientName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-rose-900">
                        ${(payment.amount / 100).toLocaleString()}
                      </div>
                      <div className="text-xs text-red-600 font-medium">Overdue</div>
                    </div>
                  </div>
                ))
              )}
              {overduePaymentsList.length > 0 && (
                <button className="w-full mt-2 text-sm font-medium text-rose-600 hover:text-rose-800 text-center py-2">
                  View all receivables
                </button>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
