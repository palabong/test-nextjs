import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { geolocation } from "@vercel/functions"

// Edge middleware: Geo-fencing and automation filtering.
// Runs on the edge network for the matched routes below.
export function proxy(request: NextRequest) {
  // 1. Geo-IP boundary enforcement.
  const { country = "US" } = geolocation(request)
  const allowedRegions = ["GB", "FR", "BE", "IT", "DE", "US"]

  if (!allowedRegions.includes(country)) {
    return new NextResponse(JSON.stringify({ error: "Access Denied: Origin outside authorized zone." }), {
      status: 403,
      headers: { "content-type": "application/json" },
    })
  }

  // 2. Automation filtering.
  const userAgent = request.headers.get("user-agent") || ""
  if (userAgent.includes("python")) {
    return new NextResponse(JSON.stringify({ error: "Access Denied: Automated client detected." }), {
      status: 403,
      headers: { "content-type": "application/json" },
    })
  }

  const response = NextResponse.next()
  response.headers.set("x-edge-validation", "passed")
  return response
}

export const config = {
  // Exclude log ingestion APIs to ensure global delivery
  matcher: ["/protected/:path*", "/api/secure/:path*"],
}
