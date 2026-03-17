import { inngest } from "./client";
import { db } from "@/db";
import { appointments, clients, events, payments, inventoryRentals, inventory, jobLogs, tasks } from "@/db/schema";
import { eq, and, or, lt, lte, gt, gte, sql, inArray } from "drizzle-orm";

// Utility function to log to job_logs
async function logJob(jobName: string, status: 'success' | 'failed', details: any) {
  try {
    await db.insert(jobLogs).values({
      jobName,
      status,
      details,
    });
  } catch (e) {
    console.error("Failed to insert job log", e);
  }
}

// Mock Twilio SMS sender
async function sendSMS(phone: string, message: string) {
  console.log(`\n[Twilio SMS] To: ${phone}\nMessage: ${message}\n`);
  return { success: true, messageId: `msg_${Math.random().toString(36).substring(7)}` };
}

// ------------------------------------------------------------------------------------------------------------------
// JOB 1: appointment-reminder-24h
// Trigger: Scheduled, runs daily at 10:00 AM
// Query: appointments WHERE start_time BETWEEN tomorrow 00:00 AND tomorrow 23:59 AND status IN ('scheduled', 'confirmed') AND reminder_24h_sent = false
// ------------------------------------------------------------------------------------------------------------------
export const appointmentReminder24h = inngest.createFunction(
  { id: "appointment-reminder-24h", name: "24h Appointment Reminder" },
  { cron: "0 10 * * *" }, // daily at 10am
  async ({ step }) => {
    const tomorrowStart = new Date();
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const appts = await step.run("fetch-appointments", async () => {
      // In the current schema, status for scheduled is 'upcoming' or 'confirmed'
      return await db.select({
        id: appointments.id,
        date: appointments.date,
        type: appointments.type,
        clientFirstName: clients.firstName,
        clientPhone: clients.phone,
      })
      .from(appointments)
      .innerJoin(clients, eq(appointments.clientId, clients.id))
      .where(
        and(
          inArray(appointments.status, ['upcoming', 'confirmed']),
          eq(appointments.reminder24hSent, false),
          gte(appointments.date, tomorrowStart),
          lte(appointments.date, tomorrowEnd)
        )
      );
    });

    if (appts.length === 0) {
      await step.run("log-completion", () => logJob('appointment-reminder-24h', 'success', { processed: 0 }));
      return { processed: 0 };
    }

    const processedIds: string[] = [];

    for (const appt of appts) {
      await step.run(`send-sms-${appt.id}`, async () => {
        if (!appt.clientPhone) return;

        const dayOfWeek = new Date(appt.date).toLocaleDateString('en-US', { weekday: 'long' });
        const time = new Date(appt.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        const message = `Hi ${appt.clientFirstName}! Reminder: your ${appt.type} with Bella Bridal is tomorrow ${dayOfWeek} at ${time} at 123 Bridal Way. Reply C to confirm or R to reschedule.`;

        await sendSMS(appt.clientPhone, message);

        await db.update(appointments)
          .set({ reminder24hSent: true })
          .where(eq(appointments.id, appt.id));
      });
      processedIds.push(appt.id);
    }

    await step.run("log-completion", () => logJob('appointment-reminder-24h', 'success', { processed: processedIds.length, ids: processedIds }));
    return { processed: processedIds.length };
  }
);

// ------------------------------------------------------------------------------------------------------------------
// JOB 2: payment-overdue-check
// Trigger: Scheduled, runs daily at 9:00 AM
// Query: payment_milestones WHERE due_date < today AND status = 'pending'
// ------------------------------------------------------------------------------------------------------------------
export const paymentOverdueCheck = inngest.createFunction(
  { id: "payment-overdue-check", name: "Daily Payment Overdue Check" },
  { cron: "0 9 * * *" }, // daily at 9am
  async ({ step }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const todayMinus7 = new Date(today);
    todayMinus7.setDate(todayMinus7.getDate() - 7);
    const todayMinus7Str = todayMinus7.toISOString().split('T')[0];

    // Mark as overdue
    const updatedCount = await step.run("mark-overdue", async () => {
      const result = await db.update(payments)
        .set({ status: 'overdue' })
        .where(
          and(
            lt(payments.dueDate, todayStr),
            eq(payments.status, 'pending')
          )
        )
        .returning();
      return result.length;
    });

    // Fetch all currently overdue payments for notification rules
    const overduePayments = await step.run("fetch-overdue", async () => {
      return await db.select({
        id: payments.id,
        amount: payments.amount,
        milestone: payments.milestone,
        dueDate: payments.dueDate,
        eventId: payments.eventId,
        clientName: sql<string>`${clients.firstName} || ' ' || ${clients.lastName}`,
        clientPhone: clients.phone,
        eventType: events.type,
      })
      .from(payments)
      .innerJoin(clients, eq(payments.clientId, clients.id))
      .innerJoin(events, eq(payments.eventId, events.id))
      .where(eq(payments.status, 'overdue'));
    });

    let sentInitial = 0;
    let sentUrgent = 0;

    for (const p of overduePayments) {
      const pDueDate = new Date(p.dueDate).toISOString().split('T')[0];
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // If it became overdue today (meaning due date was yesterday)
      if (pDueDate === yesterdayStr) {
        await step.run(`send-initial-overdue-${p.id}`, async () => {
          if (!p.clientPhone) return;
          const amtStr = (p.amount / 100).toFixed(2);
          const msg = `Hi ${p.clientName}, your ${p.milestone} payment of $${amtStr} for your ${p.eventType} is now due. Pay here: https://bella-bridal.com/pay/${p.id}`;
          await sendSMS(p.clientPhone, msg);
        });
        sentInitial++;
      }

      // If overdue by exactly 7 days
      if (pDueDate === todayMinus7Str) {
        await step.run(`send-urgent-overdue-${p.id}`, async () => {
          if (!p.clientPhone) return;
          const amtStr = (p.amount / 100).toFixed(2);
          const msg = `URGENT: Hi ${p.clientName}, your ${p.milestone} payment of $${amtStr} is 7 days overdue. Please remit payment immediately to avoid service interruption: https://bella-bridal.com/pay/${p.id}`;
          await sendSMS(p.clientPhone, msg);

          // Create dashboard notification task
          await db.insert(tasks).values({
            eventId: p.eventId,
            title: `Follow up urgently: ${p.clientName} payment 7 days overdue`,
            status: 'open',
            dueDate: todayStr,
          });
        });
        sentUrgent++;
      }
    }

    await step.run("log-completion", () => logJob('payment-overdue-check', 'success', { markedOverdue: updatedCount, sentInitial, sentUrgent }));
    return { markedOverdue: updatedCount, sentInitial, sentUrgent };
  }
);

// ------------------------------------------------------------------------------------------------------------------
// JOB 3: dress-return-reminder
// Trigger: Scheduled, runs daily at 10:00 AM
// Query: rental_records WHERE return_date = tomorrow AND status = 'rented'
// ------------------------------------------------------------------------------------------------------------------
export const dressReturnReminder = inngest.createFunction(
  { id: "dress-return-reminder", name: "Dress Return Reminder" },
  { cron: "0 10 * * *" }, // daily at 10am
  async ({ step }) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const rentalsDue = await step.run("fetch-rentals", async () => {
      return await db.select({
        id: inventoryRentals.id,
        sku: inventory.sku,
        clientName: clients.firstName,
        clientPhone: clients.phone,
      })
      .from(inventoryRentals)
      .innerJoin(inventory, eq(inventoryRentals.itemId, inventory.id))
      .innerJoin(events, eq(inventoryRentals.eventId, events.id))
      .innerJoin(clients, eq(events.clientId, clients.id))
      .where(
        and(
          eq(inventoryRentals.returnDate, tomorrowStr),
          eq(inventoryRentals.status, 'rented')
        )
      );
    });

    const processed: string[] = [];
    for (const r of rentalsDue) {
      await step.run(`send-return-reminder-${r.id}`, async () => {
        if (!r.clientPhone) return;
        const msg = `Hi ${r.clientName}! This is a reminder that gown ${r.sku} is due back at Bella Bridal tomorrow by 5pm. Questions? Call us at 555-0199.`;
        await sendSMS(r.clientPhone, msg);
      });
      processed.push(r.id);
    }

    await step.run("log-completion", () => logJob('dress-return-reminder', 'success', { count: processed.length }));
    return { count: processed.length };
  }
);

