import { db } from "@/lib/db"

export type Health = "op-koers" | "let-op" | "over-budget" | "geen-budget"

export type ProjectInsight = {
  id: number
  projectNumber: string
  name: string
  customerName: string | null
  status: string
  startDate: string | null
  endDate: string | null
  // uren
  hoursUsed: number
  hoursBudget: number
  hoursPct: number | null
  hoursThisMonth: number
  hoursLast7: number
  hoursPrev7: number
  // kosten
  costsUsed: number
  costsBudget: number
  costsPct: number | null
  labourValue: number // uren × uurtarief medewerker
  // omzet
  revenueActual: number
  revenueBudget: number
  revenuePct: number | null
  // tijd
  timePct: number | null // 0..100+ verstreken looptijd
  daysLeft: number | null
  // prognose
  forecastHours: number | null // verwacht totaal uren bij huidige tempo
  hoursRemaining: number
  weeksRemaining: number | null
  hoursPerWeekNeeded: number | null
  hoursPerWeekActual: number
  health: Health
  healthReason: string
}

export type WeekBucket = { weekStart: string; label: string; hours: number }

export type ProjectDashboard = {
  projects: ProjectInsight[]
  activeCount: number
  totalHoursUsed: number
  totalHoursBudget: number
  totalCostsUsed: number
  totalCostsBudget: number
  totalRevenueActual: number
  totalRevenueBudget: number
  hoursThisMonth: number
  hoursPrevMonth: number
  overBudgetCount: number
  attentionCount: number
  weeklyHours: WeekBucket[]
  topEmployees: Array<{ name: string; hours: number }>
}

const num = (v: string | number | null | undefined) => parseFloat(String(v ?? "0")) || 0
const pct = (used: number, budget: number) => (budget > 0 ? (used / budget) * 100 : null)
const iso = (d: Date) => {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}
const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }
const startOfWeek = (d: Date) => addDays(new Date(d.getFullYear(), d.getMonth(), d.getDate()), -((d.getDay() + 6) % 7))
const MS_DAY = 86400000

function computeHealth(p: Omit<ProjectInsight, "health" | "healthReason">): { health: Health; reason: string } {
  const isClosed = p.status === "afgerond"
  const noBudget = p.hoursBudget <= 0 && p.costsBudget <= 0
  if (noBudget) return { health: "geen-budget", reason: "Geen budget vastgelegd" }

  if (p.hoursPct !== null && p.hoursPct > 100) return { health: "over-budget", reason: `Uren ${Math.round(p.hoursPct)}% van budget` }
  if (p.costsPct !== null && p.costsPct > 100) return { health: "over-budget", reason: `Kosten ${Math.round(p.costsPct)}% van budget` }

  if (!isClosed && p.forecastHours !== null && p.hoursBudget > 0 && p.forecastHours > p.hoursBudget * 1.1) {
    return { health: "let-op", reason: `Prognose ${Math.round(p.forecastHours)} u, budget ${Math.round(p.hoursBudget)} u` }
  }
  if (!isClosed && p.timePct !== null && p.hoursPct !== null && p.hoursPct - p.timePct > 20) {
    return { health: "let-op", reason: `Uren lopen ${Math.round(p.hoursPct - p.timePct)}% voor op de tijd` }
  }
  if (p.hoursPct !== null && p.hoursPct > 90) return { health: "let-op", reason: `Uren ${Math.round(p.hoursPct)}% van budget` }
  if (p.costsPct !== null && p.costsPct > 90) return { health: "let-op", reason: `Kosten ${Math.round(p.costsPct)}% van budget` }
  if (!isClosed && p.timePct !== null && p.timePct > 100) return { health: "let-op", reason: "Einddatum verstreken" }

  return { health: "op-koers", reason: "Binnen budget en planning" }
}

