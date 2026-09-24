import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables (.env.local takes precedence over .env)
dotenv.config({ path: '.env.local', override: true });
dotenv.config();

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
  verbose: true,
  strict: true,
});
