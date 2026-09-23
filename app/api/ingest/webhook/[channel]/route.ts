import { NextResponse, NextRequest } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { logEvents, ingestionDeliveries, ingestionChannels } from '@/lib/db/schema';
import { normalizeGenericPayload } from '@/lib/ingestion/normalize';
import { eq } from 'drizzle-orm';

const MAX_PAYLOAD_SIZE = 1024 * 1024; // 1MB

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ channel: string }> }
) {
  // If the database is not configured, we fail gracefully
  if (!db) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  
  const { channel } = await params;

  // 1. Validate Payload Size
  const contentLength = Number(request.headers.get('content-length') || '0');
  if (contentLength > MAX_PAYLOAD_SIZE) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
  }

  // 2. Lookup secret strategy
  const secretEnvKey = `INGEST_WEBHOOK_SECRET_${channel.toUpperCase()}`;
  const secret = process.env[secretEnvKey];
  if (!secret) {
    return NextResponse.json({ error: 'Channel not configured' }, { status: 404 });
  }

  // 3. Authenticate with HMAC signature (assumes standard x-signature header or GitHub's X-Hub-Signature-256)
  let signature = request.headers.get('x-signature') || request.headers.get('x-hub-signature-256');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
  }

  // GitHub prefixes their signature with 'sha256='
  if (signature.startsWith('sha256=')) {
    signature = signature.replace('sha256=', '');
  }

  try {
    const rawBody = await request.text();
    
    // Constant-time signature comparison
    const hmac = crypto.createHmac('sha256', secret);
    const expectedSignature = hmac.update(rawBody).digest('hex');
    
    if (signature.length !== expectedSignature.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const normalized = normalizeGenericPayload(payload, channel);

    // 4. Validate or Auto-create channel (for simplicity in this generic implementation)
    // In strict production, this would only select. Here we upsert safely if enabled.
    await db.insert(ingestionChannels)
      .values({
        channelId: channel,
        name: `Webhook: ${channel}`,
        type: 'webhook',
        providerName: channel,
        enabled: true,
      })
      .onConflictDoNothing();

    const channelRecord = await db.query.ingestionChannels.findFirst({
      where: eq(ingestionChannels.channelId, channel)
    });

    if (!channelRecord || !channelRecord.enabled) {
      return NextResponse.json({ error: 'Channel disabled' }, { status: 403 });
    }

    const deliveryId = String(request.headers.get('x-delivery-id') || normalized.externalEventId);

    // 5. Transaction: Persist idempotency and event
    await db.transaction(async (tx) => {
      // Upsert delivery to track status (idempotency constraint)
      await tx.insert(ingestionDeliveries).values({
        deliveryId,
        channelId: channel,
        status: 'processed',
        processedAt: new Date(),
        payloadHash: expectedSignature,
      }).onConflictDoNothing();

      // Upsert log event (deduplicated by externalEventId + channelId)
      await tx.insert(logEvents).values({
        externalEventId: normalized.externalEventId,
        channelId: channel,
        sourceName: normalized.sourceName,
        occurredAt: normalized.occurredAt,
        level: normalized.level,
        message: normalized.message,
        metadata: normalized.metadata,
        rawPayload: normalized.rawPayload,
        requestId: normalized.requestId,
      }).onConflictDoNothing();
    });

    return NextResponse.json({ status: 'success', event_id: normalized.externalEventId });

  } catch (error) {
    console.error('Webhook ingestion error:', error);
    // Never expose internal errors or secrets in webhook responses
    return NextResponse.json({ error: 'Malformed payload or internal error' }, { status: 400 });
  }
}
