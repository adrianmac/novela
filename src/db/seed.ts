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

async function seedInventory() {
  console.log('Clearing inventory...');
  await db.delete(schema.inventoryRentals);
  await db.delete(schema.inventory);

  console.log('Seeding inventory...');
  const [dress1] = await db.insert(schema.inventory).values({
    sku: 'WD-001',
    name: 'Ivory Lace Ballgown',
    description: 'Beautiful A-line ballgown with sweetheart neckline',
    size: '8',
    category: 'bridal',
    rentalPrice: 85000,
    depositAmount: 30000,
    status: 'available',
    lastCleanedDate: new Date().toISOString(),
  }).returning();

  const [dress2] = await db.insert(schema.inventory).values({
    sku: 'WD-002',
    name: 'Mermaid Silk Gown',
    description: 'Sleek mermaid silhouette in pure silk',
    size: '10',
    category: 'bridal',
    rentalPrice: 120000,
    depositAmount: 50000,
    status: 'reserved',
    lastCleanedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  }).returning();

  const [qDress] = await db.insert(schema.inventory).values({
    sku: 'QA-050',
    name: 'Ruby Red Quince Gown',
    description: 'Voluminous tulle skirt with beaded bodice',
    size: '6',
    category: 'quinceanera',
    rentalPrice: 55000,
    depositAmount: 20000,
    status: 'rented',
    lastCleanedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  }).returning();

  const [decor] = await db.insert(schema.inventory).values({
    sku: 'DEC-010',
    name: 'Gold Chiavari Chair',
    description: 'Classic gold chairs with white cushion',
    size: 'Standard',
    category: 'decoration',
    rentalPrice: 800,
    depositAmount: 200,
    status: 'available',
    lastCleanedDate: new Date().toISOString(),
  }).returning();

  const [dressOverdue] = await db.insert(schema.inventory).values({
    sku: 'WD-099',
    name: 'Vintage Lace Gown',
    description: 'Heirloom style lace',
    size: '12',
    category: 'bridal',
    rentalPrice: 70000,
    depositAmount: 25000,
    status: 'overdue',
    lastCleanedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  }).returning();

  // Create rentals
  const eventsList = await db.select().from(schema.events);
  if (eventsList.length > 0) {
    await db.insert(schema.inventoryRentals).values({
      eventId: eventsList[0].id,
      itemId: dress2.id,
      status: 'reserved',
      pickupDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      returnDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    });

    await db.insert(schema.inventoryRentals).values({
      eventId: eventsList[0].id,
      itemId: qDress.id,
      status: 'rented',
      pickupDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      returnDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    });

    await db.insert(schema.inventoryRentals).values({
      eventId: eventsList[0].id,
      itemId: dressOverdue.id,
      status: 'overdue',
      pickupDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      returnDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
}

seedInventory().catch(console.error).finally(() => process.exit(0));