export async function getProjectDashboard(): Promise<ProjectDashboard> {
  const all = await db.query.projects.findMany({
    with: {
      customer: true,
      hours: { with: { employee: true } },
      costs: true,
      revenue: true,
    },
  })

  const today = new Date()
  const monthStart = iso(new Date(today.getFullYear(), today.getMonth(), 1))
  const prevMonthStart = iso(new Date(today.getFullYear(), today.getMonth() - 1, 1))
  const d7 = iso(addDays(today, -7))
  const d14 = iso(addDays(today, -14))

  const projects: ProjectInsight[] = all.map((p) => {
    const hoursUsed = p.hours.reduce((s, h) => s + num(h.hours), 0)
    const hoursBudget = num(p.budgetHours)
    const costsUsed = p.costs.reduce((s, c) => s + num(c.amount), 0)
    const costsBudget = num(p.budgetCosts)
    const revenueActual = p.revenue.reduce((s, r) => s + num(r.amount), 0)
    const revenueBudget = num(p.budgetRevenue)
    const labourValue = p.hours.reduce((s, h) => s + num(h.hours) * num(h.employee?.hourlyRate), 0)
    const hoursThisMonth = p.hours.filter((h) => h.date >= monthStart).reduce((s, h) => s + num(h.hours), 0)
    const hoursLast7 = p.hours.filter((h) => h.date > d7).reduce((s, h) => s + num(h.hours), 0)
    const hoursPrev7 = p.hours.filter((h) => h.date > d14 && h.date <= d7).reduce((s, h) => s + num(h.hours), 0)

    let timePct: number | null = null
    let daysLeft: number | null = null
    if (p.startDate && p.endDate) {
      const start = new Date(p.startDate).getTime(), end = new Date(p.endDate).getTime()
      const total = end - start
      if (total > 0) timePct = ((today.getTime() - start) / total) * 100
      daysLeft = Math.ceil((end - today.getTime()) / MS_DAY)
    } else if (p.endDate) {
      daysLeft = Math.ceil((new Date(p.endDate).getTime() - today.getTime()) / MS_DAY)
    }

    const hoursRemaining = Math.max(0, hoursBudget - hoursUsed)
    const weeksRemaining = daysLeft !== null && daysLeft > 0 ? daysLeft / 7 : null
    const hoursPerWeekNeeded = weeksRemaining && hoursBudget > 0 ? hoursRemaining / weeksRemaining : null

    // tempo: gemiddelde uren/week sinds eerste registratie (of start), minimaal 1 week
    const firstDate = p.hours.length ? p.hours.map((h) => h.date).sort()[0] : p.startDate
    let hoursPerWeekActual = 0
    if (firstDate && hoursUsed > 0) {
      const elapsedWeeks = Math.max(1, (today.getTime() - new Date(firstDate).getTime()) / (MS_DAY * 7))
      hoursPerWeekActual = hoursUsed / elapsedWeeks
    }
    const forecastHours =
      timePct !== null && timePct > 5 && timePct < 100 && hoursUsed > 0
        ? hoursUsed / (timePct / 100)
        : null

    const base = {
      id: p.id,
      projectNumber: p.projectNumber,
      name: p.name,
      customerName: p.customer?.companyName ?? null,
      status: p.status ?? "concept",
      startDate: p.startDate,
      endDate: p.endDate,
      hoursUsed, hoursBudget, hoursPct: pct(hoursUsed, hoursBudget), hoursThisMonth, hoursLast7, hoursPrev7,
      costsUsed, costsBudget, costsPct: pct(costsUsed, costsBudget), labourValue,
      revenueActual, revenueBudget, revenuePct: pct(revenueActual, revenueBudget),
      timePct, daysLeft,
      forecastHours, hoursRemaining, weeksRemaining, hoursPerWeekNeeded, hoursPerWeekActual,
    }
    const { health, reason } = computeHealth(base)
    return { ...base, health, healthReason: reason }
  })

  const active = projects.filter((p) => p.status === "active")

  // Wekelijkse uren (laatste 12 weken, alle projecten)
  const weekStarts: Date[] = []
  const thisWeek = startOfWeek(today)
  for (let i = 11; i >= 0; i--) weekStarts.push(addDays(thisWeek, -7 * i))
  const weeklyHours: WeekBucket[] = weekStarts.map((ws) => {
    const from = iso(ws), to = iso(addDays(ws, 7))
    const hours = all.flatMap((p) => p.hours).filter((h) => h.date >= from && h.date < to).reduce((s, h) => s + num(h.hours), 0)
    return { weekStart: from, label: `${ws.getDate()}/${ws.getMonth() + 1}`, hours }
  })

  const empMap = new Map<string, number>()
  for (const p of all) for (const h of p.hours) {
    if (h.date < monthStart) continue
    const name = h.employee?.name ?? "Onbekend"
    empMap.set(name, (empMap.get(name) ?? 0) + num(h.hours))
  }
  const topEmployees = [...empMap.entries()].map(([name, hours]) => ({ name, hours })).sort((a, b) => b.hours - a.hours).slice(0, 5)

  const allHours = all.flatMap((p) => p.hours)
  const hoursThisMonth = allHours.filter((h) => h.date >= monthStart).reduce((s, h) => s + num(h.hours), 0)
  const hoursPrevMonth = allHours.filter((h) => h.date >= prevMonthStart && h.date < monthStart).reduce((s, h) => s + num(h.hours), 0)

  return {
    projects,
    activeCount: active.length,
    totalHoursUsed: active.reduce((s, p) => s + p.hoursUsed, 0),
    totalHoursBudget: active.reduce((s, p) => s + p.hoursBudget, 0),
    totalCostsUsed: active.reduce((s, p) => s + p.costsUsed, 0),
    totalCostsBudget: active.reduce((s, p) => s + p.costsBudget, 0),
    totalRevenueActual: active.reduce((s, p) => s + p.revenueActual, 0),
    totalRevenueBudget: active.reduce((s, p) => s + p.revenueBudget, 0),
    hoursThisMonth,
    hoursPrevMonth,
    overBudgetCount: active.filter((p) => p.health === "over-budget").length,
    attentionCount: active.filter((p) => p.health === "let-op").length,
    weeklyHours,
    topEmployees,
  }
}
