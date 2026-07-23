import type { HTMLAttributes, ReactNode } from "react";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        "rounded-lg border border-base-600 bg-base-800 shadow-panel",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        "flex items-center justify-between gap-3 border-b border-base-600 px-4 py-3",
        className
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cx(
        "font-display text-xs uppercase tracking-[0.14em] text-ink-300",
        className
      )}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("px-4 py-4", className)} {...props} />;
}

interface StatCardProps {
  label: string;
  value: ReactNode;
  delta?: string;
  deltaTone?: "signal" | "critical" | "alert" | "neutral";
  hint?: string;
}

/** A single KPI tile — the smallest unit of the dashboard's opening grid. */
export function StatCard({ label, value, delta, deltaTone = "neutral", hint }: StatCardProps) {
  const toneClass =
    deltaTone === "signal"
      ? "text-signal"
      : deltaTone === "critical"
      ? "text-critical"
      : deltaTone === "alert"
      ? "text-alert"
      : "text-ink-500";

  return (
    <Card>
      <CardContent className="py-5">
        <p className="font-display text-[11px] uppercase tracking-[0.14em] text-ink-500">
          {label}
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-3xl text-ink-100">{value}</span>
          {delta && (
            <span className={cx("font-data text-xs", toneClass)}>{delta}</span>
          )}
        </div>
        {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
      </CardContent>
    </Card>
  );
}
