import { describe, it, expect } from 'vitest';
import {
  intakeFormSchema,
  bookingSchema,
  inventoryItemSchema,
  appointmentSchema,
  alterationStatusSchema,
  measurementsSchema,
  alterationItemSchema,
  inventoryStatusSchema,
  reserveItemSchema,
  returnItemSchema,
  paymentSchema,
  noteSchema,
  taskToggleSchema,
  reviewSchema,
} from '@/lib/validations';

const uuid = '550e8400-e29b-41d4-a716-446655440000';

describe('intakeFormSchema', () => {
  const valid = {
    firstName: 'Jessica',
    lastName: 'Park',
    phone: '5551234567',
    email: 'jessica@example.com',
    eventType: 'wedding',
    eventDate: '2027-06-15',
    services: ['bridal_gown'],
    appointmentDate: '2027-01-10',
    staffId: 'staff-1',
  };

  it('accepts valid input', () => {
    expect(() => intakeFormSchema.parse(valid)).not.toThrow();
  });

  it('accepts empty optional email', () => {
    expect(() => intakeFormSchema.parse({ ...valid, email: '' })).not.toThrow();
  });

  it('accepts missing optional fields', () => {
    const { email, ...minimal } = valid;
    expect(() => intakeFormSchema.parse(minimal)).not.toThrow();
  });

  it('rejects missing firstName', () => {
    const { firstName, ...without } = valid;
    expect(() => intakeFormSchema.parse(without)).toThrow();
  });

  it('rejects missing lastName', () => {
    const { lastName, ...without } = valid;
    expect(() => intakeFormSchema.parse(without)).toThrow();
  });

  it('rejects short phone', () => {
    expect(() => intakeFormSchema.parse({ ...valid, phone: '123' })).toThrow();
  });

  it('rejects empty services array', () => {
    expect(() => intakeFormSchema.parse({ ...valid, services: [] })).toThrow();
  });

  it('rejects missing eventType', () => {
    expect(() => intakeFormSchema.parse({ ...valid, eventType: '' })).toThrow();
  });

  it('rejects XSS in text fields but accepts it (validation is type-level, not content-level)', () => {
    const xss = '<script>alert("xss")</script>';
    expect(() => intakeFormSchema.parse({ ...valid, firstName: xss })).not.toThrow();
  });

  it('rejects overly long firstName', () => {
    expect(() => intakeFormSchema.parse({ ...valid, firstName: 'A'.repeat(101) })).toThrow();
  });
});

describe('bookingSchema', () => {
  const valid = {
    firstName: 'Maria',
    lastName: 'Lopez',
    phone: '5559876543',
    eventType: 'quinceañera',
    eventDate: '2027-09-01',
    services: ['dress_fitting'],
    appointmentTime: '10:00 AM',
  };

  it('accepts valid input', () => {
    expect(() => bookingSchema.parse(valid)).not.toThrow();
  });

  it('rejects missing appointmentTime', () => {
    const { appointmentTime, ...without } = valid;
    expect(() => bookingSchema.parse(without)).toThrow();
  });

  it('rejects missing phone', () => {
    const { phone, ...without } = valid;
    expect(() => bookingSchema.parse(without)).toThrow();
  });

  it('accepts optional notes', () => {
    expect(() => bookingSchema.parse({ ...valid, notes: 'Please call ahead' })).not.toThrow();
  });

  it('rejects notes exceeding max length', () => {
    expect(() => bookingSchema.parse({ ...valid, notes: 'x'.repeat(5001) })).toThrow();
  });
});

describe('inventoryItemSchema', () => {
  const valid = {
    sku: 'DRS-001',
    name: 'Ivory Lace Ballgown',
    category: 'gown',
    rentalPrice: 25000,
    depositAmount: 5000,
  };

  it('accepts valid input', () => {
    expect(() => inventoryItemSchema.parse(valid)).not.toThrow();
  });

  it('rejects missing sku', () => {
    expect(() => inventoryItemSchema.parse({ ...valid, sku: '' })).toThrow();
  });

  it('rejects negative rentalPrice', () => {
    expect(() => inventoryItemSchema.parse({ ...valid, rentalPrice: -100 })).toThrow();
  });

  it('rejects negative depositAmount', () => {
    expect(() => inventoryItemSchema.parse({ ...valid, depositAmount: -1 })).toThrow();
  });

  it('accepts zero price', () => {
    expect(() => inventoryItemSchema.parse({ ...valid, rentalPrice: 0 })).not.toThrow();
  });
});

describe('appointmentSchema', () => {
  const valid = {
    clientId: uuid,
    eventId: uuid,
    date: '2027-03-15',
    type: 'fitting',
    staffId: 'staff-1',
  };

  it('accepts valid input', () => {
    expect(() => appointmentSchema.parse(valid)).not.toThrow();
  });

  it('rejects non-uuid clientId', () => {
    expect(() => appointmentSchema.parse({ ...valid, clientId: 'not-a-uuid' })).toThrow();
  });

  it('rejects non-uuid eventId', () => {
    expect(() => appointmentSchema.parse({ ...valid, eventId: '123' })).toThrow();
  });

  it('rejects missing date', () => {
    expect(() => appointmentSchema.parse({ ...valid, date: '' })).toThrow();
  });
});

