import { NormalizedLogEvent } from './types';

/**
 * Normalizes an arbitrary JSON payload into our standard internal LogEvent model.
 * Removes known secret fields to prevent accidental leakage.
 */
export function normalizeGenericPayload(payload: any, defaultSource: string): NormalizedLogEvent {
  if (!payload || typeof payload !== 'object') {
    return {
      externalEventId: generateBackupId(),
      sourceName: defaultSource,
      occurredAt: null,
      level: 'unknown',
      message: 'Invalid or empty payload received',
      metadata: {},
      rawPayload: null,
      requestId: null,
    };
  }

  // Redact secrets
  const sanitizedPayload = redactSecrets({ ...payload });

  // Extract common fields
  const externalEventId = String(payload.event_id || payload.id || generateBackupId());
  const sourceName = String(payload.source || payload.provider || defaultSource);
  const level = payload.level ? String(payload.level).toLowerCase() : null;
  const message = payload.message ? String(payload.message) : null;
  const requestId = payload.request_id ? String(payload.request_id) : null;
  
  let occurredAt: Date | null = null;
  if (payload.occurred_at || payload.timestamp) {
    const parsed = new Date(payload.occurred_at || payload.timestamp);
    if (!isNaN(parsed.getTime())) {
      occurredAt = parsed;
    }
  }

  let metadata = payload.metadata;
  if (!metadata || typeof metadata !== 'object') {
    // If metadata isn't explicitly provided, wrap the rest of the unknown fields (except redacted ones)
    metadata = { ...sanitizedPayload };
    delete metadata.event_id;
    delete metadata.id;
    delete metadata.source;
    delete metadata.provider;
    delete metadata.level;
    delete metadata.message;
    delete metadata.request_id;
    delete metadata.occurred_at;
    delete metadata.timestamp;
  }

  return {
    externalEventId,
    sourceName,
    occurredAt,
    level,
    message,
    metadata,
    rawPayload: sanitizedPayload,
    requestId,
  };
}

function generateBackupId() {
  return `fallback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

const SECRET_KEYS = new Set([
  'authorization',
  'token',
  'password',
  'secret',
  'key',
  'api_key',
  'access_token',
  'cookie',
]);

function redactSecrets(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(redactSecrets);

  const redacted: any = {};
  for (const [k, v] of Object.entries(obj)) {
    const lowerK = k.toLowerCase();
    if (SECRET_KEYS.has(lowerK) || lowerK.includes('secret') || lowerK.includes('token') || lowerK.includes('password')) {
      redacted[k] = '[REDACTED]';
    } else if (typeof v === 'object' && v !== null) {
      redacted[k] = redactSecrets(v);
    } else {
      redacted[k] = v;
    }
  }
  return redacted;
}
