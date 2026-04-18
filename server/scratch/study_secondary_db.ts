import pg from 'pg';
const { Client } = pg;

async function studyTable() {
  const client = new Client({
    connectionString: 'postgres://soma:kiyaisoma%21%40%23123@206.237.97.43:5432/db_indonesiamonitoring',
  });

  try {
    await client.connect();
    console.log('--- TABLE SCHEMA: nasional_bmkg_warning_data ---');
    const schemaRes = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'nasional_bmkg_warning_data'
      ORDER BY ordinal_position;
    `);
    console.table(schemaRes.rows);

    console.log('\n--- SAMPLE DATA (TOP 3) ---');
    const dataRes = await client.query('SELECT * FROM nasional_bmkg_warning_data LIMIT 3;');
    console.log(JSON.stringify(dataRes.rows, null, 2));

    console.log('\n--- DATA VOLUME ---');
    const countRes = await client.query('SELECT count(*) FROM nasional_bmkg_warning_data;');
    console.log('Total Rows:', countRes.rows[0].count);

  } catch (err) {
    console.error('Error connecting or querying:', err);
  } finally {
    await client.end();
  }
}

studyTable();
