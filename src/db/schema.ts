import { pgTable, text, timestamp, integer, uuid, date } from 'drizzle-orm/pg-core';

export const clients = pgTable('clients', {
  id: uuid('id').defaultRandom().primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  secondaryContactName: text('secondary_contact_name'),
  secondaryContactPhone: text('secondary_contact_phone'),
  hearAboutUs: text('hear_about_us'), // Walk-in, Instagram, Google, Facebook, Referral, Other
  referredBy: text('referred_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id').references(() => clients.id).notNull(),
  type: text('type').notNull(), // 'wedding' or 'quinceanera'
  date: date('date').notNull(),
  status: text('status').notNull(), // inquiry, consultation_scheduled, active, in_progress, completed, cancelled
  guestCount: integer('guest_count'),
  venueName: text('venue_name'),
  venueCity: text('venue_city'),
  budgetRange: text('budget_range'), // Under $2,000 | $2,000-$4,000 | $4,000-$7,000 | $7,000-$10,000 | $10,000+
  totalValue: integer('total_value').notNull().default(0), // in cents
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const eventServices = pgTable('event_services', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').references(() => events.id).notNull(),
  serviceType: text('service_type').notNull(), // dress_rental, alterations, planning, decoration
});

export const appointments = pgTable('appointments', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').references(() => events.id).notNull(),
  clientId: uuid('client_id').references(() => clients.id).notNull(),
  type: text('type').notNull(), // consultation, fitting, pickup
  date: timestamp('date').notNull(),
  staffId: text('staff_id'), // clerk user id
  staffName: text('staff_name'),
  notes: text('notes'),
  status: text('status').notNull(), // upcoming, confirmed, checked_in, completed, cancelled
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').references(() => events.id).notNull(),
  clientId: uuid('client_id').references(() => clients.id).notNull(),
  milestone: text('milestone').notNull(), // Deposit, 50% Milestone, Final Payment
  amount: integer('amount').notNull(), // in cents
  dueDate: date('due_date').notNull(),
  status: text('status').notNull(), // paid, pending, overdue
  paidAt: timestamp('paid_at'),
});

export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').references(() => events.id).notNull(),
  title: text('title').notNull(),
  status: text('status').notNull(), // open, completed
  dueDate: date('due_date'),
});

export const inventoryRentals = pgTable('inventory_rentals', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').references(() => events.id).notNull(),
  itemId: text('item_id').notNull(), // SKU or ID of dress/decor
  status: text('status').notNull(), // reserved, rented, returned, overdue
  returnDate: date('return_date').notNull(),
});
