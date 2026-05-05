import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

export default defineConfig({
  out: './src/db/tertiary/migrations',
  schema: './src/db/tertiary/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DB_TERTIARY_URL!,
  },
});
