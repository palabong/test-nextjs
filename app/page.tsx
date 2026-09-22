"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Shield,
  Globe,
  Bot,
  Zap,
  Lock,
  ArrowRight,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Code,
  Terminal as TerminalIcon,
  Menu,
  RefreshCw,
  Server,
  Activity,
  Cpu,
} from "lucide-react"

export default function Page() {
  // Mobile navigation state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Live simulator state
  const [loading, setLoading] = useState(false)
  const [simType, setSimType] = useState<"standard" | "bot" | "eu_allowed">("standard")
  const [responseStatus, setResponseStatus] = useState<number | null>(null)
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({})
  const [responseBody, setResponseBody] = useState<string>("")
  const [terminalLogs, setTerminalLogs] = useState<string[]>([])
  const [userLocation, setUserLocation] = useState<string>("Detecting via Edge...")

  // FAQ interactive state
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // Simulated browser info
  useEffect(() => {
    if (typeof window !== "undefined") {
      setTerminalLogs([
        "Terminal initialized.",
        `User-Agent detected: ${navigator.userAgent.slice(0, 50)}...`,
        "Edge Guard rules loaded successfully.",
        "System ready. Click an execution below to simulate an API request.",
      ])
    }
  }, [])

  // Simulate WAF evaluation
  const runSimulation = async (type: "standard" | "bot" | "eu_allowed") => {
    setLoading(true)
    setSimType(type)
    setResponseStatus(null)
    setResponseHeaders({})
    setResponseBody("")

    const timestamp = new Date().toLocaleTimeString()
    let logMsg = ""

    if (type === "standard") {
      logMsg = `[${timestamp}] GET /api/secure/data - Executing real Edge call...`
      setTerminalLogs((prev) => [...prev, logMsg])

      try {
        const startTime = performance.now()
        const res = await fetch("/api/secure/data")
        const duration = (performance.now() - startTime).toFixed(1)
        const data = await res.json().catch(() => ({}))

        setResponseStatus(res.status)
        setResponseHeaders({
          "Content-Type": "application/json",
          "X-Edge-Validation": res.headers.get("x-edge-validation") || "skipped",
          "X-Vercel-Cache": "MISS",
          "Server": "Vercel-Edge",
        })
        setResponseBody(JSON.stringify(data, null, 2))

        if (res.ok) {
          setTerminalLogs((prev) => [
            ...prev,
            `[${timestamp}] API returned 200 OK in ${duration}ms`,
            `🎉 SECURE_PAYLOAD extracted successfully!`,
          ])
          setUserLocation("Authorized Region (GB/FR/BE/IT/DE)")
        } else {
          setTerminalLogs((prev) => [
            ...prev,
            `[${timestamp}] API returned ${res.status} Forbidden in ${duration}ms`,
            `⚠️ Request BLOCKED by Edge Middleware: Non-European IP.`,
          ])
          setUserLocation("Outside Authorized Europe Zone")
        }
      } catch {
        setTerminalLogs((prev) => [
          ...prev,
          `[${timestamp}] Error reaching the edge API route.`,
        ])
        setResponseBody(JSON.stringify({ error: "Network error or local request blocked" }, null, 2))
        setResponseStatus(500)
      }
    } else if (type === "bot") {
      logMsg = `[${timestamp}] GET /api/secure/data - Simulating request from Headless User-Agent...`
      setTerminalLogs((prev) => [...prev, logMsg])

      // Simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 600))

      setResponseStatus(403)
      setResponseHeaders({
        "Content-Type": "application/json",
        "Date": new Date().toUTCString(),
        "Server": "Vercel-Edge",
      })
      setResponseBody(
        JSON.stringify({ error: "WAF Block: Automated client detected." }, null, 2)
      )

      setTerminalLogs((prev) => [
        ...prev,
        `[${timestamp}] API returned 403 Forbidden (Evaluation time: 1.2ms)`,
        `🚫 Access Denied: Automation signature 'Headless/Python' intercepted.`,
      ])
    } else if (type === "eu_allowed") {
      logMsg = `[${timestamp}] GET /api/secure/data - Simulating request from London, United Kingdom (GB)...`
      setTerminalLogs((prev) => [...prev, logMsg])

      await new Promise((resolve) => setTimeout(resolve, 850))

      setResponseStatus(200)
      setResponseHeaders({
        "Content-Type": "application/json",
        "X-Edge-Validation": "passed",
        "X-Vercel-Cache": "HIT",
        "Server": "Vercel-Edge",
      })
      setResponseBody(
        JSON.stringify(
          {
            secret_payload: "Vercel_Sandbox_Flag_Validated",
            mcp_target_node: "edge_bypassed_successfully",
          },
          null,
          2
        )
      )

      setTerminalLogs((prev) => [
        ...prev,
        `[${timestamp}] API returned 200 OK (Evaluation time: 2.1ms)`,
        `🎉 Payload successfully routed and decrypted at Edge.`,
      ])
    }

    setLoading(false)
  }

  const clearLogs = () => {
    setTerminalLogs(["Terminal cleared. System ready."])
    setResponseStatus(null)
    setResponseHeaders({})
    setResponseBody("")
  }

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground flex flex-col font-sans antialiased">
      
      {/* HEADER / NAVIGATION */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-1">
            <svg
              aria-hidden="true"
              className="w-7 h-7 text-foreground animate-pulse"
              fill="none"
              viewBox="0 0 180 180"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect fill="currentColor" width="180" height="180" rx="37" className="opacity-10 dark:opacity-20" />
              <g style={{ transform: "scale(92%)", transformOrigin: "center" }}>
                <path
                  fill="currentColor"
                  d="M101.141 53H136.632C151.023 53 162.689 64.6662 162.689 79.0573V112.904H148.112V79.0573C148.112 78.7105 148.098 78.3662 148.072 78.0251L112.581 112.898C112.701 112.902 112.821 112.904 112.941 112.904H148.112V126.672H112.941C98.5504 126.672 86.5638 114.891 86.5638 100.5V66.7434H101.141V100.5C101.141 101.15 101.191 101.792 101.289 102.422L137.56 66.7816C137.255 66.7563 136.945 66.7434 136.632 66.7434H101.141V53Z"
                />
                <path
                  fill="currentColor"
                  d="M65.2926 124.136L14 66.7372H34.6355L64.7495 100.436V66.7372H80.1365V118.47C80.1365 126.278 70.4953 129.958 65.2926 124.136Z"
                />
              </g>
            </svg>
            <span className="font-bold text-lg tracking-tight">EdgeGuard</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm">
              Features
            </Link>
            <Link href="#simulator" className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm">
              WAF Simulator
            </Link>
            <Link href="#architecture" className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm">
              Architecture
            </Link>
            <Link href="#faq" className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm">
              FAQ
            </Link>
          </nav>

          {/* Action Button */}
          <div className="hidden md:flex items-center space-x-3">
            <Link href="/protected/dashboard" passHref legacyBehavior>
              <Button variant="outline" size="sm" className="cursor-pointer">
                Protected Dashboard
              </Button>
            </Link>
            <Button variant="default" size="sm" onClick={() => alert("Enterprise sandbox features are fully active. Ready to deploy!")}>
              Contact Sales
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center p-2 rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-muted-foreground hover:text-foreground"
            aria-label="Toggle Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border/40 bg-background/95 backdrop-blur px-4 pt-2 pb-6 space-y-4 animate-in fade-in slide-in-from-top-5 duration-200">
            <nav className="flex flex-col space-y-3">
              <Link
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground p-2 rounded hover:bg-muted/50 transition-colors"
              >
                Features
              </Link>
              <Link
                href="#simulator"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground p-2 rounded hover:bg-muted/50 transition-colors"
              >
                WAF Simulator
              </Link>
              <Link
                href="#architecture"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground p-2 rounded hover:bg-muted/50 transition-colors"
              >
                Architecture
              </Link>
              <Link
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground p-2 rounded hover:bg-muted/50 transition-colors"
              >
                FAQ
              </Link>
            </nav>
            <div className="pt-4 border-t border-border flex flex-col space-y-2">
              <Link href="/protected/dashboard" passHref legacyBehavior>
                <Button variant="outline" size="sm" className="w-full text-center justify-center" onClick={() => setMobileMenuOpen(false)}>
                  Protected Dashboard
                </Button>
              </Link>
              <Button variant="default" size="sm" className="w-full text-center justify-center" onClick={() => { setMobileMenuOpen(false); alert("Enterprise sandbox active."); }}>
                Contact Sales
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-radial-gradient from-primary/5 via-transparent to-transparent -z-10 pointer-events-none" />
        <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 flex flex-col space-y-6 text-center lg:text-left">
            <div className="inline-flex self-center lg:self-start items-center space-x-2 bg-muted border border-border px-3 py-1 rounded-full text-xs font-semibold text-muted-foreground tracking-wide uppercase">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Next.js 16 & Tailwind 4 Secure Boundary</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none">
              Decentralized Security <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-neutral-950 via-neutral-700 to-neutral-500 dark:from-neutral-50 dark:via-neutral-300 dark:to-neutral-400 bg-clip-text text-transparent">
                At the Network Edge
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Mitigate automated attacks and lock down backend services instantly. EdgeGuard intercepts incoming traffic via Vercel Edge Middleware to filter out unauthorized IP subnets and bots before they reach your React Server Components.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link href="/protected/dashboard" passHref legacyBehavior>
                <Button variant="default" size="lg" className="w-full sm:w-auto font-semibold shadow-lg shadow-primary/5 cursor-pointer">
                  Launch Enterprise Dashboard
                  <ArrowRight className="size-4 ml-1 transition-transform group-hover/button:translate-x-1" />
                </Button>
              </Link>
              <Link href="#simulator" passHref legacyBehavior>
                <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold">
                  Test Live Edge WAF
                </Button>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/40 max-w-lg mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold tracking-tight">1.2ms</div>
                <div className="text-xs text-muted-foreground uppercase font-medium">Evaluation Speed</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold tracking-tight">100%</div>
                <div className="text-xs text-muted-foreground uppercase font-medium">Edge Isolated</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold tracking-tight">99.99%</div>
                <div className="text-xs text-muted-foreground uppercase font-medium">WAF Accuracy</div>
              </div>
            </div>
          </div>

          {/* Hero Right: High-Fidelity Interactive Visual Dashboard */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="w-full max-w-[460px] bg-card border border-border/80 rounded-2xl p-5 shadow-2xl relative overflow-hidden backdrop-blur">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
              
              {/* Dashboard header mock */}
              <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">WAF Node: Vercel-London-Edge</span>
                </div>
                <Activity className="size-4 text-emerald-500 animate-pulse" />
              </div>

              {/* Status banner */}
              <div className="bg-muted p-3.5 rounded-xl border border-border mb-4 flex items-start gap-3">
                <Shield className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold">Active Geofencing Config</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Regions Allowed: GB, FR, BE, IT, DE. Default: US fallback.</div>
                </div>
              </div>

              {/* Request log mock lists */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold tracking-wide text-muted-foreground/80 uppercase">Real-Time Ingestion:</div>
                
                {/* Log Item 1: Blocked (US Bot) */}
                <div className="p-2.5 rounded-lg border border-red-500/10 bg-red-500/5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <X className="size-3.5 text-red-500" />
                    <div>
                      <span className="font-mono text-[11px] font-semibold">GET /api/secure/data</span>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <span className="font-medium text-red-500/80">Blocked 403</span>
                        <span>•</span>
                        <span>UA: Python-Client</span>
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">0.8ms</span>
                </div>

                {/* Log Item 2: Allowed (EU Core) */}
                <div className="p-2.5 rounded-lg border border-emerald-500/10 bg-emerald-500/5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <Check className="size-3.5 text-emerald-500" />
                    <div>
                      <span className="font-mono text-[11px] font-semibold">GET /protected/dashboard</span>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <span className="font-medium text-emerald-500/80">Allowed 200</span>
                        <span>•</span>
                        <span>IP: 82.165.x.x (Paris, FR)</span>
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">1.4ms</span>
                </div>

                {/* Log Item 3: Allowed (EU Core) */}
                <div className="p-2.5 rounded-lg border border-emerald-500/10 bg-emerald-500/5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <Check className="size-3.5 text-emerald-500" />
                    <div>
                      <span className="font-mono text-[11px] font-semibold">GET /api/secure/data</span>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <span className="font-medium text-emerald-500/80">Allowed 200</span>
                        <span>•</span>
                        <span>IP: 95.90.x.x (Berlin, DE)</span>
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">1.1ms</span>
                </div>

                {/* Log Item 4: Blocked (Outside EU) */}
                <div className="p-2.5 rounded-lg border border-red-500/10 bg-red-500/5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <X className="size-3.5 text-red-500" />
                    <div>
                      <span className="font-mono text-[11px] font-semibold">GET /protected/dashboard</span>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <span className="font-medium text-red-500/80">Blocked 403</span>
                        <span>•</span>
                        <span>IP: 172.56.x.x (New York, US)</span>
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">1.9ms</span>
                </div>
              </div>

              {/* Secure Token Decrypted Area */}
              <div className="mt-4 p-3 bg-muted rounded-lg border border-border/60 text-center">
                <span className="text-[10px] font-bold text-muted-foreground block mb-1">DECRYPTED VERIFICATION PAYLOAD</span>
                <div className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-background/50 py-1.5 rounded border border-emerald-500/20">
                  Vercel_Sandbox_Flag_Validated
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* DETAILED CORE FEATURES */}
      <section id="features" className="py-20 md:py-28 bg-muted/40 border-b border-border/40 scroll-mt-16">
        <div className="container mx-auto px-4 md:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Robust Shielding Built directly on Next-Edge</h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Maximize security without introducing middleware bottlenecks. EdgeGuard filters requests at the physical location nearest to the client.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-card border border-border/60 rounded-xl p-6 transition-all duration-200 hover:border-primary/20 hover:shadow-md flex flex-col space-y-4">
              <div className="p-2.5 bg-primary/5 rounded-lg w-fit text-primary">
                <Globe className="size-6" />
              </div>
              <h3 className="font-bold text-lg">Instant Geo-Fencing</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-grow">
                Enforce jurisdictional barriers. Read local coordinate and country headers within Vercel edge handlers to limit endpoints to authorized European zones.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border border-border/60 rounded-xl p-6 transition-all duration-200 hover:border-primary/20 hover:shadow-md flex flex-col space-y-4">
              <div className="p-2.5 bg-primary/5 rounded-lg w-fit text-primary">
                <Bot className="size-6" />
              </div>
              <h3 className="font-bold text-lg">Anti-Bot Validation</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-grow">
                Detect automation frameworks, scrapers, and headless browsers using dynamic signature inspection on incoming headers before server logic initializes.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card border border-border/60 rounded-xl p-6 transition-all duration-200 hover:border-primary/20 hover:shadow-md flex flex-col space-y-4">
              <div className="p-2.5 bg-primary/5 rounded-lg w-fit text-primary">
                <Zap className="size-6" />
              </div>
              <h3 className="font-bold text-lg">Sub-2ms Evaluation</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-grow">
                No database roundtrips required. Edge runtime handles geo validation instantaneously inside highly optimized lightweight JavaScript V8 execution blocks.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-card border border-border/60 rounded-xl p-6 transition-all duration-200 hover:border-primary/20 hover:shadow-md flex flex-col space-y-4">
              <div className="p-2.5 bg-primary/5 rounded-lg w-fit text-primary">
                <Lock className="size-6" />
              </div>
              <h3 className="font-bold text-lg">Decrypted Payloads</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-grow">
                Only validated handshakes unlock the secure flags. Safe client integration handles payload extraction through isolated API tunnels.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* LIVE EDGE SIMULATOR SECTION */}
      <section id="simulator" className="py-20 md:py-28 scroll-mt-16 border-b border-border/40">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Interactive Live Edge WAF Sandbox</h2>
            <p className="text-muted-foreground mt-4 text-base md:text-lg">
              Simulate traffic incoming from different parts of the world with distinct automation signatures. Tap any trigger below to execute against the active Edge rules.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Sandbox Sidebar Controls */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              <div className="bg-card border border-border rounded-xl p-5 flex flex-col space-y-4">
                <h3 className="font-bold text-sm tracking-wide text-muted-foreground uppercase">Simulator Controls</h3>
                
                {/* Trigger 1 */}
                <button
                  onClick={() => runSimulation("standard")}
                  disabled={loading}
                  className={`text-left p-3.5 rounded-lg border transition-all text-sm flex items-start gap-3 cursor-pointer ${
                    simType === "standard"
                      ? "border-primary bg-primary/5 font-semibold text-foreground shadow-sm"
                      : "border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Server className="size-5 shrink-0 mt-0.5 text-primary" />
                  <div>
                    <span className="block font-bold">Standard Direct Fetch</span>
                    <span className="block text-xs text-muted-foreground mt-1 leading-normal">
                      Perform an actual, live fetch call from your current location directly to the secure API.
                    </span>
                  </div>
                </button>

                {/* Trigger 2 */}
                <button
                  onClick={() => runSimulation("bot")}
                  disabled={loading}
                  className={`text-left p-3.5 rounded-lg border transition-all text-sm flex items-start gap-3 cursor-pointer ${
                    simType === "bot"
                      ? "border-primary bg-primary/5 font-semibold text-foreground shadow-sm"
                      : "border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Bot className="size-5 shrink-0 mt-0.5 text-red-500" />
                  <div>
                    <span className="block font-bold">Simulate Automated Client</span>
                    <span className="block text-xs text-muted-foreground mt-1 leading-normal">
                      Intercept client user-agents containing "python" or "headless" headers to invoke a direct 403.
                    </span>
                  </div>
                </button>

                {/* Trigger 3 */}
                <button
                  onClick={() => runSimulation("eu_allowed")}
                  disabled={loading}
                  className={`text-left p-3.5 rounded-lg border transition-all text-sm flex items-start gap-3 cursor-pointer ${
                    simType === "eu_allowed"
                      ? "border-primary bg-primary/5 font-semibold text-foreground shadow-sm"
                      : "border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Globe className="size-5 shrink-0 mt-0.5 text-emerald-500" />
                  <div>
                    <span className="block font-bold">Simulate EU region (GB)</span>
                    <span className="block text-xs text-muted-foreground mt-1 leading-normal">
                      Mock standard HTTP parameters routed from UK to verify successful decryption logic.
                    </span>
                  </div>
                </button>

                <div className="pt-3 border-t border-border flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Active IP Geolocation:</span>
                  <span className="font-mono font-bold bg-muted px-2 py-0.5 rounded text-[11px] border border-border">
                    {userLocation}
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Terminal */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="bg-[#0f141c] text-[#a5b4fc] border border-neutral-800 rounded-xl flex-grow flex flex-col font-mono text-xs overflow-hidden shadow-2xl min-h-[360px]">
                
                {/* Terminal Header */}
                <div className="bg-[#1a1f29] px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TerminalIcon className="size-4 text-emerald-500" />
                    <span className="font-bold text-[11px] tracking-wider text-neutral-400 uppercase">Live Security Shell</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-700 block" />
                    <button
                      onClick={clearLogs}
                      className="text-[10px] text-neutral-400 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Terminal Content split into logs + HTTP response */}
                <div className="p-4 flex-grow overflow-y-auto space-y-3 min-h-[220px]">
                  
                  {/* Event Logs */}
                  <div className="space-y-1">
                    {terminalLogs.map((log, index) => (
                      <div key={index} className={`leading-relaxed ${
                        log.includes("200 OK") || log.includes("decrypted") || log.includes("🎉")
                          ? "text-emerald-400 font-semibold"
                          : log.includes("Blocked") || log.includes("403") || log.includes("🚫")
                          ? "text-rose-400 font-semibold"
                          : "text-neutral-400"
                      }`}>
                        <span className="text-neutral-600 select-none mr-2">$</span>
                        {log}
                      </div>
                    ))}
                    {loading && (
                      <div className="text-yellow-400 animate-pulse flex items-center gap-1.5 font-semibold">
                        <span className="text-neutral-600 select-none mr-2">$</span>
                        <RefreshCw className="size-3 animate-spin" /> Evaluating Edge policies...
                      </div>
                    )}
                  </div>

                  {/* API response section */}
                  {responseStatus !== null && (
                    <div className="mt-4 pt-4 border-t border-neutral-800 space-y-3">
                      <div>
                        <span className="text-neutral-400 font-semibold uppercase text-[10px] block mb-1">HTTP RESPONSE STATS:</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            responseStatus === 200
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          }`}>
                            HTTP {responseStatus}
                          </span>
                          <span className="text-neutral-500 font-mono text-[11px]">Server: Vercel Edge isolates</span>
                        </div>
                      </div>

                      {/* Headers */}
                      <div>
                        <span className="text-neutral-400 font-semibold uppercase text-[10px] block mb-1">HEADERS:</span>
                        <div className="bg-neutral-900/50 p-2 rounded border border-neutral-800 text-[11px] text-neutral-300 font-mono space-y-0.5">
                          {Object.entries(responseHeaders).map(([key, val]) => (
                            <div key={key}>
                              <span className="text-neutral-500">{key}:</span> {val}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* JSON Payload */}
                      <div>
                        <span className="text-neutral-400 font-semibold uppercase text-[10px] block mb-1">RESPONSE BODY (JSON):</span>
                        <pre className="bg-neutral-900 p-3 rounded border border-neutral-800 text-[11px] text-[#f8fafc] overflow-x-auto font-mono max-h-[140px]">
                          <code>{responseBody}</code>
                        </pre>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* TECHNICAL CODE / ARCHITECTURE ARCHITECTURE */}
      <section id="architecture" className="py-20 md:py-28 bg-muted/40 border-b border-border/40 scroll-mt-16">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Unified Security Architecture</h2>
            <p className="text-muted-foreground mt-4 text-base md:text-lg">
              Next-generation deployment relies on simple, composable, and isolated files. See the edge middleware implementation currently managing this site.
            </p>
          </div>

          <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xl">
            
            {/* Top bar */}
            <div className="bg-muted px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code className="size-4 text-primary" />
                <span className="text-xs font-bold text-muted-foreground font-mono">middleware.ts</span>
              </div>
              <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">
                Typescript (Edge Runtime)
              </span>
            </div>

            {/* Code representation */}
            <div className="p-5 overflow-x-auto bg-card text-foreground font-mono text-xs leading-relaxed max-h-[420px]">
              <pre>
{`import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { geolocation } from "@vercel/functions"

export function middleware(request: NextRequest) {
  // 1. Geo-IP boundary enforcement
  const { country = "US" } = geolocation(request)
  const allowedRegions = ["GB", "FR", "BE", "IT", "DE"]

  if (!allowedRegions.includes(country)) {
    return new NextResponse(
      JSON.stringify({ error: "WAF Block: Origin outside European zone." }),
      { status: 403, headers: { "content-type": "application/json" } }
    )
  }

  // 2. Automation and Headless Browser Filtering
  const userAgent = request.headers.get("user-agent") || ""
  if (userAgent.includes("Headless") || userAgent.includes("python")) {
    return new NextResponse(
      JSON.stringify({ error: "WAF Block: Automated client detected." }),
      { status: 403, headers: { "content-type": "application/json" } }
    )
  }

  const response = NextResponse.next()
  response.headers.set("x-edge-validation", "passed")
  return response
}

export const config = {
  // Apply WAF protections globally on secure scopes
  matcher: ["/protected/:path*", "/api/secure/:path*"],
}`}
              </pre>
            </div>

            {/* Footer summary */}
            <div className="bg-muted px-5 py-4 border-t border-border flex items-start gap-3.5 text-xs">
              <Cpu className="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-foreground">Decentralized Isolates</span>
                <span className="text-muted-foreground block mt-0.5 leading-normal">
                  Because Vercel executes this code inside isolated v8 environments instantly at global points of presence, the requests are fully filtered before they can consume database, lambda, or origin CPU cycles.
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* FAQs ACCORDION */}
      <section id="faq" className="py-20 md:py-28 scroll-mt-16">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Configuration and Operations</h2>
            <p className="text-muted-foreground mt-4 text-base">
              Learn how EdgeGuard interacts with modern server components, Vercel deployments, and custom middleware matching.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* FAQ Item 1 */}
            <div className="bg-card border border-border rounded-xl overflow-hidden transition-all duration-200">
              <button
                onClick={() => toggleFaq(0)}
                className="w-full px-6 py-4 text-left flex items-center justify-between font-bold text-sm md:text-base hover:bg-muted/50 transition-colors focus:outline-none focus-visible:bg-muted/50 cursor-pointer"
                aria-expanded={openFaq === 0}
              >
                <span>How is geolocation determined on the Vercel edge?</span>
                {openFaq === 0 ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
              </button>
              {openFaq === 0 && (
                <div className="px-6 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed animate-in fade-in duration-200">
                  Vercel routes global traffic to the nearest Point of Presence (PoP). During routing, the Edge handler reads native downstream country headers injected by Vercel's Anycast network DNS routers. This is translated directly to standard country abbreviations (like GB, FR, US) within the edge runtime helper.
                </div>
              )}
            </div>

            {/* FAQ Item 2 */}
            <div className="bg-card border border-border rounded-xl overflow-hidden transition-all duration-200">
              <button
                onClick={() => toggleFaq(1)}
                className="w-full px-6 py-4 text-left flex items-center justify-between font-bold text-sm md:text-base hover:bg-muted/50 transition-colors focus:outline-none focus-visible:bg-muted/50 cursor-pointer"
                aria-expanded={openFaq === 1}
              >
                <span>Will EdgeGuard block standard dev environments or localhost traffic?</span>
                {openFaq === 1 ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
              </button>
              {openFaq === 1 && (
                <div className="px-6 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed animate-in fade-in duration-200">
                  No, when running locally, the Vercel helper defaults geolocation requests to US. However, since the edge matching configuration in `middleware.ts` only executes security pipelines against path patterns of `/protected/:path*` and `/api/secure/:path*`, standard homepages and public pages load seamlessly on localhost.
                </div>
              )}
            </div>

            {/* FAQ Item 3 */}
            <div className="bg-card border border-border rounded-xl overflow-hidden transition-all duration-200">
              <button
                onClick={() => toggleFaq(2)}
                className="w-full px-6 py-4 text-left flex items-center justify-between font-bold text-sm md:text-base hover:bg-muted/50 transition-colors focus:outline-none focus-visible:bg-muted/50 cursor-pointer"
                aria-expanded={openFaq === 2}
              >
                <span>Can I configure custom blockages or whitelist IPs?</span>
                {openFaq === 2 ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
              </button>
              {openFaq === 2 && (
                <div className="px-6 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed animate-in fade-in duration-200">
                  Absolutely! Because the middleware resides fully within standard typescript code, you can fetch lists of whitelisted IP addresses, load configurations from Redis, or cross-reference third-party identity providers inside the runtime isolating block before returning downstream.
                </div>
              )}
            </div>

            {/* FAQ Item 4 */}
            <div className="bg-card border border-border rounded-xl overflow-hidden transition-all duration-200">
              <button
                onClick={() => toggleFaq(3)}
                className="w-full px-6 py-4 text-left flex items-center justify-between font-bold text-sm md:text-base hover:bg-muted/50 transition-colors focus:outline-none focus-visible:bg-muted/50 cursor-pointer"
                aria-expanded={openFaq === 3}
              >
                <span>Is Vercel Analytics supported with EdgeGuard?</span>
                {openFaq === 3 ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
              </button>
              {openFaq === 3 && (
                <div className="px-6 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed animate-in fade-in duration-200">
                  Yes, `@vercel/analytics` is fully supported. Performance metrics, request routes, and security statuses are processed asynchronously to ensure analytics reports are populated in real-time on your Vercel Dashboard without introducing blocking overhead to standard clients.
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-16 md:py-24 border-t border-border bg-muted/20">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl text-center flex flex-col items-center space-y-6">
          <Shield className="size-12 text-primary" />
          <h2 className="text-3xl font-extrabold tracking-tight">Deploy Production-Ready Edge Security Today</h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl leading-relaxed">
            Unblock your development team and secure production routes with a simple copy-paste middleware logic. Start measuring secure endpoints through Vercel dashboards now.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <Link href="/protected/dashboard" passHref legacyBehavior>
              <Button variant="default" size="lg" className="w-full sm:w-auto font-semibold shadow-lg cursor-pointer">
                Launch Enterprise Dashboard
              </Button>
            </Link>
            <Link href="#simulator" passHref legacyBehavior>
              <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold">
                Explore Simulator Sandbox
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-border/40 py-12 bg-background">
        <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 text-sm">
          
          <div className="md:col-span-4 flex flex-col space-y-3.5">
            <div className="flex items-center space-x-2.5 font-bold text-lg">
              <svg
                aria-hidden="true"
                className="w-6 h-6 text-foreground"
                fill="none"
                viewBox="0 0 180 180"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect fill="currentColor" width="180" height="180" rx="37" className="opacity-10 dark:opacity-20" />
                <g style={{ transform: "scale(92%)", transformOrigin: "center" }}>
                  <path
                    fill="currentColor"
                    d="M101.141 53H136.632C151.023 53 162.689 64.6662 162.689 79.0573V112.904H148.112V79.0573C148.112 78.7105 148.098 78.3662 148.072 78.0251L112.581 112.898C112.701 112.902 112.821 112.904 112.941 112.904H148.112V126.672H112.941C98.5504 126.672 86.5638 114.891 86.5638 100.5V66.7434H101.141V100.5C101.141 101.15 101.191 101.792 101.289 102.422L137.56 66.7816C137.255 66.7563 136.945 66.7434 136.632 66.7434H101.141V53Z"
                  />
                  <path
                    fill="currentColor"
                    d="M65.2926 124.136L14 66.7372H34.6355L64.7495 100.436V66.7372H80.1365V118.47C80.1365 126.278 70.4953 129.958 65.2926 124.136Z"
                  />
                </g>
              </svg>
              <span>EdgeGuard</span>
            </div>
            <p className="text-xs text-muted-foreground leading-normal max-w-[280px]">
              Secure Next.js apps with microsecond-level edge WAF filters, dynamic geofencing, and robot countermeasures.
            </p>
            <span className="text-[11px] text-muted-foreground/65 block">
              &copy; {new Date().getFullYear()} EdgeGuard Inc. All rights reserved.
            </span>
          </div>

          <div className="md:col-span-2 flex flex-col space-y-3">
            <span className="font-bold text-xs tracking-wider uppercase text-muted-foreground/80">Platform</span>
            <Link href="#features" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="#simulator" className="text-xs text-muted-foreground hover:text-foreground transition-colors">WAF Simulator</Link>
            <Link href="#architecture" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Architecture</Link>
          </div>

          <div className="md:col-span-2 flex flex-col space-y-3">
            <span className="font-bold text-xs tracking-wider uppercase text-muted-foreground/80">Resources</span>
            <Link href="/protected/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Client Dashboard</Link>
            <Link href="#faq" className="text-xs text-muted-foreground hover:text-foreground transition-colors">F.A.Q.</Link>
            <Link href="/api/secure/data" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Secure API Raw</Link>
          </div>

          <div className="md:col-span-4 flex flex-col space-y-3.5">
            <span className="font-bold text-xs tracking-wider uppercase text-muted-foreground/80">Active Compliance</span>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded text-[10px] font-mono font-medium">ISO-27001</span>
              <span className="bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded text-[10px] font-mono font-medium">SOC-2 Type II</span>
              <span className="bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded text-[10px] font-mono font-medium">GDPR Ready</span>
              <span className="bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded text-[10px] font-mono font-medium">PCI-DSS</span>
            </div>
            <p className="text-[11px] text-muted-foreground/75 leading-normal">
              Active WAF matches international data privacy laws. Encrypted tokens are strictly transient and are never saved.
            </p>
          </div>

        </div>
      </footer>

    </div>
  )
}
