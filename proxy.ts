import { NextResponse } from "next/server"
import type { NextFetchEvent, NextRequest } from "next/server"
import { geolocation } from "@vercel/functions"
import { verifySignature } from "./lib/antibot"

// Layer 5: Rate Limiting Map (in-memory, ephemeral per edge isolate)
const rateLimitMap = new Map<string, { count: number, resetAt: number }>();
const MAX_REQUESTS = 20;
const WINDOW_MS = 60000;

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const pathname = request.nextUrl.pathname

  if (
    pathname.startsWith("/api/logs") ||
    pathname.startsWith("/api/ingest") ||
    pathname.startsWith("/api/fingerprint") ||
    pathname.startsWith("/challenge") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js)$/.test(pathname)
  ) {
    return NextResponse.next()
  }

  const geo = geolocation(request)
  const country = geo?.country || "US"
  const city = geo?.city || "Unknown"
  const region = geo?.region || "Unknown"
  const userAgent = request.headers.get("user-agent") || ""
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"

  const isProtectedPath = pathname.startsWith("/protected") || pathname.startsWith("/api/secure")
  const allowedRegions = ["GB", "FR", "BE", "IT", "DE", "US"]
  
  let isBlocked = false
  let blockReason: string | null = null
  let isChallengeNeeded = false;

  if (isProtectedPath) {
    // 1. Existing Geo-Fencing
    if (!allowedRegions.includes(country)) {
      isBlocked = true
      blockReason = "Origin outside authorized zone"
    } 
    
    // 2. Layer 2: Extended Server-Side UA Parsing
    const uaLower = userAgent.toLowerCase();
    if (uaLower.includes("python") || uaLower.includes("headlesschrome") || uaLower.includes("playwright") || uaLower.includes("puppeteer") || uaLower.includes("selenium") || uaLower.includes("phantomjs")) {
      isBlocked = true
      blockReason = "Automated client detected"
    }

    // 3. Layer 5: Rate Limiting
    const now = Date.now();
    let rateData = rateLimitMap.get(ip);
    if (!rateData || now > rateData.resetAt) {
      rateData = { count: 0, resetAt: now + WINDOW_MS };
    }
    rateData.count++;
    rateLimitMap.set(ip, rateData);

    if (rateData.count > MAX_REQUESTS) {
      isBlocked = true;
      blockReason = "Rate limit exceeded";
    }

    // 4. Layer 4: TLS / JA3 / HTTP2 checks (Best Effort)
    if (!request.headers.has("user-agent") || !request.headers.has("accept-language")) {
       if (!isBlocked && rateData.count > 5) {
          isBlocked = true;
          blockReason = "TLS/HTTP anomaly: Missing standard headers";
       }
    }

    // 5. Layer 1 & 3: Signed Cookie Check
    if (!isBlocked) {
      const clearanceCookie = request.cookies.get("bot_clearance")?.value;
      const secret = process.env.INGESTION_TOKEN || "super-secret-ingestion-token-for-dev";
      let isValidClearance = false;

      if (clearanceCookie) {
        const parts = clearanceCookie.split('|');
        if (parts.length === 3) {
          const [prefix, expiresStr, signature] = parts;
          if (prefix === "cleared") {
            const isValidSig = await verifySignature(`${prefix}|${expiresStr}`, signature, secret);
            if (isValidSig && Date.now() < parseInt(expiresStr, 10)) {
              isValidClearance = true;
            }
          }
        }
      }

      if (!isValidClearance) {
        isChallengeNeeded = true;
      }
    }
  }

  // Edge Telemetry Background Logging
  const logRecord = {
    channel: "bot_detector",
    source: isProtectedPath ? "EdgeProxySecure" : "EdgeProxyTraffic",
    level: isBlocked ? "warn" : isChallengeNeeded ? "info" : "info",
    message: `${request.method} ${pathname} from ${country} (${city}) - ${isBlocked ? `Blocked (${blockReason})` : isChallengeNeeded ? "Challenge Required" : "OK"}`,
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
      challengeTriggered: isChallengeNeeded
    },
    occurred_at: new Date().toISOString(),
  }

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

  // Enforcement execution
  if (isBlocked) {
    const status = blockReason === "Rate limit exceeded" ? 429 : 403;
    const headers: Record<string, string> = { "content-type": "application/json" };
    if (status === 429) headers["Retry-After"] = "60";

    return new NextResponse(JSON.stringify({ error: `Access Denied: ${blockReason}.` }), {
      status,
      headers,
    })
  }

  if (isChallengeNeeded) {
    if (pathname.startsWith("/api/")) {
       return new NextResponse(JSON.stringify({ error: "Challenge required" }), { status: 401 });
    }
    const challengeUrl = new URL(`/challenge?returnTo=${encodeURIComponent(pathname)}`, request.url);
    return NextResponse.rewrite(challengeUrl); 
  }

  const response = NextResponse.next()
  response.headers.set("x-edge-validation", "passed")
  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|api/logs|api/ingest|api/fingerprint|challenge|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}