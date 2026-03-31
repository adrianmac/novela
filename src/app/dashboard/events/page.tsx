import CalendarClient from "./CalendarClient";
import { db } from "@/db";
import { events, clients, appointments, eventServices, payments } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  const allEvents = await db
    .select({
      id: events.id,
      type: events.type,
      date: events.date,
      totalValue: events.totalValue,
      title: sql<string>`${clients.firstName} || ' ' || ${clients.lastName}`,
    })
    .from(events)
    .innerJoin(clients, eq(events.clientId, clients.id));

  // For each event, we need services and balance info
  const eventsWithDetails = await Promise.all(allEvents.map(async (event) => {
    const servicesRow = await db.select({ type: eventServices.serviceType }).from(eventServices).where(eq(eventServices.eventId, event.id));
    const paymentsRow = await db.select({ status: payments.status }).from(payments).where(eq(payments.eventId, event.id));

    // Simplistic balance logic
    const hasOverdue = paymentsRow.some(p => p.status === 'overdue');
    const hasPending = paymentsRow.some(p => p.status === 'pending');
    const balanceStatus = hasOverdue ? 'overdue' : hasPending ? 'pending' : 'paid';

    // Countdown calculation
    const eventDate = new Date(event.date);
    const now = new Date();
    const diffTime = Math.abs(eventDate.getTime() - now.getTime());
    const countdown = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      id: event.id,
      type: event.type,
      date: event.date,
      title: event.title,
      time: '4:00 PM', // Placeholder
      services: servicesRow.map(s => s.type),
      venue: 'TBD', // Placeholder
      totalValue: event.totalValue / 100, // convert back to dollars
      balance: balanceStatus,
      countdown,
    };
  }));

  const allAppointments = await db
    .select({
      id: appointments.id,
      type: appointments.type,
      date: appointments.date,
      title: sql<string>`${appointments.type} - ${clients.firstName}`,
    })
    .from(appointments)
    .innerJoin(clients, eq(appointments.clientId, clients.id));

  const apptsFormatted = allAppointments.map(appt => {
    return {
      id: appt.id,
      type: appt.type,
      date: appt.date.toISOString().split('T')[0],
      title: appt.title,
      time: appt.date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    };
  });

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden -m-4 sm:-m-6 lg:-m-8">
      <CalendarClient initialEvents={eventsWithDetails} initialAppointments={apptsFormatted} />
    </div>
  );
}
