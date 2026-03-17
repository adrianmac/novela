const postgres = require('postgres');
const sql = postgres('postgres://postgres:postgres@localhost:5432/postgres');

async function run() {
  const res = await sql`select * from alteration_jobs`;
  console.log(res);
  await sql.end();
}
run();
