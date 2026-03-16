import CalendarClient from "./CalendarClient";

// MOCK DATA (In real app, fetch from Supabase)
const mockEvents = [
  {
    id: 'e1', type: 'wedding', date: '2026-03-12', title: 'Jessica & Mark', time: '4:00 PM',
    services: ['planning', 'dress_rental', 'decoration'], venue: 'The Grand Hall', totalValue: 6800, balance: 'overdue', countdown: 5
  },
  {
    id: 'e2', type: 'quinceanera', date: '2026-03-21', title: "Sofia's 15th", time: '6:00 PM',
    services: ['dress_rental'], venue: 'Bella Ballroom', totalValue: 2100, balance: 'pending', countdown: 14
  },
  {
    id: 'e3', type: 'wedding', date: '2026-03-28', title: 'Emily & John', time: '3:00 PM',
    services: ['planning'], venue: 'Riverside Estate', totalValue: 4500, balance: 'paid', countdown: 21
  },
  {
    id: 'e4', type: 'wedding', date: '2026-04-10', title: 'Sarah & Tom', time: '5:00 PM',
    services: ['dress_rental', 'planning'], venue: 'City Club', totalValue: 5200, balance: 'paid', countdown: 34
  },
];

const mockAppointments = [
  { id: 'a1', type: 'fitting', date: '2026-03-05', title: 'Sarah - Final Fitting', time: '10:00 AM' },
  { id: 'a2', type: 'consultation', date: '2026-03-08', title: 'New Client Consult', time: '11:30 AM' },
  { id: 'a3', type: 'decoration', date: '2026-03-15', title: 'Venue Walkthrough', time: '1:00 PM' },
  { id: 'a4', type: 'pickup', date: '2026-03-20', title: 'Dress Pickup - Sofia', time: '2:30 PM' },
  { id: 'a5', type: 'fitting', date: '2026-03-21', title: 'Emily - Alterations', time: '10:00 AM' },
];

export default async function EventsPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden -m-4 sm:-m-6 lg:-m-8">
      <CalendarClient initialEvents={mockEvents} initialAppointments={mockAppointments} />
    </div>
  );
}
