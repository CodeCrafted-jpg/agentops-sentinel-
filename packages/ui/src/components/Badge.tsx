import type { HTMLAttributes } from "react";

export type BadgeTone =
  | "signal"
  | "alert"
  | "critical"
  | "neutral"
  | "info";

const toneClasses: Record<BadgeTone, string> = {
  signal: "bg-signal/10 text-signal border-signal/30",
  alert: "bg-alert/10 text-alert border-alert/30",
  critical: "bg-critical/10 text-critical border-critical/30",
  neutral: "bg-base-700 text-ink-300 border-base-500",
  info: "bg-base-700 text-ink-100 border-base-500",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dot?: boolean;
}

/** Small status/severity pill used across alert rows, trace status, and tags. */
export function Badge({ tone = "neutral", dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-data text-[11px] uppercase tracking-wide ${toneClasses[tone]} ${className ?? ""}`}
      {...props}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            tone === "signal"
              ? "bg-signal animate-pulse-dot"
              : tone === "alert"
              ? "bg-alert"
              : tone === "critical"
              ? "bg-critical animate-pulse-dot"
              : "bg-ink-500"
          }`}
        />
      )}
      {children}
    </span>
  );
}

/** Maps a domain severity/status string to a badge tone, so callers don't repeat this switch. */
export function toneFromStatus(status: string): BadgeTone {
  switch (status) {
    case "ok":
    case "resolved":
      return "signal";
    case "warning":
    case "acknowledged":
      return "alert";
    case "error":
    case "timeout":
    case "critical":
    case "open":
      return "critical";
    default:
      return "neutral";
  }
}
