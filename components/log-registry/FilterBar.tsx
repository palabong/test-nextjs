import { Search, Filter, ChevronDown } from "lucide-react"

interface FilterBarProps {
  searchQuery: string
  setSearchQuery: (val: string) => void
  levelFilter: string
  setLevelFilter: (val: string) => void
}

export function FilterBar({ searchQuery, setSearchQuery, levelFilter, setLevelFilter }: FilterBarProps) {
  return (
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
  )
}
