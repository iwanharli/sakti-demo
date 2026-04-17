import pg from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

async function listAllDatabases() {
  const connectionString = process.env.DB_SECONDARY_URL; // Using the secondary URL base
  if (!connectionString) return;

  // Extract base URI without the database name
  const baseUri = connectionString.substring(0, connectionString.lastIndexOf('/') + 1) + 'postgres';
  
  const pool = new pg.Pool({ connectionString: baseUri });

  try {
    console.log('--- Listing All Accessible Databases for user "soma" ---');
    const result = await pool.query('SELECT datname FROM pg_database WHERE datistemplate = false;');
    console.log('Databases:', JSON.stringify(result.rows, null, 2));
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error listing databases (likely permission denied for "postgres" db):', error.message);
    
    // Fallback: try to see if we can just list current db tables without keywords
    console.log('\n--- Fallback: Checking tables in current DB without filters ---');
    const poolCurrent = new pg.Pool({ connectionString: process.env.DB_SECONDARY_URL });
    const resCurrent = await poolCurrent.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
    console.log('Current DB (db_indonesiamonitoring) Tables:', JSON.stringify(resCurrent.rows, null, 2));
    await poolCurrent.end();
    process.exit(0);
  }
}

listAllDatabases();
