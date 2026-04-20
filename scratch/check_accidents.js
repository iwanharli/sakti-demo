import pg from 'pg';

const connectionString = 'postgresql://pendekar_sakti:s4kt1m4ndr4gun%40666@206.237.97.43:5432/db_sakti';
const pool = new pg.Pool({ connectionString });

async function checkAccidents() {
  try {
    const latestDateRes = await pool.query('SELECT MAX(accident_date) as max_d FROM sample_polisi_kecelakaan_data');
    const maxDate = latestDateRes.rows[0].max_d;

    if (!maxDate) {
      console.log("No data found in sample_polisi_kecelakaan_data");
      await pool.end();
      return;
    }

    const res = await pool.query(`
      SELECT 
        COUNT(*)::int as total
      FROM sample_polisi_kecelakaan_data
      WHERE accident_date >= ($1::date - INTERVAL '7 days')
    `, [maxDate]);

    console.log(`Latest Accident Date: ${new Date(maxDate).toISOString().split('T')[0]}`);
    console.log(`Total Accidents (Last 7 Days): ${res.rows[0].total}`);

    await pool.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkAccidents();
