
import pg from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const connectionString = process.env.DB_SECONDARY_URL;

async function inspect() {
  const pool = new pg.Pool({ connectionString });
  const client = await pool.connect();

  try {
    const tables = ['nasional_kamtibmas_case_data', 'nasional_kamtibmas_unjuk_rasa_data'];

    for (const table of tables) {
      console.log(`\n=== Table: ${table} ===`);
      
      // Get Schema
      const schemaQuery = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = '${table}'
        ORDER BY ordinal_position;
      `;
      const schemaRes = await client.query(schemaQuery);
      console.log('--- Schema ---');
      console.table(schemaRes.rows);

      // Get Sample Data
      const dataQuery = `SELECT * FROM ${table} LIMIT 5;`;
      const dataRes = await client.query(dataQuery);
      console.log('--- Sample Data ---');
      console.table(dataRes.rows);
    }
  } catch (err) {
    console.error('Error during inspection:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

inspect();
