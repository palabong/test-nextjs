export interface NormalizedLogEvent {
  externalEventId: string;
  sourceName: string;
  occurredAt: Date | null;
  level: string | null;
  message: string | null;
  metadata: Record<string, any>;
  rawPayload: Record<string, any> | null;
  requestId: string | null;
}

export interface IngestionBatchResult {
  accepted: number;
  ignored: number;
  rejected: number;
  errors: string[];
}
