import Link from "next/link"
import { getProjectDashboard } from "@/lib/insights/projects"
import { KPICard } from "@/components/dashboard/KPICard"
import { ProjectProgressList, HEALTH } from "@/components/dashboard/ProjectProgress"
import { WeeklyHoursChart } from "@/components/dashboard/WeeklyHoursChart"
import { Card, CardHeader, CardBody } from "@/components/ui/Card"
import { formatCurrency, formatNumber } from "@/lib/utils/formatters"
import { Clock, Wallet, AlertTriangle, FolderKanban, ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

const eur = (v: number) => formatCurrency(v).replace("€ ", "€ ")

export default async function ProjectInsightsPage() {
  const d = await getProjectDashboard()
  const active = d.projects.filter((p) => p.status === "active")
  const order: Record<string, number> = { "over-budget": 0, "let-op": 1, "op-koers": 2, "geen-budget": 3 }
  const sorted = [...active].sort((a, b) => order[a.health] - order[b.health] || (b.hoursPct ?? 0) - (a.hoursPct ?? 0))
  const others = d.projects.filter((p) => p.status !== "active" && p.status !== "afgerond")
  const closed = d.projects.filter((p) => p.status === "afgerond")

  const hoursPct = d.totalHoursBudget > 0 ? Math.round((d.totalHoursUsed / d.totalHoursBudget) * 100) : null
  const costsPct = d.totalCostsBudget > 0 ? Math.round((d.totalCostsUsed / d.totalCostsBudget) * 100) : null
  const monthDelta = d.hoursPrevMonth > 0 ? Math.round(((d.hoursThisMonth - d.hoursPrevMonth) / d.hoursPrevMonth) * 100) : null

  const healthCounts = (Object.keys(HEALTH) as Array<keyof typeof HEALTH>).map((k) => ({ key: k, ...HEALTH[k], count: active.filter((p) => p.health === k).length }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs mb-2" style={{ color: "#6B82A8" }}><ArrowLeft size={12} />Dashboard</Link>
          <h1 className="text-2xl font-bold" style={{ color: "#F4F6FA" }}>Projectvoortgang</h1>
          <p className="mt-1 text-sm" style={{ color: "#6B82A8" }}>Uren, kosten en budget per project</p>
        </div>
        <Link href="/projects" className="text-sm" style={{ color: "#4B8EFF" }}>Alle projecten →</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard label="Actieve projecten" value={d.activeCount} icon={<FolderKanban size={20} />} trend={`${d.overBudgetCount} over budget · ${d.attentionCount} let op`} />
        <KPICard label="Uren benut (actief)" value={hoursPct !== null ? `${hoursPct}%` : "—"} icon={<Clock size={20} />} trend={`${formatNumber(d.totalHoursUsed)} van ${formatNumber(d.totalHoursBudget)} u begroot`} />
        <KPICard label="Kosten benut (actief)" value={costsPct !== null ? `${costsPct}%` : "—"} icon={<Wallet size={20} />} trend={`${eur(d.totalCostsUsed)} van ${eur(d.totalCostsBudget)} begroot`} />
        <KPICard label="Uren deze maand" value={formatNumber(d.hoursThisMonth)} unit="u" icon={<AlertTriangle size={20} />} trend={monthDelta !== null ? `${monthDelta >= 0 ? "+" : ""}${monthDelta}% t.o.v. vorige maand (${formatNumber(d.hoursPrevMonth)} u)` : `Vorige maand: ${formatNumber(d.hoursPrevMonth)} u`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><h2 className="font-semibold text-base" style={{ color: "#F4F6FA" }}>Uren per week</h2></CardHeader>
          <CardBody><WeeklyHoursChart data={d.weeklyHours} /></CardBody>
        </Card>
        <Card>
          <CardHeader><h2 className="font-semibold text-base" style={{ color: "#F4F6FA" }}>Status actieve projecten</h2></CardHeader>
          <CardBody className="space-y-3">
            {healthCounts.map((h) => (
              <div key={h.key} className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-sm" style={{ color: "#F4F6FA" }}><h.Icon size={14} style={{ color: h.color }} />{h.label}</span>
                <span className="font-mono text-sm" style={{ color: h.count > 0 ? h.color : "#6B82A8" }}>{h.count}</span>
              </div>
            ))}
            <div className="pt-3 mt-1 space-y-2" style={{ borderTop: "1px solid #1E2130" }}>
              <p className="text-[11px] uppercase tracking-wide" style={{ color: "#6B82A8" }}>Uren deze maand per medewerker</p>
              {d.topEmployees.length === 0 ? (
                <p className="text-xs" style={{ color: "#6B82A8" }}>Nog geen uren deze maand</p>
              ) : d.topEmployees.map((e) => (
                <div key={e.name} className="flex items-center justify-between text-sm">
                  <span style={{ color: "#F4F6FA" }}>{e.name}</span>
                  <span className="font-mono" style={{ color: "#6B82A8" }}>{formatNumber(e.hours)} u</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-base" style={{ color: "#F4F6FA" }}>Actieve projecten</h2>
            <span className="text-xs" style={{ color: "#6B82A8" }}>Witte streep in de balk = verstreken looptijd</span>
          </div>
        </CardHeader>
        <CardBody className="!px-0 !py-0"><ProjectProgressList projects={sorted} /></CardBody>
      </Card>

      {others.length > 0 && (
        <Card>
          <CardHeader><h2 className="font-semibold text-base" style={{ color: "#F4F6FA" }}>Concept &amp; gepauzeerd</h2></CardHeader>
          <CardBody className="!px-0 !py-0"><ProjectProgressList projects={others} compact /></CardBody>
        </Card>
      )}

      {closed.length > 0 && (
        <Card>
          <CardHeader><h2 className="font-semibold text-base" style={{ color: "#F4F6FA" }}>Afgerond</h2></CardHeader>
          <CardBody className="!px-0 !py-0"><ProjectProgressList projects={closed} compact /></CardBody>
        </Card>
      )}
    </div>
  )
}
