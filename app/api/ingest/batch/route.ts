import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { logEvents, ingestionChannels } from '@/lib/db/schema';
import { normalizeGenericPayload } from '@/lib/ingestion/normalize';
import { IngestionBatchResult } from '@/lib/ingestion/types';

const MAX_BATCH_SIZE = 100;
const MAX_PAYLOAD_SIZE = 5 * 1024 * 1024; // 5MB limit for batches

export async function POST(request: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  // Authenticate using server-only token
  const authHeader = request.headers.get('authorization');
  const ingestionToken = process.env.INGESTION_TOKEN;

  if (!ingestionToken || authHeader !== `Bearer ${ingestionToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const contentLength = Number(request.headers.get('content-length') || '0');
  if (contentLength > MAX_PAYLOAD_SIZE) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
  }

  try {
    const payload = await request.json();

    if (!Array.isArray(payload)) {
      return NextResponse.json({ error: 'Payload must be an array of records' }, { status: 400 });
    }

    if (payload.length > MAX_BATCH_SIZE) {
      return NextResponse.json({ error: `Batch size exceeds limit of ${MAX_BATCH_SIZE}` }, { status: 400 });
    }

    const result: IngestionBatchResult = {
      accepted: 0,
      ignored: 0,
      rejected: 0,
      errors: [],
    };

    const insertValues = [];
    const defaultChannelId = 'batch_api';

    // Ensure default batch channel is registered
    await db.insert(ingestionChannels)
      .values({
        channelId: defaultChannelId,
        name: 'Batch API Ingestion',
        type: 'batch',
        providerName: 'Batch API Adapter',
        enabled: true,
      })
      .onConflictDoNothing();

    for (let i = 0; i < payload.length; i++) {
      try {
        const record = payload[i];
        const recordChannelId = (record.channel && typeof record.channel === 'string')
          ? record.channel
          : defaultChannelId;

        if (recordChannelId !== defaultChannelId) {
          await db.insert(ingestionChannels)
            .values({
              channelId: recordChannelId,
              name: `Channel: ${recordChannelId}`,
              type: 'stream',
              providerName: recordChannelId,
              enabled: true,
            })
            .onConflictDoNothing();
        }

        const normalized = normalizeGenericPayload(record, recordChannelId === 'edge_proxy' ? 'EdgeProxy' : 'Batch API');
        
        insertValues.push({
          externalEventId: normalized.externalEventId,
          channelId: recordChannelId,
          sourceName: normalized.sourceName,
          occurredAt: normalized.occurredAt || new Date(),
          level: normalized.level,
          message: normalized.message,
          metadata: normalized.metadata,
          rawPayload: normalized.rawPayload,
          requestId: normalized.requestId,
        });
        result.accepted++;
      } catch (err) {
        result.rejected++;
        result.errors.push(`Record ${i} invalid`);
      }
    }

    if (insertValues.length > 0) {
      // Perform an idempotent batch insert
      await db.insert(logEvents)
        .values(insertValues)
        .onConflictDoNothing();
      // Note: onConflictDoNothing means duplicates are just ignored at DB level.
      // Accurate 'ignored' counting requires checking row counts, which can vary by driver,
      // but is generally safe for idempotent loads.
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Batch ingestion error:', error);
    return NextResponse.json({ error: 'Internal processing error' }, { status: 500 });
  }
}
