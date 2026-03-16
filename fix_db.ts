import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';
const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

async function run() {
  await client`TRUNCATE TABLE inventory_rentals CASCADE`;
  await client`ALTER TABLE inventory_rentals ALTER COLUMN item_id TYPE uuid USING item_id::uuid`;
  process.exit(0);
}
run();
