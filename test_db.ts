import { db } from './src/db';
import { events } from './src/db/schema';
async function run() {
  const allEvents = await db.select().from(events);
  console.log("Found", allEvents.length, "events");
  process.exit(0);
}
run();
