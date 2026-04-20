import { dbPrimary } from '../server/src/db/primary/db';
import { sql } from 'drizzle-orm';

async function checkData() {
  try {
    const regions = await dbPrimary.execute(sql`SELECT DISTINCT region_name FROM sample_bnpb_bencana_data LIMIT 20`);
    console.log('Regions:', regions.rows.map(r => r.region_name));

    const events = await dbPrimary.execute(sql`SELECT DISTINCT event FROM sample_bnpb_bencana_data LIMIT 20`);
    console.log('Events:', events.rows.map(e => e.event));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkData();
