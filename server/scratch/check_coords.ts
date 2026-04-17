import { dbSecondary } from './src/db.ts';
import { sql } from 'drizzle-orm';

async function checkAdditionalData() {
  try {
    const results = await dbSecondary.execute(sql`
      SELECT cityName, additionalData 
      FROM nasional_bmkg_weather_by_city 
      WHERE additionalData IS NOT NULL
      LIMIT 5
    `);
    
    console.log('Sample City Weather Data (AdditionalData):');
    console.log(JSON.stringify(results.rows, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkAdditionalData();
