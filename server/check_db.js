import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DB_PRIMARY_URL
});

async function run() {
  await client.connect();
  
  // 1. Get all tables matching the pattern
  const tablesRes = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name LIKE 'sample_sosmed_%'
  `);
  
  console.log("=== TABLES FOUND ===");
  const tables = tablesRes.rows.map(r => r.table_name);
  console.log(tables.join(", ") + "\n");
  
  // 2. Map structure and row count for each table
  for (const table of tables) {
    console.log(`\n=== TABLE: ${table} ===`);
    
    // Get column types
    const columnsRes = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = $1
    `, [table]);
    
    console.log(`Columns:`);
    columnsRes.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Get sample data
    try {
      const sampleRes = await client.query(`SELECT * FROM ${table} LIMIT 2`);
      console.log(`\nSample Data (first 2 rows):`);
      console.log(JSON.stringify(sampleRes.rows, null, 2));
    } catch (e) {
      console.log('Could not fetch sample data');
    }
  }
  
  await client.end();
}

run();
