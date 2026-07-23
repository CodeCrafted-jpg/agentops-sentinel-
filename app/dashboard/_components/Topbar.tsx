import { Badge } from "@agentops/ui";

export function Topbar() {
  return (
    <header className="flex items-center justify-between border-b border-base-600 bg-base-900/80 px-6 py-4 backdrop-blur">
      <div>
        <h1 className="font-display text-lg text-ink-100">Overview</h1>
        <p className="text-xs text-ink-500">
          production · updated {new Date().toISOString().slice(11, 16)} UTC
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Badge tone="signal" dot>
          Ingest live
        </Badge>
      </div>
    </header>
  );
}
