import { NextResponse } from "next/server";
import { verifyChallengeToken, signData } from "@/lib/antibot";

export async function POST(req: Request) {
  try {
    const { challengeToken, answer, fingerprint, headlessSignals } = await req.json();
    const secret = process.env.INGESTION_TOKEN || "super-secret-ingestion-token-for-dev";

    // 1. Verify Challenge Token
    const isValidChallenge = await verifyChallengeToken(challengeToken, answer, secret);
    if (!isValidChallenge) {
      return NextResponse.json({ error: "Invalid or expired challenge" }, { status: 403 });
    }

    // 2. Analyze Fingerprint & Headless Signals
    let score = 0;
    if (fingerprint.webdriver) score += 50;
    if (headlessSignals.hasPuppeteer || headlessSignals.hasPlaywright || headlessSignals.hasSelenium) score += 100;
    if (!headlessSignals.hasChrome && fingerprint.userAgent?.includes("Chrome")) score += 20; 
    if (headlessSignals.outerAnomalies) score += 30;
    if (fingerprint.pluginsLen === 0) score += 10;

    if (score >= 50) {
      return NextResponse.json({ error: "Automation signals detected" }, { status: 403 });
    }

    // 3. Issue short-lived signed cookie (15 minutes)
    const expires = Date.now() + 15 * 60 * 1000;
    const clearanceData = `cleared|${expires}`;
    const signature = await signData(clearanceData, secret);
    const cookieValue = `${clearanceData}|${signature}`;

    const res = NextResponse.json({ success: true });
    res.cookies.set("bot_clearance", cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });

    return res;
  } catch (err) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}