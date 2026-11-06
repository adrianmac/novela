import { pgTable, pgEnum, text, timestamp, integer, uuid, date, boolean, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';

export const eventStatusEnum = pgEnum('event_status', ['lead', 'booked', 'in_progress', 'completed', 'cancelled']);
export const appointmentStatusEnum = pgEnum('appointment_status', ['upcoming', 'confirmed', 'completed', 'cancelled', 'no_show', 'reschedule_requested']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'overdue', 'waived']);
export const inventoryStatusEnum = pgEnum('inventory_status', ['available', 'reserved', 'rented', 'cleaning', 'overdue', 'retired', 'sold']);
export const alterationStatusEnum = pgEnum('alteration_status', ['measurement_needed', 'in_progress', 'fitting_scheduled', 'complete', 'pending', 'on_hold', 'cancelled']);
export const rentalStatusEnum = pgEnum('rental_status', ['reserved', 'picked_up', 'returned', 'overdue', 'cancelled']);

export const clients = pgTable('clients', {
  id: uuid('id').defaultRandom().primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  secondaryContactName: text('secondary_contact_name'),
  secondaryContactPhone: text('secondary_contact_phone'),
  hearAboutUs: text('hear_about_us'),
  referredBy: text('referred_by'),
  lastActivityDate: timestamp('last_activity_date').defaultNow().notNull(),
  winBackSentAt: timestamp('win_back_sent_at'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  phoneIdx: uniqueIndex('clients_phone_idx').on(table.phone),
  lastActivityIdx: index('clients_last_activity_idx').on(table.lastActivityDate),
}));

export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id').references(() => clients.id, { onDelete: 'cascade' }).notNull(),
  type: text('type').notNull(),
  date: date('date').notNull(),
  status: text('status').notNull(),
  guestCount: integer('guest_count'),
  venueName: text('venue_name'),
  venueCity: text('venue_city'),
  budgetRange: text('budget_range'),
  totalValue: integer('total_value').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  clientIdIdx: index('events_client_id_idx').on(table.clientId),
  statusIdx: index('events_status_idx').on(table.status),
  dateIdx: index('events_date_idx').on(table.date),
}));

export const eventServices = pgTable('event_services', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  serviceType: text('service_type').notNull(),
}, (table) => ({
  eventIdIdx: index('event_services_event_id_idx').on(table.eventId),
}));

export const appointments = pgTable('appointments', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  clientId: uuid('client_id').references(() => clients.id, { onDelete: 'cascade' }).notNull(),
  type: text('type').notNull(),
  date: timestamp('date').notNull(),
  staffId: text('staff_id'),
  staffName: text('staff_name'),
  notes: text('notes'),
  status: text('status').notNull(),
  reminder24hSent: boolean('reminder_24h_sent').default(false).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  eventIdIdx: index('appointments_event_id_idx').on(table.eventId),
  clientIdIdx: index('appointments_client_id_idx').on(table.clientId),
  staffIdIdx: index('appointments_staff_id_idx').on(table.staffId),
  dateIdx: index('appointments_date_idx').on(table.date),
  statusIdx: index('appointments_status_idx').on(table.status),
}));

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  clientId: uuid('client_id').references(() => clients.id, { onDelete: 'cascade' }).notNull(),
  milestone: text('milestone').notNull(),
  amount: integer('amount').notNull(),
  dueDate: date('due_date').notNull(),
  status: text('status').notNull(),
  paidAt: timestamp('paid_at'),
}, (table) => ({
  eventIdIdx: index('payments_event_id_idx').on(table.eventId),
  clientIdIdx: index('payments_client_id_idx').on(table.clientId),
  statusIdx: index('payments_status_idx').on(table.status),
  dueDateIdx: index('payments_due_date_idx').on(table.dueDate),
}));

export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  status: text('status').notNull(),
  dueDate: date('due_date'),
}, (table) => ({
  eventIdIdx: index('tasks_event_id_idx').on(table.eventId),
}));

export const inventory = pgTable('inventory', {
  id: uuid('id').defaultRandom().primaryKey(),
  sku: text('sku').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  size: text('size'),
  category: text('category').notNull(),
  rentalPrice: integer('rental_price').notNull(),
  depositAmount: integer('deposit_amount').notNull(),
  status: text('status').notNull().default('available'),
  imageUrl: text('image_url'),
  notes: text('notes'),
  lastCleanedDate: date('last_cleaned_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const inventoryRentals = pgTable('inventory_rentals', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  itemId: uuid('item_id').references(() => inventory.id, { onDelete: 'cascade' }).notNull(),
  status: text('status').notNull(),
  pickupDate: date('pickup_date').notNull(),
  returnDate: date('return_date').notNull(),
  conditionOnReturn: text('condition_on_return'),
  damageNotes: text('damage_notes'),
  returnedAt: timestamp('returned_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  eventIdIdx: index('inventory_rentals_event_id_idx').on(table.eventId),
  itemIdIdx: index('inventory_rentals_item_id_idx').on(table.itemId),
  statusIdx: index('inventory_rentals_status_idx').on(table.status),
  eventItemUniq: uniqueIndex('inventory_rentals_event_item_uniq').on(table.eventId, table.itemId),
}));

export const alterationJobs = pgTable('alteration_jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  clientId: uuid('client_id').references(() => clients.id, { onDelete: 'cascade' }).notNull(),
  inventoryItemId: uuid('inventory_item_id').references(() => inventory.id, { onDelete: 'set null' }),
  garmentDescription: text('garment_description').notNull(),
  status: text('status').notNull().default('measurement_needed'),
  seamstressId: text('seamstress_id'),
  seamstressName: text('seamstress_name'),
  measurementsJson: jsonb('measurements_json'),
  notes: text('notes'),
  totalEstimatedPrice: integer('total_estimated_price').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  eventIdIdx: index('alteration_jobs_event_id_idx').on(table.eventId),
  clientIdIdx: index('alteration_jobs_client_id_idx').on(table.clientId),
}));

export const alterationItems = pgTable('alteration_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  jobId: uuid('job_id').references(() => alterationJobs.id, { onDelete: 'cascade' }).notNull(),
  taskName: text('task_name').notNull(),
  description: text('description'),
  estimatedPrice: integer('estimated_price').notNull().default(0),
  isCompleted: boolean('is_completed').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  jobIdIdx: index('alteration_items_job_id_idx').on(table.jobId),
}));

export const jobLogs = pgTable('job_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  jobName: text('job_name').notNull(),
  status: text('status').notNull(),
  details: jsonb('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  jobNameIdx: index('job_logs_job_name_idx').on(table.jobName),
  createdAtIdx: index('job_logs_created_at_idx').on(table.createdAt),
}));

export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  text: text('text').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  eventIdIdx: index('notes_event_id_idx').on(table.eventId),
}));

export const staff = pgTable('staff', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  capacityHours: integer('capacity_hours').notNull().default(40),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id').references(() => clients.id, { onDelete: 'cascade' }).notNull(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'set null' }),
  score: integer('score').notNull(),
  phone: text('phone'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  clientIdIdx: index('reviews_client_id_idx').on(table.clientId),
  eventIdIdx: index('reviews_event_id_idx').on(table.eventId),
}));
