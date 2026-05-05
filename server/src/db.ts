import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

// Import schemas
import * as primarySchema from './db/primary/schema.js';
import * as secondarySchema from './db/secondary/schema.js';
import * as tertiarySchema from './db/tertiary/schema.js';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

// Primary DB Connection (db_sakti)
const primaryPool = new pg.Pool({
  connectionString: process.env.DB_PRIMARY_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
});

export const dbPrimary = drizzle(primaryPool, { 
  schema: primarySchema,
});

// Secondary DB Connection (db_indonesiamonitoring)
const secondaryPool = new pg.Pool({
  connectionString: process.env.DB_SECONDARY_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
});

export const dbSecondary = drizzle(secondaryPool, { 
  schema: secondarySchema,
});

// Tertiary DB Connection (db_bankkomen)
const tertiaryPool = new pg.Pool({
  connectionString: process.env.DB_TERTIARY_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
});

export const dbTertiary = drizzle(tertiaryPool, { 
  schema: tertiarySchema,
});

console.log('✅ Triple-database client initialized');
