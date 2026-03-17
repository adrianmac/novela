'use server'

import { db } from "@/db";
import { payments } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function generateMilestones(
  event: { id: string, clientId: string, date: string | Date, services_json?: string[] },
  totalAmount: number
) {
  const eventDate = new Date(event.date);
  const today = new Date();

  // Calculate days difference between today and event date
  const timeDiff = eventDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  const isCompressed = daysDiff < 180;

  // Helper to add days to a date
  const addDays = (date: Date, days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const todayPlus3 = addDays(today, 3);
  const eventMinus14 = addDays(eventDate, -14);
  const eventMinus3 = addDays(eventDate, -3);

  // Default to full package if multiple services or specific combination
  const services = event.services_json || [];

  let template = 'full';

  if (services.length === 1 && services.includes('decoration')) {
    template = 'decoration_only';
  } else if (services.length === 2 && services.includes('planning') && services.includes('decoration')) {
    template = 'planning_decoration';
  } else if (services.length <= 2 && (services.includes('dress_rental') || services.includes('alterations'))) {
    template = 'dress_alterations';
  } else if (services.length >= 3) {
    template = 'full';
  }

  const generatedMilestones = [];

  if (template === 'full') {
    // Milestone 1: Booking deposit 25% due: event_date - 180 days (or today + 3)
    let depositDue = addDays(eventDate, -180);
    if (isCompressed || new Date(depositDue) < today) {
      depositDue = todayPlus3;
    }
    generatedMilestones.push({
      eventId: event.id,
      clientId: event.clientId,
      milestone: 'Booking deposit',
      amount: Math.round(totalAmount * 0.25),
      dueDate: depositDue,
      status: 'pending'
    });

    // Milestone 2: Mid-point payment 50%
    let midPointDue = addDays(eventDate, -90);
    if (isCompressed) {
      const ms = eventDate.getTime() - 14 * 24 * 3600 * 1000;
      const midpointTime = today.getTime() + (ms - today.getTime()) / 2;
      midPointDue = new Date(midpointTime).toISOString().split('T')[0];
    }
    generatedMilestones.push({
      eventId: event.id,
      clientId: event.clientId,
      milestone: 'Mid-point payment',
      amount: Math.round(totalAmount * 0.50),
      dueDate: midPointDue,
      status: 'pending'
    });



  // Milestone 3: Final balance 25% due: event_date - 14 days
    generatedMilestones.push({
      eventId: event.id,
      clientId: event.clientId,
      milestone: 'Final balance',
      amount: Math.round(totalAmount * 0.25),
      dueDate: eventMinus14,
      status: 'pending'
    });
  } else if (template === 'dress_alterations') {
    generatedMilestones.push({
      eventId: event.id,
      clientId: event.clientId,
      milestone: 'Dress reservation deposit',
      amount: Math.round(totalAmount * 0.30),
      dueDate: todayPlus3,
      status: 'pending'
    });

    // Final balance is due pickup_date.
    // Since we don't have pickup date reliably right now, we default to event_date - 3
    generatedMilestones.push({
      eventId: event.id,
      clientId: event.clientId,
      milestone: 'Final balance',
      amount: Math.round(totalAmount * 0.70),
      dueDate: eventMinus3,
      status: 'pending'
    });

  } else if (template === 'planning_decoration') {
    generatedMilestones.push({
      eventId: event.id,
      clientId: event.clientId,
      milestone: 'Planning deposit',
      amount: Math.round(totalAmount * 0.50),
      dueDate: todayPlus3,
      status: 'pending'
    });
    generatedMilestones.push({
      eventId: event.id,
      clientId: event.clientId,
      milestone: 'Final balance',
      amount: Math.round(totalAmount * 0.50),
      dueDate: eventMinus3,
      status: 'pending'
    });

  } else if (template === 'decoration_only') {
    generatedMilestones.push({
      eventId: event.id,
      clientId: event.clientId,
      milestone: 'Setup deposit',
      amount: Math.round(totalAmount * 0.50),
      dueDate: todayPlus3,
      status: 'pending'
    });
    generatedMilestones.push({
      eventId: event.id,
      clientId: event.clientId,
      milestone: 'Final balance',
      amount: Math.round(totalAmount * 0.50),
      dueDate: eventMinus3,
      status: 'pending'
    });
  }

  const insertedMilestones = await db.insert(payments).values(generatedMilestones).returning();
  return insertedMilestones;
}
