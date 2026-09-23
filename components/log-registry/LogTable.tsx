import { Fragment, useState } from "react"
import { ChevronDown, ChevronRight, XCircle, AlertTriangle, Info, Terminal } from "lucide-react"

export interface LogRecord {
  id: string
  timestamp: string
  level: "info" | "warn" | "error" | "debug"
  source: string
  message: string
  metadata?: Record<string, any>
}

interface LogTableProps {
  logs: LogRecord[]
}

export function LogTable({ logs }: LogTableProps) {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)

  const toggleRow = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id)
  }

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
          {logs.map((log) => {
            const isExpanded = expandedLogId === log.id
            return (
              <Fragment key={log.id}>
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
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
