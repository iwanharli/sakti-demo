const { Client } = require('pg');
const DB_URL = 'postgresql://pendekar_sakti:s4kt1m4ndr4gun%40666@206.237.97.43:5432/db_sakti';

async function main() {
  const client = new Client({ connectionString: DB_URL });
  try {
    await client.connect();
    const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
    console.log('Columns in users table:');
    res.rows.forEach(row => console.log(`- ${row.column_name} (${row.data_type})`));
  } catch (err) {
    console.error('Inspection failed:', err);
  } finally {
    await client.end();
  }
}

main();
