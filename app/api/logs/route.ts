import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { logEvents } from '@/lib/db/schema';
import { desc, like, eq, and, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const limitParam = parseInt(searchParams.get('limit') || '50', 10);
  const limit = Math.min(Math.max(limitParam, 1), 100); // Bounded pagination

  const search = searchParams.get('search');
  const level = searchParams.get('level');

  try {
    const conditions = [];

    if (search && search.trim() !== '') {
      const sanitizedSearch = `%${search.trim().replace(/[%_\\]/g, '\\$&')}%`; // Safely escape wildcards
      conditions.push(
        sql`(${logEvents.message} ILIKE ${sanitizedSearch} OR ${logEvents.sourceName} ILIKE ${sanitizedSearch} OR ${logEvents.externalEventId} ILIKE ${sanitizedSearch})`
      );
    }

    if (level && level !== 'all') {
      conditions.push(eq(logEvents.level, level));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const logs = await db.query.logEvents.findMany({
      where: whereClause,
      orderBy: [desc(logEvents.receivedAt)],
      limit: limit,
      columns: {
        rawPayload: false, // Do not expose raw payload by default in list
      }
    });

    // Map to the public API model
    const publicLogs = logs.map((log) => ({
      id: log.externalEventId,
      timestamp: (log.occurredAt || log.receivedAt).toISOString(),
      level: log.level || 'info',
      source: log.sourceName,
      message: log.message || '',
      metadata: log.metadata,
      requestId: log.requestId,
    }));

    return NextResponse.json(publicLogs);
  } catch (error) {
    console.error('Failed to read logs:', error);
    return NextResponse.json({ error: 'Internal server error while fetching logs' }, { status: 500 });
  }
}
