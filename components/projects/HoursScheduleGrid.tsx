"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/Button"
import { formatNumber } from "@/lib/utils/formatters"
import { Wand2, Save, Eraser } from "lucide-react"

type Variation = "none" | "light" | "strong"

export type ScheduleEntry = { date: string; hours: string; employeeId: number | null; description: string | null }

interface Props {
  employees: Array<{ id: number; name: string }>
  saving: boolean
  onSave: (entries: ScheduleEntry[]) => Promise<boolean>
}

const DAY_LABELS = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"]

// --- date helpers (all in local time, ISO yyyy-mm-dd strings) ---

function toIso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function fromIso(s: string): Date {
  const [y, m, d] = s.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

/** Monday-based weekday index: Ma=0 … Zo=6 */
function weekdayIndex(d: Date): number {
  return (d.getDay() + 6) % 7
}

function startOfWeek(d: Date): Date {
  return addDays(d, -weekdayIndex(d))
}

function isoWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

/** Deterministic PRNG so "opnieuw verdelen" gives a fresh but reproducible pattern per seed */
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Verdeel `total` uren over `days` in stappen van 0,25 u, met optionele variatie.
 * Som van het resultaat is altijd exact `total` (afgerond op 0,25).
 */
export function distributeHours(total: number, days: number, variation: Variation, seed: number, maxPerDay = 12): number[] {
  if (days <= 0 || total <= 0) return []
  const rand = mulberry32(seed)
  const spread = variation === "none" ? 0 : variation === "light" ? 0.2 : 0.5
  const weights = Array.from({ length: days }, () => 1 + (rand() * 2 - 1) * spread)
  const weightSum = weights.reduce((a, b) => a + b, 0)

  const raw = weights.map((w) => (w / weightSum) * total)
  const quarters = raw.map((v) => Math.round(v * 4))
  const targetQuarters = Math.round(total * 4)
  let diff = targetQuarters - quarters.reduce((a, b) => a + b, 0)

  // Corrigeer afrondingsverschil op de dagen met de grootste rest
  const order = raw
    .map((v, i) => ({ i, rest: v * 4 - Math.floor(v * 4) }))
    .sort((a, b) => (diff > 0 ? b.rest - a.rest : a.rest - b.rest))
    .map((x) => x.i)
  let k = 0
  while (diff !== 0 && order.length > 0) {
    const i = order[k % order.length]
    if (diff > 0) { quarters[i] += 1; diff -= 1 }
    else if (quarters[i] > 0) { quarters[i] -= 1; diff += 1 }
    k++
    if (k > days * 100) break
  }

  // Cap per dag (alleen als dat haalbaar is); overschot naar de dag met de minste uren
  const maxQ = maxPerDay * 4
  for (let pass = 0; pass < days * 4 && targetQuarters <= days * maxQ; pass++) {
    const over = quarters.findIndex((q) => q > maxQ)
    if (over === -1) break
    const excess = quarters[over] - maxQ
    quarters[over] = maxQ
    const minIdx = quarters.reduce((best, q, i) => (q < quarters[best] ? i : best), 0)
    quarters[minIdx] += excess
  }

  return quarters.map((q) => q / 4)
}

export function HoursScheduleGrid({ employees, saving, onSave }: Props) {
  const today = toIso(new Date())
  const [from, setFrom] = useState(toIso(startOfWeek(new Date())))
  const [to, setTo] = useState(toIso(addDays(startOfWeek(new Date()), 4)))
  const [employeeId, setEmployeeId] = useState<string>(employees[0] ? String(employees[0].id) : "")
  const [description, setDescription] = useState("")
  const [total, setTotal] = useState("")
  const [variation, setVariation] = useState<Variation>("light")
  const [workDays, setWorkDays] = useState<boolean[]>([true, true, true, true, true, false, false])
  const [seed, setSeed] = useState(1)
  const [cells, setCells] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  const weeks = useMemo(() => {
    const start = fromIso(from)
    const end = fromIso(to)
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return []
    const rows: Date[][] = []
    let cursor = startOfWeek(start)
    let guard = 0
    while (cursor <= end && guard < 104) {
      rows.push(Array.from({ length: 7 }, (_, i) => addDays(cursor, i)))
      cursor = addDays(cursor, 7)
      guard++
    }
    return rows
  }, [from, to])

  const inRange = (d: Date) => {
    const s = toIso(d)
    return s >= from && s <= to
  }

  const cellValue = (iso: string) => parseFloat(cells[iso] || "0") || 0
  const gridTotal = Object.keys(cells).reduce((s, k) => s + cellValue(k), 0)
  const targetTotal = parseFloat(total) || 0
  const filledDays = Object.values(cells).filter((v) => (parseFloat(v) || 0) > 0).length

  function setCell(iso: string, value: string) {
    setCells((prev) => {
      const next = { ...prev }
      if (value === "" || value === "0") delete next[iso]
      else next[iso] = value
      return next
    })
  }

  function handleDistribute(newSeed?: number) {
    setError(null)
    const t = parseFloat(total)
    if (!t || t <= 0) { setError("Vul een totaal aantal uren in."); return }
    const days = weeks.flat().filter((d) => inRange(d) && workDays[weekdayIndex(d)])
    if (days.length === 0) { setError("Geen werkdagen in de gekozen periode."); return }
    const s = newSeed ?? seed
    setSeed(s)
    const dist = distributeHours(t, days.length, variation, s)
    const next: Record<string, string> = {}
    days.forEach((d, i) => { if (dist[i] > 0) next[toIso(d)] = String(dist[i]) })
    setCells(next)
  }

  async function handleSave() {
    setError(null)
    const entries: ScheduleEntry[] = Object.entries(cells)
      .filter(([, v]) => (parseFloat(v) || 0) > 0)
      .map(([date, v]) => ({
        date,
        hours: String(parseFloat(v)),
        employeeId: employeeId ? parseInt(employeeId) : null,
        description: description || null,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
    if (entries.length === 0) { setError("Er zijn geen uren ingevuld."); return }
    const ok = await onSave(entries)
    if (ok) setCells({})
    else setError("Opslaan mislukt.")
  }

  const inputStyle: React.CSSProperties = {
    background: "#0A0A0B",
    border: "1px solid #1E2130",
    color: "#F4F6FA",
    borderRadius: "6px",
    padding: "6px 10px",
    fontSize: "13px",
    outline: "none",
  }
  const label = (text: string) => <label className="text-xs" style={{ color: "#6B82A8" }}>{text}</label>

  return (
    <div className="space-y-4">
      {/* Instellingen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="space-y-1">
          {label("Van")}
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={inputStyle} className="w-full" />
        </div>
        <div className="space-y-1">
          {label("Tot en met")}
          <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} style={inputStyle} className="w-full" />
        </div>
        <div className="space-y-1">
          {label("Medewerker")}
          <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} style={inputStyle} className="w-full">
            <option value="">— Selecteer —</option>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          {label("Omschrijving (voor alle regels)")}
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Wat is er gedaan?" style={inputStyle} className="w-full" />
        </div>
      </div>

      {/* Verdelen */}
      <div className="rounded-md p-3 space-y-3" style={{ background: "#0F1014", border: "1px solid #1E2130" }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <div className="space-y-1">
            {label("Totaal te verdelen uren")}
            <input type="number" step="0.25" min="0" value={total} onChange={(e) => setTotal(e.target.value)} placeholder="bijv. 40" style={inputStyle} className="w-full" />
          </div>
          <div className="space-y-1">
            {label("Variatie per dag")}
            <select value={variation} onChange={(e) => setVariation(e.target.value as Variation)} style={inputStyle} className="w-full">
              <option value="none">Geen (gelijk verdeeld)</option>
              <option value="light">Licht (±20%)</option>
              <option value="strong">Sterk (±50%)</option>
            </select>
          </div>
          <div className="space-y-1 col-span-2">
            {label("Werkdagen")}
            <div className="flex gap-1">
              {DAY_LABELS.map((d, i) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setWorkDays((prev) => prev.map((v, j) => (j === i ? !v : v)))}
                  className="px-2.5 py-1.5 rounded text-xs font-medium"
                  style={{
                    background: workDays[i] ? "#2D6FE8" : "#16161C",
                    color: workDays[i] ? "#fff" : "#6B82A8",
                    border: "1px solid #1E2130",
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button type="button" size="sm" variant="secondary" onClick={() => handleDistribute()}>
            <Wand2 size={14} />Verdeel over periode
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => handleDistribute(seed + 1)} disabled={variation === "none"}>
            Andere verdeling
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setCells({})} disabled={Object.keys(cells).length === 0}>
            <Eraser size={14} />Leegmaken
          </Button>
        </div>
      </div>

      {/* Grid */}
      {weeks.length === 0 ? (
        <p className="text-sm" style={{ color: "#FF6B6B" }}>Kies een geldige periode.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              <tr>
                <th className="text-left text-xs font-medium px-2 py-1.5" style={{ color: "#6B82A8" }}>Week</th>
                {DAY_LABELS.map((d) => (
                  <th key={d} className="text-center text-xs font-medium px-1 py-1.5" style={{ color: "#6B82A8" }}>{d}</th>
                ))}
                <th className="text-right text-xs font-medium px-2 py-1.5" style={{ color: "#6B82A8" }}>Totaal</th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((week) => {
                const weekTotal = week.reduce((s, d) => s + cellValue(toIso(d)), 0)
                return (
                  <tr key={toIso(week[0])}>
                    <td className="px-2 py-1 whitespace-nowrap">
                      <span className="text-xs font-mono" style={{ color: "#4B8EFF" }}>wk {isoWeekNumber(week[0])}</span>
                      <span className="text-xs ml-1.5" style={{ color: "#6B82A8" }}>
                        {week[0].getDate()}/{week[0].getMonth() + 1}
                      </span>
                    </td>
                    {week.map((d) => {
                      const iso = toIso(d)
                      const active = inRange(d)
                      const isToday = iso === today
                      return (
                        <td key={iso} className="px-0.5 py-1">
                          <input
                            type="number"
                            step="0.25"
                            min="0"
                            max="24"
                            disabled={!active}
                            value={active ? (cells[iso] ?? "") : ""}
                            onChange={(e) => setCell(iso, e.target.value)}
                            onFocus={(e) => e.target.select()}
                            title={iso}
                            className="w-full text-center"
                            style={{
                              ...inputStyle,
                              padding: "6px 4px",
                              minWidth: "52px",
                              opacity: active ? 1 : 0.25,
                              borderColor: isToday ? "#2D6FE8" : cells[iso] ? "#2DD68A55" : "#1E2130",
                            }}
                          />
                        </td>
                      )
                    })}
                    <td className="px-2 py-1 text-right font-semibold whitespace-nowrap" style={{ color: weekTotal > 0 ? "#F4F6FA" : "#6B82A8" }}>
                      {formatNumber(weekTotal)} u
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Samenvatting + opslaan */}
      <div className="flex items-center justify-between gap-4 flex-wrap pt-2" style={{ borderTop: "1px solid #1E2130" }}>
        <div className="text-sm" style={{ color: "#6B82A8" }}>
          <span className="font-semibold" style={{ color: "#F4F6FA" }}>{formatNumber(gridTotal)} u</span>
          {" "}op {filledDays} {filledDays === 1 ? "dag" : "dagen"}
          {targetTotal > 0 && (
            <span style={{ color: Math.abs(gridTotal - targetTotal) < 0.01 ? "#2DD68A" : "#F5A623" }}>
              {" "}· doel {formatNumber(targetTotal)} u
              {Math.abs(gridTotal - targetTotal) >= 0.01 && ` (${gridTotal > targetTotal ? "+" : ""}${formatNumber(gridTotal - targetTotal)})`}
            </span>
          )}
          {error && <span className="ml-3" style={{ color: "#FF6B6B" }}>{error}</span>}
        </div>
        <Button type="button" size="sm" onClick={handleSave} disabled={saving || filledDays === 0} loading={saving}>
          <Save size={14} />Opslaan ({filledDays} {filledDays === 1 ? "regel" : "regels"})
        </Button>
      </div>
    </div>
  )
}
