import { dbSecondary } from '../src/db.ts';
import { sql } from 'drizzle-orm';

async function auditWeatherData() {
  try {
    // 1. Total unique cities in DB
    const totalCitiesDB = await dbSecondary.execute(sql`
      SELECT COUNT(DISTINCT city_name) as count FROM nasional_bmkg_weather_by_city
    `);

    // 2. Sample data from DB vs logic in API
    const sampleCities = ['JAKARTA PUSAT', 'SURABAYA', 'MEDAN', 'MAKASSAR'];
    
    console.log('--- INTEGRITY AUDIT: BMKG DATA ---');
    console.log(`Total Unique Cities in DB: ${totalCitiesDB.rows[0].count}`);
    
    for (const city of sampleCities) {
      const dbResult = await dbSecondary.execute(sql`
        SELECT city_name, report_date, condition, temp_average, humidity_average
        FROM nasional_bmkg_weather_by_city
        WHERE city_name = ${city}
        ORDER BY report_date DESC
        LIMIT 1
      `);
      
      if (dbResult.rows.length > 0) {
        const row = dbResult.rows[0];
        console.log(`[${city}] Latest DB: ${row.report_date} | ${row.condition} | ${row.temp_average}°C | ${row.humidity_average}%`);
      } else {
        console.log(`[${city}] No data found in DB.`);
      }
    }
  } catch (error) {
    console.error('Audit failed:', error);
  } finally {
    process.exit();
  }
}

auditWeatherData();
