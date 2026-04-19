import pg from 'pg';

const connectionString = 'postgresql://pendekar_sakti:s4kt1m4ndr4gun%40666@206.237.97.43:5432/db_sakti';
const pool = new pg.Pool({ connectionString });

async function study() {
  const client = await pool.connect();
  try {
    // 1. Find all tables matching sample_sosmed_*
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE 'sample_sosmed_%' 
      AND table_schema = 'public'
    `);
    
    const tables = tablesRes.rows.map(r => r.table_name);
    console.log('--- FOUND TABLES ---');
    console.log(tables);

    for (const table of tables) {
      console.log(`\n\n=== STUDYING TABLE: ${table} ===`);
      
      // 2. Get columns and types
      const columnsRes = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table]);
      
      console.log('\n--- SCHEMA ---');
      console.table(columnsRes.rows);

      // 3. Get row count
      const countRes = await client.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`\n--- ROW COUNT: ${countRes.rows[0].count} ---`);

      // 4. Sample data (10 rows)
      const dataRes = await client.query(`SELECT * FROM ${table} LIMIT 10`);
      console.log('\n--- SAMPLE DATA (10 ROWS) ---');
      console.table(dataRes.rows);
      
      // 5. Check unique values for key categorical columns (if any)
      // Look for columns like 'platform', 'sentiment', 'category'
      const keyCols = columnsRes.rows
        .map(c => c.column_name)
        .filter(c => ['platform', 'sentiment', 'category', 'type', 'source'].includes(c.toLowerCase()));
      
      if (keyCols.length > 0) {
        console.log('\n--- UNIQUE VALUES IN KEY COLUMNS ---');
        for (const col of keyCols) {
          const uniqueRes = await client.query(`SELECT ${col}, COUNT(*) as count FROM ${table} GROUP BY ${col} ORDER BY count DESC`);
          console.log(`Column: ${col}`);
          console.table(uniqueRes.rows);
        }
      }
    }
  } catch (err) {
    console.error('Error during study:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

study();
