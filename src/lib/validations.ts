import { z } from 'zod';

const phone = z.string().min(10, 'Phone must be at least 10 digits').max(20);
const optionalEmail = z.string().email('Invalid email').optional().or(z.literal(''));

export const intakeFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  phone: phone,
  email: optionalEmail,
  secondaryContactName: z.string().max(100).optional().or(z.literal('')),
  secondaryContactPhone: z.string().max(20).optional().or(z.literal('')),
  hearAboutUs: z.string().max(100).optional().or(z.literal('')),
  referredBy: z.string().max(200).optional().or(z.literal('')),
  eventType: z.string().min(1, 'Event type is required'),
  eventDate: z.string().min(1, 'Event date is required'),
  guestCount: z.union([z.string(), z.number()]).optional(),
  venueName: z.string().max(200).optional().or(z.literal('')),
  venueCity: z.string().max(200).optional().or(z.literal('')),
  budgetRange: z.string().optional().or(z.literal('')),
  services: z.array(z.string()).min(1, 'Select at least one service'),
  appointmentDate: z.string().min(1, 'Appointment date is required'),
  staffId: z.string().min(1, 'Staff member is required'),
  staffName: z.string().optional(),
  appointmentNotes: z.string().max(2000).optional().or(z.literal('')),
});

export const bookingSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  phone: phone,
  email: optionalEmail,
  eventType: z.string().min(1, 'Event type is required'),
  eventDate: z.string().min(1, 'Event date is required'),
  services: z.array(z.string()).min(1, 'Select at least one service'),
  appointmentTime: z.string().min(1, 'Appointment time is required'),
  guestCount: z.union([z.string(), z.number()]).optional(),
  venue: z.string().max(200).optional().or(z.literal('')),
  howFound: z.string().optional().or(z.literal('')),
  contactMethod: z.string().optional().or(z.literal('')),
  notes: z.string().max(5000).optional().or(z.literal('')),
});

export const inventoryItemSchema = z.object({
  sku: z.string().min(1, 'SKU is required').max(50),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(2000).optional().or(z.literal('')),
  size: z.string().max(20).optional().or(z.literal('')),
  category: z.string().min(1, 'Category is required'),
  rentalPrice: z.number().min(0, 'Price must be non-negative'),
  depositAmount: z.number().min(0, 'Deposit must be non-negative'),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

export const appointmentSchema = z.object({
  clientId: z.string().uuid('Invalid client ID'),
  eventId: z.string().uuid('Invalid event ID'),
  date: z.string().min(1, 'Date is required'),
  type: z.string().min(1, 'Appointment type is required'),
  staffId: z.string().min(1, 'Staff member is required'),
  notes: z.string().max(2000).optional().or(z.literal('')),
});

export const alterationStatusSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  status: z.enum([
    'measurement_needed', 'in_progress', 'fitting_scheduled', 'complete',
    'pending', 'on_hold', 'cancelled',
  ]),
});

export const measurementsSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  measurements: z.string().min(1, 'Measurements are required'),
});

export const alterationItemSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  taskName: z.string().min(1, 'Task name is required').max(200),
  description: z.string().max(1000).optional().or(z.literal('')),
  estimatedPrice: z.number().int().min(0, 'Price must be non-negative'),
});

export const inventoryStatusSchema = z.object({
  itemId: z.string().uuid('Invalid item ID'),
  status: z.enum(['available', 'reserved', 'rented', 'cleaning', 'overdue', 'retired', 'sold']),
});

export const reserveItemSchema = z.object({
  itemId: z.string().uuid('Invalid item ID'),
  eventId: z.string().uuid('Invalid event ID'),
  pickupDate: z.string().min(1, 'Pickup date is required'),
  returnDate: z.string().min(1, 'Return date is required'),
});

export const returnItemSchema = z.object({
  rentalId: z.string().uuid('Invalid rental ID'),
  condition: z.string().min(1, 'Condition assessment is required'),
  notes: z.string().max(2000).optional().or(z.literal('')),
  inCleaning: z.boolean(),
});

export const paymentSchema = z.object({
  paymentId: z.string().uuid('Invalid payment ID'),
  eventId: z.string().uuid('Invalid event ID'),
});

export const noteSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  text: z.string().min(1, 'Note text is required').max(5000),
});

export const taskToggleSchema = z.object({
  taskId: z.string().uuid('Invalid task ID'),
  currentStatus: z.enum(['open', 'completed']),
  eventId: z.string().uuid('Invalid event ID'),
});

export const reviewSchema = z.object({
  clientId: z.string().uuid('Invalid client ID'),
  eventId: z.string().uuid('Invalid event ID').optional(),
  score: z.number().int().min(1).max(5),
  phone: z.string().max(20).optional(),
});
