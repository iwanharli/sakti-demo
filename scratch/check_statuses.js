
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  const pool = new pg.Pool({
    connectionString: process.env.DB_PRIMARY_URL,
  });

  try {
    const res = await pool.query('SELECT DISTINCT injury_status FROM sample_polisi_kecelakaan_data');
    console.log('Unique Injury Statuses:');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('Error querying database:', err);
  } finally {
    await pool.end();
  }
}

check();
