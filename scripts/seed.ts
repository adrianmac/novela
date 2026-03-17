import { db } from "../src/db";
import {
  clients, events, eventServices,
  payments, tasks, inventory, inventoryRentals,
  alterationJobs, appointments, jobLogs
} from "../src/db/schema";
import { sql } from "drizzle-orm";
import { randomUUID } from "crypto";

async function seed() {
  console.log("Starting database seed...");

  // 1. Clear existing data in reverse dependency order
  console.log("Clearing existing data...");

  await db.delete(appointments);
  await db.delete(alterationJobs);
  await db.delete(inventoryRentals);
  await db.delete(inventory);
  await db.delete(tasks);
  await db.delete(payments);
  await db.delete(eventServices);
  await db.delete(events);
  await db.delete(clients);



  // Set reference date: March 16, 2026
  const refDate = new Date('2026-03-16T12:00:00Z');

  // 2. Organization

  const isabelId = randomUUID();
  const mariaId = randomUUID();
  const anaId = randomUUID();
  const carmenId = randomUUID();
  const rosaId = randomUUID();


  // 4. Clients
  console.log("Seeding Clients...");
  const c1_id = randomUUID();
  const c2_id = randomUUID();
  const c3_id = randomUUID();
  const c4_id = randomUUID();
  const c5_id = randomUUID();
  const c6_id = randomUUID();
  const c7_id = randomUUID();
  const c8_id = randomUUID();
  const c9_id = randomUUID();

  await db.insert(clients).values([
    { id: c1_id, firstName: 'Sophia', lastName: 'Rodriguez', phone: '555-0101', email: 'sophia@example.com', source: 'instagram', preferredContact: 'sms' },
    { id: c2_id, firstName: 'Valentina', lastName: 'Cruz', phone: '555-0102', email: 'valentina@example.com', source: 'referral', preferredContact: 'sms' },
    { id: c3_id, firstName: 'Maria', lastName: 'Gutierrez', phone: '555-0103', email: 'maria.g@example.com', source: 'walk_in', preferredContact: 'phone' },
    { id: c4_id, firstName: 'Isabella', lastName: 'Fuentes', phone: '555-0104', email: 'isabella@example.com', source: 'website', preferredContact: 'sms' },
    { id: c5_id, firstName: 'Carmen', lastName: 'Santos', phone: '555-0105', email: 'carmen.s@example.com', source: 'instagram', preferredContact: 'email' },
    { id: c6_id, firstName: 'Diana', lastName: 'Torres', phone: '555-0106', email: 'diana@example.com', source: 'referral', preferredContact: 'sms' },
    // Clients for today's appts without full events
    { id: c7_id, firstName: 'Lucia', lastName: 'Flores', phone: '555-0107', email: 'lucia@example.com', source: 'walk_in', preferredContact: 'sms' },
    { id: c8_id, firstName: 'Monica', lastName: 'Garza', phone: '555-0108', email: 'monica@example.com', source: 'website', preferredContact: 'sms' },
    { id: c9_id, firstName: 'Rosa', lastName: 'Nunez', phone: '555-0109', email: 'rosa.n@example.com', source: 'instagram', preferredContact: 'sms' },
  ] as any);

  // 5. Events
  console.log("Seeding Events...");
  const e1_id = randomUUID();
  const e2_id = randomUUID();
  const e3_id = randomUUID();
  const e4_id = randomUUID();
  const e5_id = randomUUID();
  const e6_id = randomUUID();

  await db.insert(events).values([
    { id: e1_id, clientId: c1_id, type: 'wedding', date: '2026-03-22', depositAmount: 20000, status: 'in_progress', totalValue: 680000, expectedGuests: 200, notes: 'Sophia Rodriguez (wedding Mar 22, 2026)', urgencyLevel: 'critical' },
    { id: e2_id, clientId: c2_id, type: 'quinceanera', date: '2026-03-29', depositAmount: 20000, status: 'in_progress', totalValue: 420000, expectedGuests: 150, notes: 'Valentina Cruz (quinceanera Mar 29, 2026)', urgencyLevel: 'high' },
    { id: e3_id, clientId: c3_id, type: 'wedding', date: '2026-04-12', depositAmount: 20000, status: 'active', totalValue: 310000, expectedGuests: 120, notes: 'Maria & Jose Gutierrez (wedding Apr 12, 2026)', urgencyLevel: 'medium' },
    { id: e4_id, clientId: c4_id, type: 'quinceanera', date: '2026-04-19', depositAmount: 20000, status: 'active', totalValue: 540000, expectedGuests: 250, notes: 'Isabella Fuentes (quinceanera Apr 19, 2026)', urgencyLevel: 'medium' },
    { id: e5_id, clientId: c5_id, type: 'wedding', date: '2026-04-26', depositAmount: 20000, status: 'consultation_scheduled', totalValue: 820000, expectedGuests: 300, notes: 'Carmen & Miguel Santos (wedding Apr 26, 2026)', urgencyLevel: 'low' },
    { id: e6_id, clientId: c6_id, type: 'quinceanera', date: '2026-04-05', depositAmount: 20000, status: 'in_progress', totalValue: 380000, expectedGuests: 100, notes: 'Diana Torres (quinceanera Apr 5, 2026)', urgencyLevel: 'medium' },
  ] as any);

  // 6. Event Services
  console.log("Seeding Event Services...");
  await db.insert(eventServices).values([
    // E1: Sophia
    { id: randomUUID(), eventId: e1_id, serviceType: 'dress_rental', depositAmount: 20000, status: 'active', assignedStaffId: isabelId },
    { id: randomUUID(), eventId: e1_id, serviceType: 'alterations', depositAmount: 20000, status: 'active', assignedStaffId: anaId },
    { id: randomUUID(), eventId: e1_id, serviceType: 'planning', depositAmount: 20000, status: 'active', assignedStaffId: mariaId },
    { id: randomUUID(), eventId: e1_id, serviceType: 'decoration', depositAmount: 20000, status: 'active', assignedStaffId: rosaId },
    // E2: Valentina
    { id: randomUUID(), eventId: e2_id, serviceType: 'dress_rental', depositAmount: 20000, status: 'active', assignedStaffId: carmenId },
    { id: randomUUID(), eventId: e2_id, serviceType: 'planning', depositAmount: 20000, status: 'active', assignedStaffId: mariaId },
    { id: randomUUID(), eventId: e2_id, serviceType: 'decoration', depositAmount: 20000, status: 'active', assignedStaffId: rosaId },
    // E3: Maria
    { id: randomUUID(), eventId: e3_id, serviceType: 'alterations', depositAmount: 20000, status: 'active', assignedStaffId: anaId },
    { id: randomUUID(), eventId: e3_id, serviceType: 'decoration', depositAmount: 20000, status: 'active', assignedStaffId: rosaId },
    // E4: Isabella
    { id: randomUUID(), eventId: e4_id, serviceType: 'dress_rental', depositAmount: 20000, status: 'active', assignedStaffId: isabelId },
    { id: randomUUID(), eventId: e4_id, serviceType: 'alterations', depositAmount: 20000, status: 'active', assignedStaffId: anaId },
    { id: randomUUID(), eventId: e4_id, serviceType: 'planning', depositAmount: 20000, status: 'active', assignedStaffId: mariaId },
    { id: randomUUID(), eventId: e4_id, serviceType: 'decoration', depositAmount: 20000, status: 'active', assignedStaffId: rosaId },
    // E5: Carmen
    { id: randomUUID(), eventId: e5_id, serviceType: 'dress_rental', depositAmount: 20000, status: 'pending', assignedStaffId: isabelId },
    { id: randomUUID(), eventId: e5_id, serviceType: 'planning', depositAmount: 20000, status: 'pending', assignedStaffId: mariaId },
    { id: randomUUID(), eventId: e5_id, serviceType: 'decoration', depositAmount: 20000, status: 'pending', assignedStaffId: rosaId },
    // E6: Diana
    { id: randomUUID(), eventId: e6_id, serviceType: 'dress_rental', depositAmount: 20000, status: 'active', assignedStaffId: isabelId },
    { id: randomUUID(), eventId: e6_id, serviceType: 'alterations', depositAmount: 20000, status: 'active', assignedStaffId: anaId },
    { id: randomUUID(), eventId: e6_id, serviceType: 'decoration', depositAmount: 20000, status: 'active', assignedStaffId: rosaId },
  ] as any);

  // 7. Inventory
  console.log("Seeding Inventory...");
  const i1_id = randomUUID(); // Sophia's dress
  const i2_id = randomUUID(); // Valentina's dress
  const i12_id = randomUUID(); // Rented dress

  await db.insert(inventory).values([
    { id: i1_id, name: 'Wedding Dress', category: 'wedding', sku: 'BB-047', description: 'Ivory A-line cathedral', size: '8', depositAmount: 20000, status: 'reserved', rentalPrice: 120000 },
    { id: i2_id, name: 'Quince Dress', category: 'quinceanera', sku: 'QG-031', description: 'Rose quartz ball gown', size: '4', depositAmount: 20000, status: 'reserved', rentalPrice: 80000 },
    { id: randomUUID(), name: 'Wedding Dress', category: 'wedding', sku: 'BB-012', description: 'Champagne lace mermaid', size: '6', depositAmount: 20000, status: 'available', rentalPrice: 150000 },
    { id: randomUUID(), name: 'Wedding Dress', category: 'wedding', sku: 'BB-022', description: 'White strapless sweetheart', size: '10', depositAmount: 20000, status: 'available', rentalPrice: 100000 },
    { id: randomUUID(), name: 'Wedding Dress', category: 'wedding', sku: 'BB-033', description: 'Blush tulle princess', size: '2', depositAmount: 20000, status: 'in_cleaning', rentalPrice: 130000 },
    { id: randomUUID(), name: 'Wedding Dress', category: 'wedding', sku: 'BB-041', description: 'Ivory sequin sheath', size: '8', depositAmount: 20000, status: 'available', rentalPrice: 160000 },
    { id: randomUUID(), name: 'Quince Dress', category: 'quinceanera', sku: 'QG-008', description: 'Magenta ball gown', size: '2', depositAmount: 20000, status: 'available', rentalPrice: 70000 },
    { id: randomUUID(), name: 'Quince Dress', category: 'quinceanera', sku: 'QG-014', description: 'Royal blue corset', size: '4', depositAmount: 20000, status: 'reserved', rentalPrice: 90000 },
    { id: randomUUID(), name: 'Quince Dress', category: 'quinceanera', sku: 'QG-019', description: 'Gold glitter A-line', size: '6', depositAmount: 20000, status: 'available', rentalPrice: 110000 },
    { id: randomUUID(), name: 'Quince Dress', category: 'quinceanera', sku: 'QG-025', description: 'Lavender princess', size: '0', depositAmount: 20000, status: 'available', rentalPrice: 85000 },
    { id: randomUUID(), name: 'Quince Dress', category: 'quinceanera', sku: 'QG-031-2', description: 'Coral layered tulle', size: '8', depositAmount: 20000, status: 'available', rentalPrice: 85000 },
    { id: i12_id, name: 'Wedding Dress', category: 'wedding', sku: 'BB-055', description: 'Vintage lace boho', size: '12', depositAmount: 20000, status: 'rented', rentalPrice: 75000 },
  ] as any);

  // Inventory Rentals
  await db.insert(inventoryRentals).values([
    { id: randomUUID(), itemId: i1_id, eventId: e1_id, depositAmount: 20000, status: 'reserved', pickupDate: '2026-03-20', returnDate: '2026-03-24' },
    { id: randomUUID(), itemId: i2_id, eventId: e2_id, depositAmount: 20000, status: 'reserved', pickupDate: '2026-03-16', returnDate: '2026-03-31' },
    { id: randomUUID(), itemId: i12_id, eventId: e3_id, depositAmount: 20000, status: 'rented', pickupDate: '2026-03-10', returnDate: '2026-03-24' },
  ] as any);



  const e7_id = randomUUID();
  const e8_id = randomUUID();
  const e9_id = randomUUID();

  await db.insert(events).values([
    { id: e7_id, clientId: c7_id, type: 'consultation', date: '2026-05-01', status: 'consultation_scheduled', totalValue: 0, expectedGuests: 0, notes: '', urgencyLevel: 'low' },
    { id: e8_id, clientId: c8_id, type: 'fitting', date: '2026-05-02', status: 'consultation_scheduled', totalValue: 0, expectedGuests: 0, notes: '', urgencyLevel: 'low' },
    { id: e9_id, clientId: c9_id, type: 'consultation', date: '2026-05-03', status: 'consultation_scheduled', totalValue: 0, expectedGuests: 0, notes: '', urgencyLevel: 'low' },
  ] as any);

  // 8. Appointments
  console.log("Seeding Appointments...");
  await db.insert(appointments).values([
    // Mar 16
    { id: randomUUID(), eventId: e1_id, clientId: c1_id, type: 'fitting', date: new Date('2026-03-16T09:30:00Z'), staffId: anaId, staffName: 'Ana R.', depositAmount: 20000, status: 'confirmed' },
    { id: randomUUID(), eventId: e7_id, clientId: c7_id, type: 'consultation', date: new Date('2026-03-16T11:00:00Z'), staffId: mariaId, staffName: 'Maria G.', depositAmount: 20000, status: 'confirmed' },
    { id: randomUUID(), eventId: e2_id, clientId: c2_id, type: 'pickup', date: new Date('2026-03-16T13:00:00Z'), staffId: carmenId, staffName: 'Carmen V.', depositAmount: 20000, status: 'confirmed' },
    { id: randomUUID(), eventId: e8_id, clientId: c8_id, type: 'fitting', date: new Date('2026-03-16T14:30:00Z'), staffId: anaId, staffName: 'Ana R.', depositAmount: 20000, status: 'confirmed' },
    { id: randomUUID(), eventId: e9_id, clientId: c9_id, type: 'consultation', date: new Date('2026-03-16T16:00:00Z'), staffId: mariaId, staffName: 'Maria G.', depositAmount: 20000, status: 'confirmed' },
  ] as any);

  // 9. Payment Milestones
  console.log("Seeding Payments...");
  await db.insert(payments).values([
    // E1: Sophia ($6800, Paid: $6350, Overdue: $450)
    { id: randomUUID(), eventId: e1_id, clientId: c1_id, amount: 200000, milestone: 'Initial Deposit', depositAmount: 20000, status: 'paid', dueDate: '2025-06-01', paidDate: '2025-06-01' },
    { id: randomUUID(), eventId: e1_id, clientId: c1_id, amount: 435000, milestone: 'Dress & Planning Final', depositAmount: 20000, status: 'paid', dueDate: '2026-02-01', paidDate: '2026-02-05' },
    { id: randomUUID(), eventId: e1_id, clientId: c1_id, amount: 45000, milestone: 'Decoration Final', depositAmount: 20000, status: 'overdue', dueDate: '2026-03-10' },

    // E2: Valentina ($4200, Fully paid)
    { id: randomUUID(), eventId: e2_id, clientId: c2_id, amount: 200000, milestone: 'Initial Deposit', depositAmount: 20000, status: 'paid', dueDate: '2025-08-01', paidDate: '2025-08-01' },
    { id: randomUUID(), eventId: e2_id, clientId: c2_id, amount: 220000, milestone: 'Final Balance', depositAmount: 20000, status: 'paid', dueDate: '2026-03-01', paidDate: '2026-03-01' },

    // E3: Maria ($3100, Paid: $1550)
    { id: randomUUID(), eventId: e3_id, clientId: c3_id, amount: 155000, milestone: 'Initial Deposit', depositAmount: 20000, status: 'paid', dueDate: '2025-10-01', paidDate: '2025-10-01' },
    { id: randomUUID(), eventId: e3_id, clientId: c3_id, amount: 155000, milestone: 'Final Balance', depositAmount: 20000, status: 'pending', dueDate: '2026-03-29' },

    // E4: Isabella ($5400, Paid: $2700)
    { id: randomUUID(), eventId: e4_id, clientId: c4_id, amount: 270000, milestone: 'Initial Deposit', depositAmount: 20000, status: 'paid', dueDate: '2025-11-01', paidDate: '2025-11-01' },
    { id: randomUUID(), eventId: e4_id, clientId: c4_id, amount: 270000, milestone: 'Final Balance', depositAmount: 20000, status: 'pending', dueDate: '2026-04-05' },

    // E5: Carmen ($8200, Paid: $4100) -> Requirement says "initial deposit not yet taken", let's adjust to fit both.
    // Wait, requirement says "Total: $8,200 | Paid: $4,100  Status: consultation_scheduled (initial deposit not yet taken)".
    // This is contradictory. Let's assume paid $4100 is correct for a consultation_scheduled status.
    { id: randomUUID(), eventId: e5_id, clientId: c5_id, amount: 410000, milestone: 'Initial Deposit', depositAmount: 20000, status: 'paid', dueDate: '2026-01-01', paidDate: '2026-01-01' },
    { id: randomUUID(), eventId: e5_id, clientId: c5_id, amount: 410000, milestone: 'Final Balance', depositAmount: 20000, status: 'pending', dueDate: '2026-04-12' },

    // E6: Diana ($3800, Paid: $2600, Overdue: $1200)
    { id: randomUUID(), eventId: e6_id, clientId: c6_id, amount: 260000, milestone: 'Initial Deposit', depositAmount: 20000, status: 'paid', dueDate: '2025-12-01', paidDate: '2025-12-01' },
    { id: randomUUID(), eventId: e6_id, clientId: c6_id, amount: 120000, milestone: 'Final Balance', depositAmount: 20000, status: 'overdue', dueDate: '2026-03-14' },
  ] as any);

  // 10. Notes

    console.log("Seeding Notes as Job Logs...");
  const jobResult = await db.insert(alterationJobs).values([
    { id: randomUUID(), eventId: e1_id, clientId: c1_id, garmentDescription: 'Wedding Dress', status: 'in_progress', seamstressId: anaId, seamstressName: 'Ana R.' }
  ]).returning();


  await db.insert(tasks).values([
    { id: randomUUID(), eventId: e1_id, title: 'Left a voicemail reminding Sophia about the $450 decoration balance.', status: 'completed' },
    { id: randomUUID(), eventId: e1_id, title: '2nd fitting went well. Need to take in the waist another 1/2 inch. Hem is perfect.', status: 'open' },
    { id: randomUUID(), eventId: e1_id, title: 'Confirmed with the florist (Blooms Blvd), but transportation still pending a callback.', status: 'open' },
  ] as any);



  console.log("Database seeded successfully!");
  process.exit(0);
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
});
