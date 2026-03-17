import { db } from './src/db/index';
import { alterationJobs } from './src/db/schema';
async function run() {
  const jobs = await db.select().from(alterationJobs);
  console.log('Jobs count:', jobs.length);
  process.exit(0);
}
run();
