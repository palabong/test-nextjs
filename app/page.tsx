"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Database, ExternalLink, RefreshCw } from "lucide-react"

import { IsolatedBanner } from "@/components/log-registry/IsolatedBanner"
import { FilterBar } from "@/components/log-registry/FilterBar"
import { LoadingState, ErrorState, EmptyState } from "@/components/log-registry/StatusStates"
import { LogTable, LogRecord } from "@/components/log-registry/LogTable"

/**
 * INGESTION BOUNDARY ADAPTER
 */
async function fetchExternalLogs(search: string = '', level: string = 'all'): Promise<LogRecord[]> {
  const url = new URL('/api/logs', window.location.origin)
  if (search) url.searchParams.set('search', search)
  if (level !== 'all') url.searchParams.set('level', level)
  
  const res = await fetch(url.toString())
  if (!res.ok) {
    if (res.status === 503) {
      throw new Error('ISOLATED')
    }
    throw new Error('Failed to fetch logs')
  }
  return res.json()
}

export default function LogRegistryPage() {
  const [logs, setLogs] = useState<LogRecord[]>([])
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isIsolated, setIsIsolated] = useState(false)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("all")

  const loadLogs = async () => {
    setLoading(true)
    setError(null)
    setIsIsolated(false)
    try {
      const data = await fetchExternalLogs(searchQuery, levelFilter)
      setLogs(data)
    } catch (err: any) {
      if (err.message === 'ISOLATED') {
        setIsIsolated(true)
        setLogs([])
      } else {
        setError("Failed to contact the external log provider.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesLevel = levelFilter === "all" || log.level === levelFilter
    
    return matchesSearch && matchesLevel
  })

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Database className="size-5 text-muted-foreground" aria-hidden="true" />
            <span className="font-bold text-base tracking-tight">Telemetry Hub</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link
              href="/protected/dashboard"
              className={cn(buttonVariants({ variant: "outline", size: "sm", className: "cursor-pointer" }))}
            >
              Protected Dashboard
              <ExternalLink className="size-3.5 ml-1.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 md:px-8 py-10 max-w-6xl">
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

        {isIsolated && <IsolatedBanner />}

        <FilterBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          levelFilter={levelFilter}
          setLevelFilter={setLevelFilter}
        />

        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {loading && logs.length === 0 && <LoadingState />}
          {error && <ErrorState error={error} onRetry={loadLogs} />}
          {!loading && !error && filteredLogs.length === 0 && <EmptyState />}
          {!loading && !error && filteredLogs.length > 0 && <LogTable logs={filteredLogs} />}
        </div>
      </main>

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
