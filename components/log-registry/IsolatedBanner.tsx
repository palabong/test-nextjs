import { Code } from "lucide-react"

export function IsolatedBanner() {
  return (
    <div className="bg-muted border border-border p-5 rounded-xl flex gap-4 items-start mb-8 text-sm leading-relaxed">
      <Code className="size-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
      <div className="space-y-1.5">
        <h2 className="font-bold text-foreground">External Connection Required (Boundary Isolated)</h2>
        <p className="text-muted-foreground text-xs">
          The ingestion boundary is ready to receive records but is currently unconnected to a live database or API. No illustrative logs or dummy events are loaded.
        </p>
        <div className="text-[11px] font-mono bg-background p-3 rounded border border-border mt-3 text-muted-foreground select-all leading-normal">
          {"// Connect your database to production by setting the DATABASE_URL environment variable."}
        </div>
      </div>
    </div>
  )
}
