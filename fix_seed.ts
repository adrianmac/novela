import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './src/db/schema';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

async function seed() {
  console.log('Seeding alterations...');

  const allEvents = await db.select().from(schema.events);
  const allClients = await db.select().from(schema.clients);
  const allInventory = await db.select().from(schema.inventory);

  if (allEvents.length === 0 || allClients.length === 0 || allInventory.length < 2) {
     console.log('Not enough data to seed alterations. Run standard seed first.');
     return;
  }

  // Clear existing alteration jobs and items
  await db.delete(schema.alterationItems);
  await db.delete(schema.alterationJobs);

  const sampleJobs = [
    {
      eventId: allEvents[0].id,
      clientId: allEvents[0].clientId,
      inventoryItemId: allInventory[0].id,
      garmentDescription: allInventory[0].name,
      status: 'measurement_needed' as const,
      seamstressName: 'Maria G.',
      notes: 'Client wants a dramatic bustle.',
      totalEstimatedPrice: 15000,
    },
    {
      eventId: allEvents[1].id,
      clientId: allEvents[1].clientId,
      inventoryItemId: allInventory[1].id,
      garmentDescription: allInventory[1].name,
      status: 'in_progress' as const,
      seamstressName: 'Elena V.',
      notes: 'Hem needs to be brought up 2 inches.',
      totalEstimatedPrice: 8500,
    },
    {
      eventId: allEvents[0].id,
      clientId: allEvents[0].clientId,
      garmentDescription: 'Custom Quinceanera Dress',
      status: 'fitting_scheduled' as const,
      seamstressName: 'Elena V.',
      measurementsJson: JSON.stringify({ Bust: '34', Waist: '26', Hips: '36', Height: '65', 'Desired dress length': '58', 'Shoulder width': '15', 'Sleeve length': '22' }),
      notes: 'Second fitting scheduled.',
      totalEstimatedPrice: 20000,
    },
    {
      eventId: allEvents[1].id,
      clientId: allEvents[1].clientId,
      garmentDescription: 'Bridesmaid Dress (Pink)',
      status: 'complete' as const,
      seamstressName: 'Maria G.',
      notes: 'Ready for pickup.',
      totalEstimatedPrice: 5000,
    }
  ];

  for (const job of sampleJobs) {
    const [insertedJob] = await db.insert(schema.alterationJobs).values(job).returning();

    // Add items for the job
    await db.insert(schema.alterationItems).values([
      { jobId: insertedJob.id, taskName: 'Hem', description: 'Take up front hem', estimatedPrice: 5000, isCompleted: job.status === 'complete' ? 1 : 0 },
      { jobId: insertedJob.id, taskName: 'Bustle', description: 'Add 3-point over-bustle', estimatedPrice: job.totalEstimatedPrice - 5000, isCompleted: job.status === 'complete' ? 1 : 0 },
    ]);
  }
}

seed().then(() => {
  console.log("Alterations seeded");
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
