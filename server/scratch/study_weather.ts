import { dbSecondary } from '../src/db.ts';
import { nasionalBmkgWeatherByCity } from '../db/secondary/schema.ts';
import { count, sql } from 'drizzle-orm';

async function studyTable() {
  console.log('🔍 Studying table: nasional_bmkg_weather_by_city...');

  try {
    // 1. Total count
    const totalCount = await dbSecondary.select({ value: count() }).from(nasionalBmkgWeatherByCity);
    console.log(`Total Rows: ${totalCount[0].value}`);

    // 2. Sample Data (recently updated)
    console.log('\n--- Sample Records (Last 5) ---');
    const samples = await dbSecondary.select()
      .from(nasionalBmkgWeatherByCity)
      .limit(5);
    
    samples.forEach(s => {
      console.log(`- [${s.reportDate}] ${s.cityName} (${s.regionName}): ${s.condition}, Temp: ${s.tempAverage}°C, Hum: ${s.humidityAverage}%`);
    });

    // 3. Unique Conditions
    console.log('\n--- Common Conditions ---');
    const conditions = await dbSecondary.execute(sql`
      SELECT condition, count(*) as count 
      FROM nasional_bmkg_weather_by_city 
      GROUP BY condition 
      ORDER BY count DESC 
      LIMIT 10
    `);
    console.table(conditions.rows);

    // 4. City Statistics
    const cityCount = await dbSecondary.execute(sql`
      SELECT count(DISTINCT city_name) as count FROM nasional_bmkg_weather_by_city
    `);
    console.log(`\nTotal Unique Cities: ${cityCount.rows[0].count}`);

    // 5. Date Range
    const dateRange = await dbSecondary.execute(sql`
      SELECT MIN(report_date) as start_date, MAX(report_date) as end_date 
      FROM nasional_bmkg_weather_by_city
    `);
    console.log(`Date Range: ${dateRange.rows[0].start_date} to ${dateRange.rows[0].end_date}`);

  } catch (error) {
    console.error('❌ Error studying table:', error);
  } finally {
    process.exit();
  }
}

studyTable();
