import Link from "next/link";
import { Badge } from "@agentops/ui";

const capabilities = [
  {
    tag: "TRACE",
    title: "Every span, correlated",
    body: "Ingest OpenTelemetry spans straight from SigNoz and stitch them into full agent runs — no manual instrumentation glue.",
  },
  {
    tag: "ALERT",
    title: "Rules that watch the run",
    body: "Latency, cost, and error-rate rules fire the moment a webhook lands, before a regression reaches a customer.",
  },
  {
    tag: "DIAGNOSE",
    title: "Root cause in one click",
    body: "The diagnosis agent walks the failing trace over MCP and hands back a suggested fix, not just a stack trace.",
  },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="mx-auto flex max-w-6xl flex-col px-6 pb-24 pt-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-signal animate-pulse-dot" />
            <span className="font-display text-sm tracking-[0.18em] text-ink-100">
              AGENTOPS SENTINEL
            </span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-ink-300">
            <a href="#capabilities" className="hover:text-ink-100">
              Capabilities
            </a>
            <Link
              href="/dashboard"
              className="rounded border border-signal/30 bg-signal/10 px-3 py-1.5 font-medium text-signal hover:bg-signal/20"
            >
              Open Dashboard
            </Link>
          </nav>
        </header>

        {/* Hero */}
        <section className="mt-20 grid gap-12 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div>
            <Badge tone="signal" dot>
              Live on SigNoz
            </Badge>
            <h1 className="mt-5 font-display text-4xl leading-[1.1] text-ink-100 text-glow sm:text-5xl">
              Watch every agent.
              <br />
              Catch every regression.
            </h1>
            <p className="mt-5 max-w-lg text-base text-ink-300">
              AgentOps Sentinel turns raw OpenTelemetry traces from your agent
              pipelines into a single console: what ran, what broke, and why —
              with a diagnosis agent standing by to explain the failure before
              you open a terminal.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link
                href="/dashboard"
                className="rounded bg-signal px-4 py-2 font-medium text-base-950 hover:bg-signal/90"
              >
                Open Dashboard
              </Link>
              <a
                href="#capabilities"
                className="text-sm font-medium text-ink-300 hover:text-ink-100"
              >
                See how it watches your traces →
              </a>
            </div>
          </div>

          <HeroSignal />
        </section>

        {/* Capabilities */}
        <section id="capabilities" className="mt-28">
          <p className="font-display text-xs uppercase tracking-[0.14em] text-ink-500">
            What the console does
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {capabilities.map((c) => (
              <div
                key={c.tag}
                className="rounded-lg border border-base-600 bg-base-800 p-5 shadow-panel"
              >
                <span className="font-data text-[11px] tracking-[0.14em] text-signal">
                  {c.tag}
                </span>
                <h3 className="mt-3 font-display text-lg text-ink-100">
                  {c.title}
                </h3>
                <p className="mt-2 text-sm text-ink-300">{c.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

/**
 * Signature element: a live-looking trace waveform with a scanning sweep,
 * standing in for the "sentinel" watching the signal — the one thing this
 * page should be remembered by.
 */
function HeroSignal() {
  const path =
    "M0,60 L20,60 L28,30 L36,90 L44,20 L52,60 L70,60 L78,45 L86,60 L110,60 L118,15 L126,100 L134,60 L160,60 L168,50 L176,60 L200,60 L208,25 L216,80 L224,60 L260,60";

  return (
    <div className="relative overflow-hidden rounded-lg border border-base-600 bg-base-800 shadow-panel">
      <div className="flex items-center justify-between border-b border-base-600 px-4 py-2.5">
        <span className="font-data text-[11px] uppercase tracking-wide text-ink-500">
          trace · checkout-agent · run #4821
        </span>
        <Badge tone="critical">1 error span</Badge>
      </div>
      <div className="relative h-56 px-4 py-6">
        <svg viewBox="0 0 260 120" className="h-full w-full" preserveAspectRatio="none">
          <path
            d={path}
            fill="none"
            stroke="#37E8C4"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.9}
          />
          <circle cx={126} cy={100} r={4} fill="#F1495B" />
        </svg>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 animate-sweep bg-gradient-to-r from-transparent via-signal/10 to-transparent" />
      </div>
      <div className="flex items-center justify-between border-t border-base-600 px-4 py-2.5 font-data text-[11px] text-ink-500">
        <span>span: retrieval.fetch_inventory</span>
        <span className="text-critical">timeout · 4.2s</span>
      </div>
    </div>
  );
}
