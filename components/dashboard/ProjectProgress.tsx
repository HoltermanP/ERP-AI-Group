import Link from "next/link"
import type { Health, ProjectInsight } from "@/lib/insights/projects"
import { formatCurrency, formatNumber } from "@/lib/utils/formatters"
import { CheckCircle2, AlertTriangle, XCircle, CircleDashed } from "lucide-react"

export const HEALTH: Record<Health, { label: string; color: string; bg: string; Icon: typeof CheckCircle2 }> = {
  "op-koers": { label: "Op koers", color: "#2DD68A", bg: "#0A2A1A", Icon: CheckCircle2 },
  "let-op": { label: "Let op", color: "#F5A623", bg: "#1E1A10", Icon: AlertTriangle },
  "over-budget": { label: "Over budget", color: "#FF6B6B", bg: "#2A1010", Icon: XCircle },
  "geen-budget": { label: "Geen budget", color: "#6B82A8", bg: "#1E2130", Icon: CircleDashed },
}

export function HealthBadge({ health }: { health: Health }) {
  const h = HEALTH[health]
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: h.bg, color: h.color }}>
      <h.Icon size={12} />
      {h.label}
    </span>
  )
}

export function barColor(pct: number | null): string {
  if (pct === null) return "#1E2130"
  if (pct > 100) return "#FF6B6B"
  if (pct > 90) return "#F5A623"
  return "#2DD68A"
}

/** Voortgangsbalk met optioneel tijd-markering (verstreken % van de looptijd) */
export function ProgressBar({ pct, marker, height = 6 }: { pct: number | null; marker?: number | null; height?: number }) {
  return (
    <div className="relative rounded-full overflow-hidden" style={{ background: "#1E2130", height }}>
      <div className="h-full rounded-full" style={{ width: `${Math.min(pct ?? 0, 100)}%`, background: barColor(pct) }} />
      {marker !== null && marker !== undefined && marker >= 0 && marker <= 100 && (
        <div className="absolute top-0 bottom-0" style={{ left: `${marker}%`, width: 2, background: "#F4F6FA", opacity: 0.7 }} title={`Tijd verstreken: ${Math.round(marker)}%`} />
      )}
    </div>
  )
}

function Metric({ label, used, budget, pct, marker, money }: { label: string; used: number; budget: number; pct: number | null; marker?: number | null; money?: boolean }) {
  const fmt = (v: number) => (money ? formatCurrency(v) : `${formatNumber(v)} u`)
  return (
    <div className="min-w-[140px]">
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="text-[11px] uppercase tracking-wide" style={{ color: "#6B82A8" }}>{label}</span>
        <span className="text-xs font-mono" style={{ color: "#F4F6FA" }}>
          {fmt(used)}
          <span style={{ color: "#6B82A8" }}> / {budget > 0 ? fmt(budget) : "—"}</span>
        </span>
      </div>
      <ProgressBar pct={pct} marker={marker} />
      <p className="text-[11px] mt-1" style={{ color: pct !== null ? barColor(pct) : "#6B82A8" }}>
        {pct !== null ? `${Math.round(pct)}%` : "geen budget"}
      </p>
    </div>
  )
}

export function ProjectProgressList({ projects, compact = false }: { projects: ProjectInsight[]; compact?: boolean }) {
  if (projects.length === 0) {
    return <p className="px-6 py-8 text-sm text-center" style={{ color: "#6B82A8" }}>Geen actieve projecten</p>
  }
  return (
    <div className="divide-y" style={{ borderColor: "#1E2130" }}>
      {projects.map((p) => (
        <Link key={p.id} href={`/projects/${p.id}`} className="block hover:bg-white/[0.02] transition-colors">
          <div className="px-6 py-4">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono" style={{ color: "#4B8EFF" }}>{p.projectNumber}</span>
                  <span className="text-sm font-medium truncate" style={{ color: "#F4F6FA" }}>{p.name}</span>
                  <HealthBadge health={p.health} />
                </div>
                <p className="text-xs mt-0.5" style={{ color: "#6B82A8" }}>
                  {p.customerName ?? "Geen klant"} · {p.healthReason}
                  {p.daysLeft !== null && (p.daysLeft >= 0 ? ` · nog ${p.daysLeft} dagen` : ` · ${-p.daysLeft} dagen over einddatum`)}
                </p>
              </div>
              {!compact && (
                <div className="text-right text-xs shrink-0" style={{ color: "#6B82A8" }}>
                  <p>Tempo <span className="font-mono" style={{ color: "#F4F6FA" }}>{formatNumber(p.hoursPerWeekActual)} u/wk</span>
                    {p.hoursPerWeekNeeded !== null && <> · nodig <span className="font-mono" style={{ color: p.hoursPerWeekNeeded > p.hoursPerWeekActual * 1.2 ? "#F5A623" : "#F4F6FA" }}>{formatNumber(p.hoursPerWeekNeeded)} u/wk</span></>}
                  </p>
                  <p className="mt-0.5">
                    Laatste 7 dgn <span className="font-mono" style={{ color: "#F4F6FA" }}>{formatNumber(p.hoursLast7)} u</span>
                    {p.forecastHours !== null && <> · prognose <span className="font-mono" style={{ color: p.hoursBudget > 0 && p.forecastHours > p.hoursBudget ? "#FF6B6B" : "#F4F6FA" }}>{formatNumber(Math.round(p.forecastHours))} u</span></>}
                  </p>
                </div>
              )}
            </div>
            <div className={`grid gap-4 ${compact ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-4"}`}>
              <Metric label="Uren" used={p.hoursUsed} budget={p.hoursBudget} pct={p.hoursPct} marker={p.timePct} />
              <Metric label="Kosten" used={p.costsUsed} budget={p.costsBudget} pct={p.costsPct} marker={p.timePct} money />
              <Metric label="Omzet" used={p.revenueActual} budget={p.revenueBudget} pct={p.revenuePct} money />
              {!compact && (
                <div className="min-w-[140px]">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="text-[11px] uppercase tracking-wide" style={{ color: "#6B82A8" }}>Tijd</span>
                    <span className="text-xs font-mono" style={{ color: "#F4F6FA" }}>{p.timePct !== null ? `${Math.round(Math.max(0, p.timePct))}%` : "—"}</span>
                  </div>
                  <ProgressBar pct={p.timePct !== null ? Math.max(0, p.timePct) : null} />
                  <p className="text-[11px] mt-1" style={{ color: "#6B82A8" }}>
                    {p.timePct !== null ? "van de looptijd verstreken" : "geen start/einddatum"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
