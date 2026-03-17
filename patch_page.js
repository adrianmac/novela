const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

// I need to add the getHighestPriorityAlert function to the file
// I will place it above `export default async function DashboardOverview() {`

const functionDef = `
async function getHighestPriorityAlert() {
  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const in7Days = new Date(todayDate); in7Days.setDate(in7Days.getDate() + 7);
  const in14Days = new Date(todayDate); in14Days.setDate(in14Days.getDate() + 14);
  const in30Days = new Date(todayDate); in30Days.setDate(in30Days.getDate() + 30);
  const ago60Days = new Date(todayDate); ago60Days.setDate(ago60Days.getDate() - 60);

  // Helper to calculate days diff
  const getDaysDiff = (d1: Date, d2: Date) => Math.ceil(Math.abs(d1.getTime() - d2.getTime()) / (1000 * 3600 * 24));

  // 1. Priority 1: CRITICAL Event <= 7 days AND has overdue payment
  const p1_events = await db.select({
      eventId: events.id,
      firstName: clients.firstName,
      lastName: clients.lastName,
      eventDate: events.date,
      amount: payments.amount,
      milestone: payments.milestone
    })
    .from(events)
    .innerJoin(clients, eq(events.clientId, clients.id))
    .innerJoin(payments, eq(events.id, payments.eventId))
    .where(
      and(
        lte(events.date, in7Days),
        gte(events.date, todayDate),
        eq(payments.status, 'overdue')
      )
    )
    .limit(1);

  if (p1_events.length > 0) {
    const e = p1_events[0];
    const clientName = e.firstName + ' ' + e.lastName;
    const days = getDaysDiff(new Date(e.eventDate), todayDate);
    return {
      message: \`\${clientName} wedding is in \${days} days — $\${(e.amount / 100).toFixed(2)} \${e.milestone} is overdue\`,
      action: 'Collect payment →',
      href: \`/dashboard/events/\${e.eventId}\`,
      level: 'critical'
    };
  }

  // 2. Priority 2: CRITICAL Event <= 14 days AND has incomplete alteration_job AND NO completed 'final_fitting' appointment
  const p2_events = await db.select({
      eventId: events.id,
      firstName: clients.firstName,
      lastName: clients.lastName,
      eventDate: events.date
    })
    .from(events)
    .innerJoin(clients, eq(events.clientId, clients.id))
    .innerJoin(alterationJobs, eq(events.id, alterationJobs.eventId))
    .where(
      and(
        lte(events.date, in14Days),
        gte(events.date, todayDate),
        ne(alterationJobs.status, 'complete')
      )
    );

  for (const e of p2_events) {
    const finalFittings = await db.select().from(appointments).where(
      and(
        eq(appointments.eventId, e.eventId),
        eq(appointments.type, 'final_fitting'),
        eq(appointments.status, 'completed')
      )
    );
    if (finalFittings.length === 0) {
      const clientName = e.firstName + ' ' + e.lastName;
      const days = getDaysDiff(new Date(e.eventDate), todayDate);
      return {
        message: \`\${clientName}'s final fitting is not scheduled (event in \${days} days)\`,
        action: 'Schedule now →',
        href: \`/dashboard/staff/schedule\`,
        level: 'critical'
      };
    }
  }

  // 3. Priority 3: HIGH rental_record with status='rented' AND return_date < today
  const p3_rentals = await db.select({
      sku: inventory.sku,
      firstName: clients.firstName,
      lastName: clients.lastName,
      returnDate: inventoryRentals.returnDate,
      clientId: events.clientId
    })
    .from(inventoryRentals)
    .innerJoin(inventory, eq(inventoryRentals.itemId, inventory.id))
    .innerJoin(events, eq(inventoryRentals.eventId, events.id))
    .innerJoin(clients, eq(events.clientId, clients.id))
    .where(
      and(
        eq(inventoryRentals.status, 'rented'),
        lt(inventoryRentals.returnDate, todayDate.toISOString().split('T')[0])
      )
    )
    .limit(1);

  if (p3_rentals.length > 0) {
    const r = p3_rentals[0];
    const clientName = r.firstName + ' ' + r.lastName;
    const rDate = new Date(r.returnDate);
    const days = getDaysDiff(todayDate, rDate);
    return {
      message: \`Gown \${r.sku} rented to \${clientName} is \${days} days overdue for return\`,
      action: 'Contact client →',
      href: \`/dashboard/inventory\`,
      level: 'high'
    };
  }

  // 4. Priority 4: HIGH payment_milestone with status='overdue' AND (today - due_date) >= 3 days
  const ago3DaysStr = new Date(todayDate.getTime() - 3 * 24 * 3600 * 1000).toISOString().split('T')[0];
  const p4_payments = await db.select({
      firstName: clients.firstName,
      lastName: clients.lastName,
      milestone: payments.milestone,
      amount: payments.amount,
      dueDate: payments.dueDate,
      eventId: payments.eventId
    })
    .from(payments)
    .innerJoin(events, eq(payments.eventId, events.id))
    .innerJoin(clients, eq(events.clientId, clients.id))
    .where(
      and(
        eq(payments.status, 'overdue'),
        lte(payments.dueDate, ago3DaysStr)
      )
    )
    .limit(1);

  if (p4_payments.length > 0) {
    const p = p4_payments[0];
    const clientName = p.firstName + ' ' + p.lastName;
    const dDate = new Date(p.dueDate);
    const days = getDaysDiff(todayDate, dDate);
    return {
      message: \`\${clientName} — \${p.milestone} is \${days} days overdue ($\${(p.amount / 100).toFixed(2)})\`,
      action: 'Send reminder →',
      href: \`/dashboard/events/\${p.eventId}\`,
      level: 'high'
    };
  }

  // 5. Priority 5: MEDIUM Event <= 30 days AND any checklist item in 'required' category is not complete
  const p5_events_initial = await db.select({
      eventId: events.id,
      firstName: clients.firstName,
      lastName: clients.lastName,
      eventDate: events.date
    })
    .from(events)
    .innerJoin(clients, eq(events.clientId, clients.id))
    .where(
      and(
        lte(events.date, in30Days),
        gte(events.date, todayDate)
      )
    );

  for (const e of p5_events_initial) {
    const openTasks = await db.select().from(tasks).where(
      and(
        eq(tasks.eventId, e.eventId),
        eq(tasks.status, 'open')
      )
    ).limit(1);

    if (openTasks.length > 0) {
       const clientName = e.firstName + ' ' + e.lastName;
       const days = getDaysDiff(new Date(e.eventDate), todayDate);
       const allOpenTasks = await db.select().from(tasks).where(
        and(eq(tasks.eventId, e.eventId), eq(tasks.status, 'open'))
       );
       return {
         message: \`\${clientName}'s event is in \${days} days with \${allOpenTasks.length} required tasks open\`,
         action: 'View tasks →',
         href: \`/dashboard/events/\${e.eventId}\`,
         level: 'medium'
       };
    }
  }

  // 6. Priority 6: LOW Client with no event and last_activity > 60 days ago
  /*
  const p6_clients = await db.select({
      clientId: clients.id,
      firstName: clients.firstName,
      lastName: clients.lastName,
      createdAt: clients.createdAt
    })
    .from(clients)
    .leftJoin(events, eq(clients.id, events.clientId))
    .where(
      and(
        sql\`\${events.id} IS NULL\`,
        lt(clients.createdAt, ago60Days)
      )
    )
    .limit(1);

  if (p6_clients.length > 0) {
    const c = p6_clients[0];
    const clientName = c.firstName + ' ' + c.lastName;
    return {
      message: \`\${clientName} hasn't been in touch in 60 days\`,
      action: 'Send win-back →',
      href: \`/dashboard/clients\`,
      level: 'low'
    };
  }
  */
  // Replacing with a simpler subquery strategy to avoid the leftJoin isNull bug
  const activeClientIdsQuery = db.select({ id: events.clientId }).from(events);

  const p6_clients_alt = await db.select({
    clientId: clients.id,
    firstName: clients.firstName,
    lastName: clients.lastName,
    createdAt: clients.createdAt
  })
  .from(clients)
  .where(
    and(
      lt(clients.createdAt, ago60Days),
      sql\`\${clients.id} NOT IN (SELECT client_id FROM events)\`
    )
  )
  .limit(1);

  if (p6_clients_alt.length > 0) {
    const c = p6_clients_alt[0];
    const clientName = c.firstName + ' ' + c.lastName;
    return {
      message: \`\${clientName} hasn't been in touch in 60 days\`,
      action: 'Send win-back →',
      href: \`/dashboard/clients\`,
      level: 'low'
    };
  }

  return null;
}
`;

const replaceTarget = 'export default async function DashboardOverview() {';

// Check if imports exist
if (!content.includes('inventoryRentals')) {
    content = content.replace('events, appointments, payments, clients', 'events, appointments, payments, clients, inventoryRentals, alterationJobs, tasks, inventory');
}

if (!content.includes('ne,')) {
    content = content.replace('eq, or, and, lt, gte, sql, desc, asc', 'eq, or, and, lt, lte, gt, gte, sql, desc, asc, ne, isNull');
}

content = content.replace(replaceTarget, functionDef + '\n' + replaceTarget);

// We need to fetch the alert inside DashboardOverview
const hookPos = content.indexOf('const [');
const fetchCall = `  const highestPriorityAlert = await getHighestPriorityAlert();\n`;

content = content.slice(0, hookPos) + fetchCall + content.slice(hookPos);

fs.writeFileSync('src/app/dashboard/page.tsx', content);

console.log("Successfully patched page.tsx logic");
