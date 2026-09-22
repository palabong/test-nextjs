import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Connection string is expected to be provided via environment variable
const connectionString = process.env.DATABASE_URL || '';

// Create a safe connection pool. In serverless environments, connection management
// is crucial. If DATABASE_URL is not provided (e.g. during build or local dev without .env),
// we don't throw an error immediately, but queries will fail.
const client = connectionString ? postgres(connectionString, { prepare: false }) : null;

// Export the database instance with the schema applied
export const db = client ? drizzle(client, { schema }) : null;