// ------------------------------------------------------------------------------------------------------------------
// JOB 4: post-event-review-request
// Trigger: Event-driven, fires when event.status changes to 'completed'
// Delay: wait 24 hours after trigger
// ------------------------------------------------------------------------------------------------------------------
export const postEventReviewRequest = inngest.createFunction(
  { id: "post-event-review-request", name: "Post Event Review Request" },
  { event: "event/completed" },
  async ({ event, step }) => {
    const { eventId, clientId, clientFirstName, clientPhone, eventType } = event.data;

    // Wait 24 hours
    await step.sleep("wait-24h", "24h");

    // Re-verify the event is still completed and exists
    const stillCompleted = await step.run("verify-status", async () => {
      const e = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
      return e.length > 0 && e[0].status === 'completed';
    });

    if (!stillCompleted) {
       await step.run("log-abort", () => logJob('post-event-review-request', 'failed', { reason: 'Status changed from completed', eventId }));
       return { status: "aborted, no longer completed" };
    }

    await step.run("send-review-request", async () => {
      if (!clientPhone) return;
      const msg = `Hi ${clientFirstName}! We loved being part of your ${eventType}! Could you rate your experience? Reply 1-5 (5 = amazing). It only takes 2 seconds!`;
      await sendSMS(clientPhone, msg);
      // We would ideally save a record indicating we are expecting a review score from this phone number
      // We'll use the Twilio webhook to parse the '1-5' reply.
    });

    await step.run("log-completion", () => logJob('post-event-review-request', 'success', { eventId }));
    return { success: true, eventId };
  }
);

