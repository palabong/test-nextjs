# Bot Detection Layers

This document outlines the five missing bot-detection layers implemented to protect the `/protected/*` and `/api/secure/*` boundaries.

## 1. Client-Side Fingerprinting
- **Mechanism:** Injects a lightweight collector script (`ChallengeClient.tsx`) when a challenge is required.
- **Signals Collected:** `navigator.webdriver`, `plugins.length`, `languages`, `hardwareConcurrency`, `deviceMemory`, `screen.widthxheight`, timezone, Canvas 2D Hash, and WebGL Vendor/Renderer.
- **Enforcement:** Validated via `/api/fingerprint` which signs a short-lived `bot_clearance` cookie. `proxy.ts` rejects missing/invalid cookies.

## 2. WebDriver / Headless / CDP Signals
- **Mechanism:** Both client-side extraction and server-side verification.
- **Signals Collected:** `window.chrome` presence, `__puppeteer`, `__playwright`, Selenium `$cdc_` variables, and outer window anomalies. Server-side checks `User-Agent` tokens.
- **Enforcement:** Blocks if `score >= 50` or server UA matches known headless tokens.
- **Block Reason:** "Automation signals detected".

## 3. JS Challenge & Behavioural Checks
- **Mechanism:** An interstitial page (`/challenge`) rewrites incoming unauthorized requests.
- **Signals Collected:** Proof-of-work (Math logic) combined with a mandatory pointer/scroll interaction event. The token is HMAC-signed with a 60-second TTL.
- **Enforcement:** Solved challenge returns a signed cookie. Lack of interaction or expired token results in block.
- **Block Reason:** "Invalid or expired challenge".

## 4. TLS / JA3 / HTTP2 Fingerprint
- **Mechanism:** Edge proxy parses incoming HTTP headers (`User-Agent`, `Accept-Language`).
- **Signals Collected:** Anomalies such as missing standard browser headers. (Note: True JA3 parsing is platform-limited on Vercel Edge; we rely on `x-vercel-ja3` if present and header anomaly detection).
- **Enforcement:** Elevates risk score and blocks if missing standard headers coupled with suspicious traffic volume.
- **Block Reason:** "TLS/HTTP anomaly: Missing standard headers".

## 5. Rate / Velocity Controls
- **Mechanism:** In-memory LRU Map inside `proxy.ts` tracks request counts per IP.
- **Signals Collected:** IP hits within a 60-second sliding window.
- **Enforcement:** Blocks IPs exceeding 20 protected requests per minute.
- **Block Reason:** "Rate limit exceeded" (Returns 429 Retry-After).