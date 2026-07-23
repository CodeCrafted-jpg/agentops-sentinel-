interface BarMeterItem {
  label: string;
  value: number;
  tone?: "signal" | "alert" | "critical";
}

interface BarMeterProps {
  items: BarMeterItem[];
  max?: number;
}

const toneClass: Record<NonNullable<BarMeterItem["tone"]>, string> = {
  signal: "bg-signal",
  alert: "bg-alert",
  critical: "bg-critical",
};

/** A horizontal bar-meter list — used for latency buckets, span-kind breakdowns, etc. */
export function BarMeter({ items, max }: BarMeterProps) {
  const scale = max ?? Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="w-24 shrink-0 truncate font-data text-xs text-ink-300">
            {item.label}
          </span>
          <div className="h-1.5 flex-1 rounded-full bg-base-700">
            <div
              className={`h-1.5 rounded-full ${toneClass[item.tone ?? "signal"]}`}
              style={{ width: `${Math.min(100, (item.value / scale) * 100)}%` }}
            />
          </div>
          <span className="w-12 shrink-0 text-right font-data text-xs text-ink-500">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
