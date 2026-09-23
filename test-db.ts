import * as dotenv from 'dotenv';
dotenv.config();

import { db } from './lib/db';
import { logEvents, ingestionChannels } from './lib/db/schema';

async function main() {
  if (!db) {
    console.error("No database connection!");
    return;
  }

  // Ensure channel exists
  await db.insert(ingestionChannels)
    .values({
      channelId: 'internal_test',
      name: 'Internal Testing',
      type: 'batch',
      providerName: 'SmokeTest Runner',
      enabled: true,
    })
    .onConflictDoNothing();

  // Insert a dummy log event
  await db.insert(logEvents)
    .values({
      externalEventId: 'evt_smoke_test_001',
      channelId: 'internal_test',
      sourceName: 'System Diagnostic',
      level: 'info',
      message: 'Connection successful! Database is live and logs are being synced.',
      metadata: { env: 'production', status: 'verified' },
      occurredAt: new Date(),
    })
    .onConflictDoNothing();

  console.log("Smoke test data inserted successfully.");
  process.exit(0);
}

main().catch(console.error);
