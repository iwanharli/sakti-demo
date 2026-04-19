import pg from 'pg';

const connectionString = 'postgres://soma:kiyaisoma%21%40%23123@206.237.97.43:5432/db_indonesiamonitoring';
const pool = new pg.Pool({ connectionString });

async function query() {
  try {
    const client = await pool.connect();
    console.log('Connected to DB');

    // 1. Get the latest date and count for that date
    const resLatest = await client.query(`
      SELECT report_date, count(*) 
      FROM calculation_index_risiko 
      WHERE category = 'skor-kamtibmas' 
      GROUP BY report_date 
      ORDER BY report_date DESC 
      LIMIT 1
    `);
    
    if (resLatest.rows.length > 0) {
      console.log('Latest date in table:', resLatest.rows[0].report_date);
      console.log('Count for latest date:', resLatest.rows[0].count);
    } else {
      console.log('No data found for category skor-kamtibmas');
    }

    // 2. specifically search for "today" candidates (2026-04-18 or 2026-04-19)
    const today = '2026-04-19';
    const resToday = await client.query(`
      SELECT count(*) 
      FROM calculation_index_risiko 
      WHERE category = 'skor-kamtibmas' 
      AND report_date = $1
    `, [today]);
    console.log(`Count for specifically ${today}:`, resToday.rows[0].count);

    // 3. List the provinces for the latest date to verify
    if (resLatest.rows.length > 0) {
      const latestDate = resLatest.rows[0].report_date;
      const resProvinces = await client.query(`
        SELECT region_name 
        FROM calculation_index_risiko 
        WHERE category = 'skor-kamtibmas' 
        AND report_date = $1
        ORDER BY region_name
      `, [latestDate]);
      console.log(`Provinces for ${latestDate}:`, resProvinces.rows.map(r => r.region_name).join(', '));
    }

    client.release();
  } catch (err) {
    console.error('Error executing query', err);
  } finally {
    await pool.end();
  }
}

query();
