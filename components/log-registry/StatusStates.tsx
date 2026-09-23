import { RefreshCw, XCircle, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LoadingState() {
  return (
    <div className="p-16 flex flex-col items-center justify-center space-y-3.5 text-center" role="status" aria-live="polite">
      <RefreshCw className="size-8 text-muted-foreground animate-spin" />
      <div className="space-y-1">
        <p className="font-semibold text-sm">Querying log adapter...</p>
        <p className="text-xs text-muted-foreground">Checking connection with external data layers.</p>
      </div>
    </div>
  )
}

interface ErrorStateProps {
  error: string
  onRetry: () => void
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="p-16 flex flex-col items-center justify-center space-y-4 text-center" role="alert">
      <XCircle className="size-10 text-rose-500" />
      <div className="space-y-1 max-w-md">
        <p className="font-bold text-sm">Observability Pipeline Unavailable</p>
        <p className="text-xs text-muted-foreground leading-normal">{error}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Retry Sync
      </Button>
    </div>
  )
}

export function EmptyState() {
  return (
    <div className="p-16 flex flex-col items-center justify-center space-y-4 text-center">
      <FileText className="size-10 text-muted-foreground/60" aria-hidden="true" />
      <div className="space-y-1.5 max-w-md">
        <p className="font-bold text-sm text-foreground">No Logs Received</p>
        <p className="text-xs text-muted-foreground leading-normal">
          The registry contains zero records. External events will populate here automatically once ingestion channels are configured.
        </p>
      </div>
    </div>
  )
}
