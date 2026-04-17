import { dbSecondary } from './src/db.ts';
import { sql } from 'drizzle-orm';

async function studyProvinces() {
  try {
    const results = await dbSecondary.execute(sql`
      SELECT 
        region_name,
        COUNT(city_name) as city_count,
        AVG(temp_average) as avg_temp,
        AVG(humidity_average) as avg_humidity
      FROM nasional_bmkg_weather_by_city
      WHERE report_date = (SELECT MAX(report_date) FROM nasional_bmkg_weather_by_city)
      GROUP BY region_name
      ORDER BY region_name ASC
    `);
    
    console.log('Provincial Weather Summary:');
    console.table(results.rows);
  } catch (error) {
    console.error('Error fetching province data:', error);
  } finally {
    process.exit();
  }
}

studyProvinces();
