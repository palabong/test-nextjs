import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { geolocation } from "@vercel/functions"

// Edge middleware: geo-fencing + basic automation filtering.
// Runs on the Vercel edge network for the matched routes below.
export function middleware(request: NextRequest) {
  // 1. Geo-IP boundary enforcement.
  // `request.geo` was removed in Next.js 15+, so we read geolocation
  // from the Vercel runtime helper instead. Falls back to "US" locally.
  const { country = "US" } = geolocation(request)
  const allowedRegions = ["GB", "FR", "BE", "IT", "DE"]

  if (!allowedRegions.includes(country)) {
    return new NextResponse(JSON.stringify({ error: "WAF Block: Origin outside authorized European zone." }), {
      status: 403,
      headers: { "content-type": "application/json" },
    })
  }

  // 2. Basic header & automation filtering.
  const userAgent = request.headers.get("user-agent") || ""
  if (userAgent.includes("Headless") || userAgent.includes("python")) {
    return new NextResponse(JSON.stringify({ error: "WAF Block: Automated client detected." }), {
      status: 403,
      headers: { "content-type": "application/json" },
    })
  }

  const response = NextResponse.next()
  response.headers.set("x-edge-validation", "passed")
  return response
}

export const config = {
  matcher: ["/protected/:path*", "/api/secure/:path*"],
}
