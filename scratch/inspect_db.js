import pg from 'pg';

const connectionString = 'postgres://soma:kiyaisoma%21%40%23123@206.237.97.43:5432/db_indonesiamonitoring';
const pool = new pg.Pool({ connectionString });

async function inspect() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'calculation_index_risiko'
    `);
    console.log('Columns:');
    console.table(res.rows);

    const data = await client.query(`SELECT * FROM calculation_index_risiko LIMIT 5`);
    console.log('Sample Data:');
    console.table(data.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

inspect().catch(console.error);
