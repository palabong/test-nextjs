import { NextResponse } from "next/server"
import type { NextFetchEvent, NextRequest } from "next/server"
import { geolocation } from "@vercel/functions"

// Edge middleware: Geo-fencing, automation filtering, and automatic access logging.
// Runs on the edge network for matched routes.
export function proxy(request: NextRequest, event: NextFetchEvent) {
  const pathname = request.nextUrl.pathname

  // 1. Guard against recursive logging, Next.js internals, and static assets
  if (
    pathname.startsWith("/api/logs") ||
    pathname.startsWith("/api/ingest") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js)$/.test(pathname)
  ) {
    return NextResponse.next()
  }

  // 2. Extract client context
  const geo = geolocation(request)
  const country = geo?.country || "US"
  const city = geo?.city || "Unknown"
  const region = geo?.region || "Unknown"
  const userAgent = request.headers.get("user-agent") || ""
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"

  // 3. Security policies for protected and secure routes
  const isProtectedPath = pathname.startsWith("/protected") || pathname.startsWith("/api/secure")
  const allowedRegions = ["GB", "FR", "BE", "IT", "DE", "US"]
  let isBlocked = false
  let blockReason: string | null = null

  if (isProtectedPath) {
    if (!allowedRegions.includes(country)) {
      isBlocked = true
      blockReason = "Origin outside authorized zone"
    } else if (userAgent.toLowerCase().includes("python")) {
      isBlocked = true
      blockReason = "Automated client detected"
    }
  }

  // 4. Construct telemetry log record
  const logRecord = {
    channel: "edge_proxy",
    source: isProtectedPath ? "EdgeProxySecure" : "EdgeProxyTraffic",
    level: isBlocked ? "warn" : "info",
    message: `${request.method} ${pathname} from ${country} (${city}) - ${isBlocked ? `Blocked (${blockReason})` : "OK"}`,
    event_id: `evt_edge_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    metadata: {
      method: request.method,
      path: pathname,
      country,
      city,
      region,
      ip,
      userAgent,
      protected: isProtectedPath,
      blocked: isBlocked,
      blockReason,
    },
    occurred_at: new Date().toISOString(),
  }

  // 5. Asynchronously persist log event to the database via ingestion API
  const token = process.env.INGESTION_TOKEN || "super-secret-ingestion-token-for-dev"
  const ingestUrl = new URL("/api/ingest/batch", request.url).toString()
  const logPromise = fetch(ingestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify([logRecord]),
    signal: AbortSignal.timeout(3000),
  }).catch((err) => {
    console.error("Edge logging background error:", err)
  })

  if (event && typeof event.waitUntil === "function") {
    event.waitUntil(logPromise)
  }

  // 6. Handle blocked requests
  if (isBlocked) {
    return new NextResponse(JSON.stringify({ error: `Access Denied: ${blockReason}.` }), {
      status: 403,
      headers: { "content-type": "application/json" },
    })
  }

  const response = NextResponse.next()
  response.headers.set("x-edge-validation", "passed")
  return response
}

export const config = {
  // Exclude static assets, Next.js internal chunks, and logging endpoints to prevent loops
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|api/logs|api/ingest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
