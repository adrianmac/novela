import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// For the purpose of rendering the UI, we don't strictly need a real DB connection during build/design,
// but we will stub the export.
// In a real app, you would pass your connection string via process.env.DATABASE_URL
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';

// Disable prefetch as it is not needed for serverless environments
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
