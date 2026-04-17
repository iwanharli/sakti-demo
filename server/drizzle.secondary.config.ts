import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

export default defineConfig({
  out: './db/secondary/migrations',
  schema: './db/secondary/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DB_SECONDARY_URL!,
  },
});
