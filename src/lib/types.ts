// Base entity types — derived from Drizzle schema tables

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  secondaryContactName: string | null;
  secondaryContactPhone: string | null;
  hearAboutUs: string | null;
  referredBy: string | null;
  lastActivityDate: Date;
  winBackSentAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
}

export interface Event {
  id: string;
  clientId: string;
  type: string;
  date: string;
  status: string;
  guestCount: number | null;
  venueName: string | null;
  venueCity: string | null;
  budgetRange: string | null;
  totalValue: number;
  updatedAt: Date;
  createdAt: Date;
}

export interface Appointment {
  id: string;
  eventId: string;
  clientId: string;
  type: string;
  date: Date;
  staffId: string | null;
  staffName: string | null;
  notes: string | null;
  status: string;
  reminder24hSent: boolean;
  updatedAt: Date;
  createdAt: Date;
}

export interface Payment {
  id: string;
  eventId: string;
  clientId: string;
  milestone: string;
  amount: number;
  dueDate: string;
  status: string;
  paidAt: Date | null;
}

export interface Task {
  id: string;
  eventId: string;
  title: string;
  status: string;
  dueDate: string | null;
}

export interface Note {
  id: string;
  eventId: string;
  text: string;
  createdAt: Date;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  size: string | null;
  category: string;
  rentalPrice: number;
  depositAmount: number;
  status: string;
  imageUrl: string | null;
  notes: string | null;
  lastCleanedDate: string | null;
  createdAt: Date;
}

export interface InventoryRental {
  id: string;
  eventId: string;
  itemId: string;
  status: string;
  pickupDate: string;
  returnDate: string;
  conditionOnReturn: string | null;
  damageNotes: string | null;
  returnedAt: Date | null;
  createdAt: Date;
}

export interface AlterationJob {
  id: string;
  eventId: string;
  clientId: string;
  inventoryItemId: string | null;
  garmentDescription: string;
  status: string;
  seamstressId: string | null;
  seamstressName: string | null;
  measurementsJson: unknown;
  notes: string | null;
  totalEstimatedPrice: number;
  createdAt: Date;
}

export interface AlterationItem {
  id: string;
  jobId: string;
  taskName: string;
  description: string | null;
  estimatedPrice: number;
  isCompleted: boolean;
  createdAt: Date;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  capacityHours: number;
}

// View models — enriched types used by components

export interface NoteDisplay {
  id: string;
  text: string;
  author: string;
  initials: string;
  role: string;
  time: string;
}

export interface AlterationJobWithRelations extends AlterationJob {
  client: Pick<Client, 'firstName' | 'lastName'>;
  event: Pick<Event, 'date' | 'type'>;
  items: AlterationItem[];
  fittings: Pick<Appointment, 'id' | 'date' | 'status'>[];
  inventory?: Pick<InventoryItem, 'sku' | 'name'> | null;
}

export interface InventoryItemWithRental extends InventoryItem {
  activeRental?: {
    id: string;
    clientName: string;
    pickupDate: string;
    returnDate: string;
  } | null;
}

export interface ScheduleAppointment {
  id: string;
  eventId: string;
  clientId: string;
  type: string;
  date: Date;
  staffId: string | null;
  staffName: string | null;
  status: string;
  clientFirstName: string | null;
  clientLastName: string | null;
  eventType: string | null;
}

export interface ScheduleData {
  appointments: ScheduleAppointment[];
  staff: StaffMember[];
  startDate: string;
  endDate: string;
}

export interface AvailabilityResult {
  available: boolean;
  conflicts?: Array<{
    pickupDate: string;
    returnDate: string;
    clientName: string;
  }>;
  alternatives?: Array<InventoryItem>;
}

export interface EventSearchResult {
  id: string;
  clientName: string;
  type: string;
  date: string;
}
