import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';


const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

async function seed() {
  console.log('Clearing database...');
  await db.delete(schema.inventoryRentals);
  await db.delete(schema.tasks);
  await db.delete(schema.payments);
  await db.delete(schema.appointments);
  await db.delete(schema.eventServices);
  await db.delete(schema.events);
  await db.delete(schema.clients);

  console.log('Seeding database...');
  const [client1] = await db.insert(schema.clients).values({
    firstName: 'Jessica',
    lastName: 'Mark',
    email: 'jessica@example.com',
    phone: '(555) 123-4567',
  }).returning();

  const [event1] = await db.insert(schema.events).values({
    clientId: client1.id,
    type: 'wedding',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'in_progress',
    totalValue: 680000,
  }).returning();

  await db.insert(schema.eventServices).values([
    { eventId: event1.id, serviceType: 'dress_rental' },
    { eventId: event1.id, serviceType: 'alterations' },
    { eventId: event1.id, serviceType: 'planning' },
    { eventId: event1.id, serviceType: 'decoration' },
  ]);

  await db.insert(schema.appointments).values([
    { eventId: event1.id, clientId: client1.id, type: 'consultation', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), staffId: 'u1', staffName: 'Isabel', status: 'completed' },
    { eventId: event1.id, clientId: client1.id, type: 'fitting', date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), staffId: 'u2', staffName: 'Maria S.', status: 'completed' },
    { eventId: event1.id, clientId: client1.id, type: 'pickup', date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), staffId: 'u1', staffName: 'Isabel', status: 'upcoming' },
  ]);

  await db.insert(schema.payments).values([
    { eventId: event1.id, clientId: client1.id, milestone: 'Deposit', amount: 150000, dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), status: 'paid', paidAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    { eventId: event1.id, clientId: client1.id, milestone: '50% Milestone', amount: 190000, dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), status: 'paid', paidAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
    { eventId: event1.id, clientId: client1.id, milestone: 'Final Payment', amount: 340000, dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'overdue' },
  ]);

  await db.insert(schema.tasks).values([
    { eventId: event1.id, title: 'Schedule final fitting', status: 'open', dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { eventId: event1.id, title: 'Confirm floral order', status: 'completed', dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  ]);

  console.log('Seeded successfully.');

  // Create another event for calendar
  const [client2] = await db.insert(schema.clients).values({
    firstName: 'Ana',
    lastName: 'Gomez',
    email: 'ana@example.com',
    phone: '(555) 987-6543',
  }).returning();

  await db.insert(schema.events).values({
    clientId: client2.id,
    type: 'quinceanera',
    date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    totalValue: 350000,
  }).returning();
}

seed().catch(console.error).finally(() => process.exit(0));
