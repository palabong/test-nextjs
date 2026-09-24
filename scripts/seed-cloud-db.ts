import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });
dotenv.config();

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../lib/db/schema';
import { logEvents, ingestionChannels } from '../lib/db/schema';

async function main() {
  const connectionString = process.env.DATABASE_URL || '';
  if (!connectionString) {
    console.error("DATABASE_URL not found in environment.");
    process.exit(1);
  }

  const client = postgres(connectionString, { prepare: false });
  const db = drizzle(client, { schema });

  console.log("Seeding channels into cloud database...");
  await db.insert(ingestionChannels)
    .values([
      {
        channelId: 'batch_api',
        name: 'Batch API Ingestion',
        type: 'batch',
        providerName: 'Batch API Adapter',
        enabled: true,
        config: {},
      },
      {
        channelId: 'github',
        name: 'Webhook: github',
        type: 'webhook',
        providerName: 'github',
        enabled: true,
        config: {},
      },
      {
        channelId: 'internal_test',
        name: 'Internal Testing',
        type: 'batch',
        providerName: 'SmokeTest Runner',
        enabled: true,
        config: {},
      }
    ])
    .onConflictDoNothing();

  console.log("Seeding log events into cloud database...");
  await db.insert(logEvents)
    .values([
      {
        externalEventId: 'evt_abc123',
        channelId: 'batch_api',
        sourceName: 'PaymentGateway',
        level: 'info',
        message: 'Invoice processed successfully for customer cus_abc',
        metadata: { currency: 'usd', amount_cents: 2500 },
        rawPayload: {
          level: 'info',
          source: 'PaymentGateway',
          message: 'Invoice processed successfully for customer cus_abc',
          event_id: 'evt_abc123',
          metadata: { currency: 'usd', amount_cents: 2500 },
          request_id: 'req_998877'
        },
        requestId: 'req_998877',
      },
      {
        externalEventId: 'evt_error456',
        channelId: 'batch_api',
        sourceName: 'AuthService',
        level: 'error',
        message: 'Invalid password attempt threshold exceeded',
        metadata: { user_id: 'usr_9988' },
        rawPayload: {
          level: 'error',
          source: 'AuthService',
          message: 'Invalid password attempt threshold exceeded',
          event_id: 'evt_error456',
          metadata: { user_id: 'usr_9988' },
          request_id: 'req_112233'
        },
        requestId: 'req_112233',
      },
      {
        externalEventId: 'evt_web101',
        channelId: 'github',
        sourceName: 'GithubWeb',
        occurredAt: new Date('2026-09-22T23:18:33.771Z'),
        level: 'warn',
        message: 'Unauthorized repository clone attempt',
        metadata: {},
        rawPayload: {
          level: 'warn',
          source: 'GithubWeb',
          message: 'Unauthorized repository clone attempt',
          event_id: 'evt_web101',
          occurred_at: '2026-09-22T23:18:33.771Z'
        },
      }
    ])
    .onConflictDoNothing();

  const countResult = await client`SELECT count(*) FROM log_events;`;
  console.log("Verified log_events count in Neon:", countResult[0].count);
  console.log("Cloud database seeded successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
