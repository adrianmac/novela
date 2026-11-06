import CalendarClient from "./CalendarClient";
import { db } from "@/db";
import { events, clients, appointments, eventServices, payments } from "@/db/schema";
import { eq, sql, inArray } from "drizzle-orm";

export const revalidate = 0;

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

  const eventIds = allEvents.map(e => e.id);

  const [allServices, allPaymentRows] = eventIds.length > 0 ? await Promise.all([
    db.select({ eventId: eventServices.eventId, type: eventServices.serviceType }).from(eventServices).where(inArray(eventServices.eventId, eventIds)),
    db.select({ eventId: payments.eventId, status: payments.status }).from(payments).where(inArray(payments.eventId, eventIds)),
  ]) : [[], []];

  const servicesByEvent = new Map<string, string[]>();
  for (const s of allServices) {
    const list = servicesByEvent.get(s.eventId) || [];
    list.push(s.type);
    servicesByEvent.set(s.eventId, list);
  }

  const paymentsByEvent = new Map<string, { status: string }[]>();
  for (const p of allPaymentRows) {
    const list = paymentsByEvent.get(p.eventId) || [];
    list.push(p);
    paymentsByEvent.set(p.eventId, list);
  }

  const eventsWithDetails = allEvents.map(event => {
    const services = servicesByEvent.get(event.id) || [];
    const eventPayments = paymentsByEvent.get(event.id) || [];
    const hasOverdue = eventPayments.some(p => p.status === 'overdue');
    const hasPending = eventPayments.some(p => p.status === 'pending');
    const balanceStatus = hasOverdue ? 'overdue' : hasPending ? 'pending' : 'paid';

    const eventDate = new Date(event.date);
    const now = new Date();
    const diffTime = Math.abs(eventDate.getTime() - now.getTime());
    const countdown = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      id: event.id,
      type: event.type,
      date: event.date,
      title: event.title,
      time: '4:00 PM',
      services,
      venue: 'TBD',
      totalValue: event.totalValue / 100,
      balance: balanceStatus,
      countdown,
    };
  });

  const allAppointments = await db
    .select({
      id: appointments.id,
      type: appointments.type,
      date: appointments.date,
      title: sql<string>`${appointments.type} || ' - ' || ${clients.firstName}`,
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
