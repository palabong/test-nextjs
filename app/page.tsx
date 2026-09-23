"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Shield,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Terminal,
  Database,
  Info,
  AlertTriangle,
  XCircle,
  Code,
  FileText,
  ExternalLink,
  ChevronRight,
  ChevronDown,
} from "lucide-react"

// Clean log-record type definition for external integration
export interface LogRecord {
  id: string
  timestamp: string
  level: "info" | "warn" | "error" | "debug"
  source: string
  message: string
  metadata?: Record<string, any>
}

/**
 * INGESTION BOUNDARY ADAPTER
 * 
 * TODO: Connect this boundary to your real external log provider.
 */
async function fetchExternalLogs(search: string = '', level: string = 'all'): Promise<LogRecord[]> {
  const url = new URL('/api/logs', window.location.origin)
  if (search) url.searchParams.set('search', search)
  if (level !== 'all') url.searchParams.set('level', level)
  
  const res = await fetch(url.toString())
  if (!res.ok) {
    if (res.status === 503) {
      throw new Error('Database not configured')
    }
    throw new Error('Failed to fetch logs')
  }
  return res.json()
}

export default function LogRegistryPage() {
  // Log storage state (starts completely empty)
  const [logs, setLogs] = useState<LogRecord[]>([])
  
  // Operational state flags
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Filtering and searching inputs (start empty)
  const [searchQuery, setSearchQuery] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("all")
  
  // Track expanded log details row by ID
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)

  // Load external logs on component mount
  const loadLogs = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchExternalLogs()
      setLogs(data)
    } catch {
      setError("Failed to contact the external log provider.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  // Filter logs locally
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesLevel = levelFilter === "all" || log.level === levelFilter
    
    return matchesSearch && matchesLevel
  })

  const toggleRow = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id)
  }

  // Get matching icon for log level in render layer
  const getLevelIcon = (level: LogRecord["level"]) => {
    switch (level) {
      case "error":
        return <XCircle className="size-4 text-rose-500 shrink-0" />
      case "warn":
        return <AlertTriangle className="size-4 text-amber-500 shrink-0" />
      case "info":
        return <Info className="size-4 text-blue-500 shrink-0" />
      case "debug":
        return <Terminal className="size-4 text-zinc-500 shrink-0" />
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased">
      
      {/* NEUTRAL REGISTRY HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Database className="size-5 text-muted-foreground" aria-hidden="true" />
            <span className="font-bold text-base tracking-tight">Telemetry Hub</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link href="/protected/dashboard" passHref legacyBehavior>
              <Button variant="outline" size="sm" className="cursor-pointer">
                Protected Dashboard
                <ExternalLink className="size-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* CORE OBSERVABILITY LAYOUT */}
      <main className="flex-grow container mx-auto px-4 md:px-8 py-10 max-w-6xl">
        
        {/* Title Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-border/60">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Log Registry</h1>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed max-w-2xl">
              This interface is a neutral, ready-to-receive log surface configured for real-time observability of external log events. Connect your data pipeline to feed the registry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadLogs}
              disabled={loading}
              aria-label="Reload log records"
              className="cursor-pointer"
            >
              <RefreshCw className={`size-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Syncing..." : "Sync Logs"}
            </Button>
          </div>
        </div>



        {/* FILTERING CONTROLS */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center shadow-sm">
          {/* Search Message */}
          <div className="sm:col-span-8 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              placeholder="Filter by message, source, or record ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search logs"
              className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 transition-all"
            />
          </div>

          {/* Level Filter */}
          <div className="sm:col-span-4 relative flex items-center">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              aria-label="Filter by log level"
              className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-1.5 text-sm appearance-none outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 transition-all cursor-pointer"
            >
              <option value="all">All Log Levels</option>
              <option value="info">Info</option>
              <option value="warn">Warn</option>
              <option value="error">Error</option>
              <option value="debug">Debug</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
          </div>
        </div>

        {/* LOG RECORDS VIEWPORTS */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          
          {/* Loading state */}
          {loading && logs.length === 0 && (
            <div className="p-16 flex flex-col items-center justify-center space-y-3.5 text-center" role="status" aria-live="polite">
              <RefreshCw className="size-8 text-muted-foreground animate-spin" />
              <div className="space-y-1">
                <p className="font-semibold text-sm">Querying log adapter...</p>
                <p className="text-xs text-muted-foreground">Checking connection with external data layers.</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="p-16 flex flex-col items-center justify-center space-y-4 text-center" role="alert">
              <XCircle className="size-10 text-rose-500" />
              <div className="space-y-1 max-w-md">
                <p className="font-bold text-sm">Observability Pipeline Unavailable</p>
                <p className="text-xs text-muted-foreground leading-normal">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={loadLogs}>
                Retry Sync
              </Button>
            </div>
          )}

          {/* Empty state (No logs present) */}
          {!loading && !error && filteredLogs.length === 0 && (
            <div className="p-16 flex flex-col items-center justify-center space-y-4 text-center">
              <FileText className="size-10 text-muted-foreground/60" aria-hidden="true" />
              <div className="space-y-1.5 max-w-md">
                <p className="font-bold text-sm text-foreground">No Logs Received</p>
                <p className="text-xs text-muted-foreground leading-normal">
                  The registry contains zero records. External events will populate here automatically once ingestion channels are configured.
                </p>
              </div>
            </div>
          )}

          {/* Loaded Logs List */}
          {!loading && !error && filteredLogs.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    <th className="py-3 px-4 w-8"></th>
                    <th className="py-3 px-4 w-44">Timestamp</th>
                    <th className="py-3 px-4 w-28">Level</th>
                    <th className="py-3 px-4 w-40">Source</th>
                    <th className="py-3 px-4">Log Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLogs.map((log) => {
                    const isExpanded = expandedLogId === log.id
                    return (
                      <optgroup key={log.id} label={log.id} className="contents">
                        {/* Summary Row */}
                        <tr
                          onClick={() => toggleRow(log.id)}
                          className="hover:bg-muted/30 cursor-pointer transition-colors align-top"
                          role="button"
                          aria-expanded={isExpanded}
                        >
                          <td className="py-3.5 px-4">
                            {isExpanded ? (
                              <ChevronDown className="size-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="size-4 text-muted-foreground" />
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs whitespace-nowrap text-muted-foreground">
                            {log.timestamp || "Not provided"}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="flex items-center gap-1.5 font-medium">
                              {getLevelIcon(log.level)}
                              <span className="uppercase text-xs tracking-wider">{log.level}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground truncate max-w-[150px]">
                            {log.source || "Not provided"}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-foreground truncate max-w-sm md:max-w-none">
                            {log.message}
                          </td>
                        </tr>

                        {/* Detailed Row Panel */}
                        {isExpanded && (
                          <tr className="bg-muted/10">
                            <td colSpan={5} className="py-4 px-6 border-b border-border">
                              <div className="space-y-3 font-sans text-xs">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <span className="font-bold text-muted-foreground block mb-0.5">Record ID</span>
                                    <span className="font-mono bg-muted/60 px-2 py-0.5 rounded text-[11px] border border-border">
                                      {log.id}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-muted-foreground block mb-0.5">Source Module</span>
                                    <span className="font-mono">{log.source || "Not provided"}</span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-muted-foreground block mb-0.5">Log Level</span>
                                    <span className="uppercase">{log.level}</span>
                                  </div>
                                </div>

                                {log.metadata && Object.keys(log.metadata).length > 0 && (
                                  <div className="pt-2 border-t border-border/40">
                                    <span className="font-bold text-muted-foreground block mb-1.5">Extended Metadata Payload</span>
                                    <pre className="bg-muted p-3.5 rounded-lg border border-border font-mono text-[11px] text-foreground overflow-x-auto leading-normal">
                                      <code>{JSON.stringify(log.metadata, null, 2)}</code>
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </optgroup>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-border/40 py-8 bg-muted/20 text-xs text-muted-foreground text-center">
        <div className="container mx-auto px-4 md:px-8 space-y-1.5">
          <p>&copy; {new Date().getFullYear()} Log Observability Hub. All rights reserved.</p>
          <p className="text-[11px] opacity-75">
            Operating in isolated offline mode. No external calls or third-party analytical integrations are active.
          </p>
        </div>
      </footer>

    </div>
  )
}
