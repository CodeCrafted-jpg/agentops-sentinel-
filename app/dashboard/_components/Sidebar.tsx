"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", tag: "OV" },
  { label: "Traces", href: "/dashboard/traces", tag: "TR" },
  { label: "Alerts", href: "/dashboard/alerts", tag: "AL" },
  { label: "Diagnostics", href: "/dashboard/diagnostics", tag: "DX" },
] as const;

/**
 * Sidebar navigation component
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-base-600 bg-base-800/60 lg:flex lg:flex-col">
      <div className="flex items-center gap-2.5 border-b border-base-600 px-5 py-4">
        <span className="h-2 w-2 rounded-full bg-signal animate-pulse-dot" />
        <span className="font-display text-xs tracking-[0.16em] text-ink-100">
          SENTINEL
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`group flex items-center gap-3 rounded px-2.5 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-signal/10 text-signal"
                  : "text-ink-300 hover:bg-base-700 hover:text-ink-100"
              }`}
            >
              <span className="font-data text-[10px] tracking-wide text-ink-500 group-aria-[current=page]:text-signal">
                {item.tag}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-base-600 px-5 py-4 font-data text-[11px] text-ink-500">
        v0.1.0 · phase 0
      </div>
    </aside>
  );
}