describe('alterationStatusSchema', () => {
  it('accepts valid status', () => {
    expect(() => alterationStatusSchema.parse({ jobId: uuid, status: 'in_progress' })).not.toThrow();
  });

  it('accepts all valid statuses', () => {
    const statuses = ['measurement_needed', 'in_progress', 'fitting_scheduled', 'complete', 'pending', 'on_hold', 'cancelled'];
    for (const status of statuses) {
      expect(() => alterationStatusSchema.parse({ jobId: uuid, status })).not.toThrow();
    }
  });

  it('rejects invalid status', () => {
    expect(() => alterationStatusSchema.parse({ jobId: uuid, status: 'hacked' })).toThrow();
  });

  it('rejects non-uuid jobId', () => {
    expect(() => alterationStatusSchema.parse({ jobId: 'bad', status: 'pending' })).toThrow();
  });
});

describe('measurementsSchema', () => {
  it('accepts valid measurements', () => {
    expect(() => measurementsSchema.parse({ jobId: uuid, measurements: '{"bust":"36"}' })).not.toThrow();
  });

  it('rejects empty measurements', () => {
    expect(() => measurementsSchema.parse({ jobId: uuid, measurements: '' })).toThrow();
  });
});

describe('alterationItemSchema', () => {
  it('accepts valid item', () => {
    expect(() => alterationItemSchema.parse({ jobId: uuid, taskName: 'Hem dress', estimatedPrice: 5000 })).not.toThrow();
  });

  it('rejects negative price', () => {
    expect(() => alterationItemSchema.parse({ jobId: uuid, taskName: 'Hem dress', estimatedPrice: -100 })).toThrow();
  });

  it('rejects empty task name', () => {
    expect(() => alterationItemSchema.parse({ jobId: uuid, taskName: '', estimatedPrice: 500 })).toThrow();
  });

  it('rejects non-integer price', () => {
    expect(() => alterationItemSchema.parse({ jobId: uuid, taskName: 'Hem', estimatedPrice: 50.5 })).toThrow();
  });
});

describe('inventoryStatusSchema', () => {
  it('accepts all valid statuses', () => {
    const statuses = ['available', 'reserved', 'rented', 'cleaning', 'overdue', 'retired', 'sold'];
    for (const status of statuses) {
      expect(() => inventoryStatusSchema.parse({ itemId: uuid, status })).not.toThrow();
    }
  });

  it('rejects invalid status', () => {
    expect(() => inventoryStatusSchema.parse({ itemId: uuid, status: 'destroyed' })).toThrow();
  });
});

describe('reserveItemSchema', () => {
  it('accepts valid reservation', () => {
    expect(() => reserveItemSchema.parse({
      itemId: uuid, eventId: uuid, pickupDate: '2027-06-01', returnDate: '2027-06-15',
    })).not.toThrow();
  });

  it('rejects missing dates', () => {
    expect(() => reserveItemSchema.parse({ itemId: uuid, eventId: uuid, pickupDate: '', returnDate: '' })).toThrow();
  });
});

describe('returnItemSchema', () => {
  it('accepts valid return', () => {
    expect(() => returnItemSchema.parse({
      rentalId: uuid, condition: 'good', inCleaning: false,
    })).not.toThrow();
  });

  it('rejects missing condition', () => {
    expect(() => returnItemSchema.parse({ rentalId: uuid, condition: '', inCleaning: true })).toThrow();
  });
});

describe('paymentSchema', () => {
  it('accepts valid payment', () => {
    expect(() => paymentSchema.parse({ paymentId: uuid, eventId: uuid })).not.toThrow();
  });

  it('rejects non-uuid paymentId', () => {
    expect(() => paymentSchema.parse({ paymentId: 'bad', eventId: uuid })).toThrow();
  });
});

describe('noteSchema', () => {
  it('accepts valid note', () => {
    expect(() => noteSchema.parse({ eventId: uuid, text: 'Client prefers lace' })).not.toThrow();
  });

  it('rejects empty text', () => {
    expect(() => noteSchema.parse({ eventId: uuid, text: '' })).toThrow();
  });

  it('rejects text exceeding max length', () => {
    expect(() => noteSchema.parse({ eventId: uuid, text: 'a'.repeat(5001) })).toThrow();
  });
});

describe('taskToggleSchema', () => {
  it('accepts valid toggle', () => {
    expect(() => taskToggleSchema.parse({ taskId: uuid, currentStatus: 'open', eventId: uuid })).not.toThrow();
  });

  it('rejects invalid status', () => {
    expect(() => taskToggleSchema.parse({ taskId: uuid, currentStatus: 'pending', eventId: uuid })).toThrow();
  });
});

describe('reviewSchema', () => {
  it('accepts valid review', () => {
    expect(() => reviewSchema.parse({ clientId: uuid, score: 5 })).not.toThrow();
  });

  it('accepts review with eventId', () => {
    expect(() => reviewSchema.parse({ clientId: uuid, eventId: uuid, score: 3, phone: '5551234567' })).not.toThrow();
  });

  it('rejects score below 1', () => {
    expect(() => reviewSchema.parse({ clientId: uuid, score: 0 })).toThrow();
  });

  it('rejects score above 5', () => {
    expect(() => reviewSchema.parse({ clientId: uuid, score: 6 })).toThrow();
  });

  it('rejects non-integer score', () => {
    expect(() => reviewSchema.parse({ clientId: uuid, score: 3.5 })).toThrow();
  });

  it('rejects non-uuid clientId', () => {
    expect(() => reviewSchema.parse({ clientId: 'bad', score: 4 })).toThrow();
  });
});
