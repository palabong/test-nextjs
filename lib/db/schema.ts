import {
  pgTable,
  serial,
  text,
  timestamp,
  jsonb,
  boolean,
  integer,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// -----------------------------------------------------------------------------
// Ingestion Channels
// -----------------------------------------------------------------------------
export const ingestionChannels = pgTable(
  'ingestion_channels',
  {
    id: serial('id').primaryKey(),
    channelId: text('channel_id').notNull().unique(), // Stable public identifier for the channel
    name: text('name').notNull(),
    type: text('type').notNull(), // 'webhook', 'batch', 'pull'
    providerName: text('provider_name').notNull(),
    enabled: boolean('enabled').default(true).notNull(),
    config: jsonb('config').default('{}').notNull(), // Non-secret configuration
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    channelIdIdx: uniqueIndex('idx_channels_channel_id').on(table.channelId),
    providerIdx: index('idx_channels_provider').on(table.providerName),
  })
);

// -----------------------------------------------------------------------------
// Log Events
// -----------------------------------------------------------------------------
export const logEvents = pgTable(
  'log_events',
  {
    id: serial('id').primaryKey(), // Internal database ID
    externalEventId: text('external_event_id').notNull(), // Stable external event ID or deduplication key
    channelId: text('channel_id').notNull().references(() => ingestionChannels.channelId),
    sourceName: text('source_name').notNull(), // Provider or source name
    
    // Timestamps
    receivedAt: timestamp('received_at').defaultNow().notNull(), // When the system received it
    occurredAt: timestamp('occurred_at'), // When the event actually happened at the source
    
    // Core Log Data
    level: text('level'), // info, warn, error, debug, etc.
    message: text('message'),
    
    // Structured Data
    metadata: jsonb('metadata').default('{}').notNull(),
    rawPayload: jsonb('raw_payload'), // Preserved original payload if needed safely
    
    requestId: text('request_id'), // Correlation ID
    
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    // Indexes required for efficient querying and deduplication
    externalEventDedupIdx: uniqueIndex('idx_logs_external_dedup').on(table.externalEventId, table.channelId),
    channelIdx: index('idx_logs_channel').on(table.channelId),
    receivedTimeIdx: index('idx_logs_received_time').on(table.receivedAt),
    sourceIdx: index('idx_logs_source').on(table.sourceName),
    levelIdx: index('idx_logs_level').on(table.level),
    requestCorrelationIdx: index('idx_logs_request_id').on(table.requestId),
  })
);

// -----------------------------------------------------------------------------
// Ingestion Deliveries (Idempotency Table)
// -----------------------------------------------------------------------------
export const ingestionDeliveries = pgTable(
  'ingestion_deliveries',
  {
    id: serial('id').primaryKey(),
    deliveryId: text('delivery_id').notNull(), // Webhook delivery ID or stable key
    channelId: text('channel_id').notNull().references(() => ingestionChannels.channelId),
    status: text('status').notNull(), // 'pending', 'processed', 'failed'
    
    receivedAt: timestamp('received_at').defaultNow().notNull(),
    processedAt: timestamp('processed_at'),
    
    errorMessage: text('error_message'),
    payloadHash: text('payload_hash'),
    retryCount: integer('retry_count').default(0).notNull(),
  },
  (table) => ({
    deliveryDedupIdx: uniqueIndex('idx_deliveries_dedup').on(table.deliveryId, table.channelId),
    statusIdx: index('idx_deliveries_status').on(table.status),
  })
);
