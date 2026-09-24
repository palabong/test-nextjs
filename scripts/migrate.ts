import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });
dotenv.config();

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("DATABASE_URL not found in environment. Skipping migration in isolated mode.");
    return;
  }

  try {
    new URL(connectionString);
  } catch {
    console.warn("Invalid DATABASE_URL provided. Skipping migration in isolated mode.");
    return;
  }

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  console.log("Applying versioned database migrations from ./drizzle...");
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log("Versioned database migrations applied successfully.");
  await client.end();
}

runMigrations().catch((err) => {
  console.error("Migration pipeline failed:", err);
  process.exit(1);
});