// ------------------------------------------------------------------------------------------------------------------
// JOB 5: win-back-campaign
// Trigger: Scheduled, runs every Monday at 11:00 AM
// Query: clients WHERE last_activity_date < today - 60 days AND no future events exist AND win_back_sent_at IS NULL OR win_back_sent_at < today - 90 days
// ------------------------------------------------------------------------------------------------------------------
export const winBackCampaign = inngest.createFunction(
  { id: "win-back-campaign", name: "Win Back Campaign" },
  { cron: "0 11 * * 1" }, // every Monday at 11am
  async ({ step }) => {
    const today = new Date();
    const ago60Days = new Date(today);
    ago60Days.setDate(ago60Days.getDate() - 60);

    const ago90Days = new Date(today);
    ago90Days.setDate(ago90Days.getDate() - 90);

    const clientsToWinBack = await step.run("fetch-win-back-clients", async () => {
      // Find clients matching criteria
      const allClients = await db.select({
        id: clients.id,
        firstName: clients.firstName,
        phone: clients.phone,
        winBackSentAt: clients.winBackSentAt,
      })
      .from(clients)
      .where(lte(clients.lastActivityDate, ago60Days));

      const qualified: any[] = [];
      const todayStr = today.toISOString().split('T')[0];

      for (const c of allClients) {
        // Check win_back_sent_at condition
        if (c.winBackSentAt && new Date(c.winBackSentAt) >= ago90Days) {
          continue;
        }

        // Check if no future events exist
        const futureEvents = await db.select().from(events).where(
          and(
            eq(events.clientId, c.id),
            gte(events.date, todayStr),
            or(eq(events.status, 'active'), eq(events.status, 'in_progress'), eq(events.status, 'consultation_scheduled'))
          )
        );

        if (futureEvents.length === 0) {
          qualified.push(c);
        }
      }
      return qualified;
    });

    const processed: string[] = [];
    for (const c of clientsToWinBack) {
      await step.run(`send-winback-${c.id}`, async () => {
        if (!c.phone) return;
        const msg = `Hi ${c.firstName}! It's been a while since your visit to Bella Bridal. We'd love to see you again! Book a free consultation: https://bella-bridal.com/book`;
        await sendSMS(c.phone, msg);

        await db.update(clients)
          .set({ winBackSentAt: new Date() })
          .where(eq(clients.id, c.id));
      });
      processed.push(c.id);
    }

    await step.run("log-completion", () => logJob('win-back-campaign', 'success', { count: processed.length }));
    return { count: processed.length };
  }
);
