import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

// Import schemas
import * as primarySchema from './db/primary/schema';
import * as secondarySchema from './db/secondary/schema';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

// Primary DB Connection (db_sakti)
const primaryPool = new pg.Pool({
  connectionString: process.env.DB_PRIMARY_URL,
});

export const dbPrimary = drizzle(primaryPool, { 
  schema: primarySchema,
});

// Secondary DB Connection (db_indonesiamonitoring)
const secondaryPool = new pg.Pool({
  connectionString: process.env.DB_SECONDARY_URL,
});

export const dbSecondary = drizzle(secondaryPool, { 
  schema: secondarySchema,
});

console.log('✅ Dual-database client initialized');
