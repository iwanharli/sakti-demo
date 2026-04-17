
import pg from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { Client } = pg;

async function run() {
  const client = new Client({
    connectionString: "postgres://soma:kiyaisoma%21%40%23123@206.237.97.43:5432/db_indonesiamonitoring"
  });

  try {
    await client.connect();
    
    console.log("--- SCHEMA: nasional_pihps_commodity_regional_prices ---");
    const res = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'nasional_pihps_commodity_regional_prices'
      ORDER BY ordinal_position;
    `);
    console.table(res.rows);

    console.log("\n--- SAMPLE DATA (5 rows) ---");
    const sample = await client.query(`SELECT * FROM nasional_pihps_commodity_regional_prices LIMIT 5;`);
    console.table(sample.rows);

    console.log("\n--- SCHEMA: nasional_commodity_sp2kp (for comparison) ---");
    const res2 = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'nasional_commodity_sp2kp'
      ORDER BY ordinal_position;
    `);
    console.table(res2.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
