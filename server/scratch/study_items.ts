import pg from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

async function checkItems() {
  const client = new pg.Client({
    connectionString: "postgres://soma:kiyaisoma%21%40%23123@206.237.97.43:5432/db_indonesiamonitoring"
  });

  try {
    await client.connect();
    console.log('--- Checking nasional_commodity_items ---');
    const res = await client.query('SELECT * FROM nasional_commodity_items LIMIT 20');
    console.log(JSON.stringify(res.rows, null, 2));
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkItems();
