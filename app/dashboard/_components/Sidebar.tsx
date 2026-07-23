const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", tag: "OV" },
  { label: "Traces", href: "/dashboard/traces", tag: "TR" },
  { label: "Alerts", href: "/dashboard/alerts", tag: "AL" },
  { label: "Diagnostics", href: "/dashboard/diagnostics", tag: "DX" },
] as const;

/**
 * Static nav shell for Phase 0. Only "Overview" resolves to a real page
 * today — the others are placeholders wired up as their routes land in
 * later phases (see app/api/*).
 */
export function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-base-600 bg-base-800/60 lg:flex lg:flex-col">
      <div className="flex items-center gap-2.5 border-b border-base-600 px-5 py-4">
        <span className="h-2 w-2 rounded-full bg-signal animate-pulse-dot" />
        <span className="font-display text-xs tracking-[0.16em] text-ink-100">
          SENTINEL
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {NAV_ITEMS.map((item, i) => (
          <a
            key={item.href}
            href={item.href}
            aria-current={i === 0 ? "page" : undefined}
            className={`group flex items-center gap-3 rounded px-2.5 py-2 text-sm transition-colors ${
              i === 0
                ? "bg-signal/10 text-signal"
                : "text-ink-300 hover:bg-base-700 hover:text-ink-100"
            }`}
          >
            <span className="font-data text-[10px] tracking-wide text-ink-500 group-aria-[current=page]:text-signal">
              {item.tag}
            </span>
            {item.label}
          </a>
        ))}
      </nav>
      <div className="border-t border-base-600 px-5 py-4 font-data text-[11px] text-ink-500">
        v0.1.0 · phase 0
      </div>
    </aside>
  );
}
