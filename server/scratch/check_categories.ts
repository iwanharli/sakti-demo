import { dbSecondary } from './src/db';
import { sql } from 'drizzle-orm';

async function checkCategories() {
  const result = await dbSecondary.execute(sql`SELECT DISTINCT category FROM nasional_kamtibmas_unjuk_rasa_data`);
  console.log('Categories:', result.rows);
  process.exit(0);
}

checkCategories().catch(err => {
  console.error(err);
  process.exit(1);
});
