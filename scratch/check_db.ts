
import { dbSecondary } from '../server/src/db';
import { sql } from 'drizzle-orm';

async function checkDb() {
  try {
    const res = await dbSecondary.execute(sql`SELECT COUNT(*) FROM region_indonesia_cities`);
    console.log('Table region_indonesia_cities count:', res.rows[0].count);
  } catch (err) {
    console.error('Error checking table:', err.message);
  }
}

checkDb();
