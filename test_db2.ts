import { db } from './src/db';
import { events, clients } from './src/db/schema';
import { eq } from 'drizzle-orm';
async function run() {
  const data = await db.select({
    eventName: events.type,
    clientFirstName: clients.firstName,
    clientLastName: clients.lastName
  }).from(events).innerJoin(clients, eq(events.clientId, clients.id));
  console.log(data);
  process.exit(0);
}
run();
