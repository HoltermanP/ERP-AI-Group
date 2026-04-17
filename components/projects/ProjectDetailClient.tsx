"use client"

import { useState } from "react"
import Link from "next/link"
import { addProjectHour, deleteProjectHour, addProjectCost, deleteProjectCost, addProjectRevenue, deleteProjectRevenue, addProjectEmployee, removeProjectEmployee } from "@/lib/actions/projects"
import { Card, CardHeader, CardBody } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils/formatters"
import { Trash2, Plus, UserPlus } from "lucide-react"
import type { Employee } from "@/lib/db/schema"

type ProjectFull = {
  id: number
  projectNumber: string
  name: string
  status: string | null
  startDate: string | null
  endDate: string | null
  budgetHours: string | null
  budgetCosts: string | null
  budgetRevenue: string | null
  notes: string | null
  description: string | null
  customer: { id: number; companyName: string } | null
  projectEmployees: Array<{
    id: number
    role: string | null
    budgetHours: string | null
    employee: { id: number; name: string; role: string | null; hourlyRate: string | null } | null
  }>
  hours: Array<{
    id: number
    date: string
    hours: string
    description: string | null
    invoiced: boolean | null
    employee: { id: number; name: string } | null
  }>
  costs: Array<{
    id: number
    date: string
    description: string
    amount: string
    category: string | null
    invoiced: boolean | null
  }>
  revenue: Array<{
    id: number
    date: string
    description: string
    amount: string
    type: string | null
  }>
}

interface Props {
  project: ProjectFull
  allEmployees: Employee[]
}

type Tab = "overzicht" | "uren" | "kosten" | "omzet" | "medewerkers"

export function ProjectDetailClient({ project, allEmployees }: Props) {
  const [tab, setTab] = useState<Tab>("overzicht")
  const [hours, setHours] = useState(project.hours)
  const [costs, setCosts] = useState(project.costs)
  const [revenue, setRevenue] = useState(project.revenue)
  const [projectEmployees, setProjectEmployees] = useState(project.projectEmployees)
  const [saving, setSaving] = useState(false)

  const totalHours = hours.reduce((s, h) => s + parseFloat(h.hours), 0)
  const totalCosts = costs.reduce((s, c) => s + parseFloat(c.amount), 0)
  const totalRevenue = revenue.filter((r) => r.type === "actual").reduce((s, r) => s + parseFloat(r.amount), 0)
  const forecastRevenue = revenue.filter((r) => r.type === "forecast").reduce((s, r) => s + parseFloat(r.amount), 0)
  const budgetHours = parseFloat(project.budgetHours || "0")
  const budgetCosts = parseFloat(project.budgetCosts || "0")
  const budgetRevenue = parseFloat(project.budgetRevenue || "0")

  const inputStyle = {
    background: "#0A0A0B",
    border: "1px solid #1E2130",
    color: "#F4F6FA",
    borderRadius: "6px",
    padding: "6px 10px",
    fontSize: "13px",
    outline: "none",
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "overzicht", label: "Overzicht" },
    { key: "uren", label: `Uren (${formatNumber(totalHours)})` },
    { key: "kosten", label: `Kosten (${formatCurrency(totalCosts)})` },
    { key: "omzet", label: `Omzet (${formatCurrency(totalRevenue)})` },
    { key: "medewerkers", label: `Medewerkers (${projectEmployees.length})` },
  ]

  async function handleAddHour(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setSaving(true)
    const fd = new FormData(form)
    const result = await addProjectHour({
      projectId: project.id,
      employeeId: fd.get("employeeId") ? parseInt(fd.get("employeeId") as string) : null,
      date: fd.get("date") as string,
      hours: fd.get("hours") as string,
      description: (fd.get("description") as string) || null,
    })
    if (result.success && result.data) {
      const emp = allEmployees.find((e) => e.id === result.data!.employeeId) || null
      setHours((prev) => [{ ...result.data!, employee: emp }, ...prev])
      form.reset()
    }
    setSaving(false)
  }

  async function handleDeleteHour(id: number) {
    await deleteProjectHour(id, project.id)
    setHours((prev) => prev.filter((h) => h.id !== id))
  }

  async function handleAddCost(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setSaving(true)
    const fd = new FormData(form)
    const result = await addProjectCost({
      projectId: project.id,
      description: fd.get("description") as string,
      amount: fd.get("amount") as string,
      category: (fd.get("category") as string) || null,
      date: fd.get("date") as string,
    })
    if (result.success && result.data) {
      setCosts((prev) => [result.data!, ...prev])
      form.reset()
    }
    setSaving(false)
  }

  async function handleDeleteCost(id: number) {
    await deleteProjectCost(id, project.id)
    setCosts((prev) => prev.filter((c) => c.id !== id))
  }

  async function handleAddRevenue(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setSaving(true)
    const fd = new FormData(form)
    const result = await addProjectRevenue({
      projectId: project.id,
      description: fd.get("description") as string,
      amount: fd.get("amount") as string,
      date: fd.get("date") as string,
      type: fd.get("type") as string,
    })
    if (result.success && result.data) {
      setRevenue((prev) => [result.data!, ...prev])
      form.reset()
    }
    setSaving(false)
  }

  async function handleDeleteRevenue(id: number) {
    await deleteProjectRevenue(id, project.id)
    setRevenue((prev) => prev.filter((r) => r.id !== id))
  }

  async function handleAddEmployee(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setSaving(true)
    const fd = new FormData(form)
    const employeeId = parseInt(fd.get("employeeId") as string)
    const result = await addProjectEmployee({
      projectId: project.id,
      employeeId,
      role: (fd.get("role") as string) || null,
      budgetHours: (fd.get("budgetHours") as string) || "0",
    })
    if (result.success && result.data) {
      const emp = allEmployees.find((e) => e.id === employeeId) || null
      setProjectEmployees((prev) => [...prev, { ...result.data!, employee: emp }])
      form.reset()
    }
    setSaving(false)
  }

  async function handleRemoveEmployee(id: number) {
    await removeProjectEmployee(id, project.id)
    setProjectEmployees((prev) => prev.filter((pe) => pe.id !== id))
  }

  const today = new Date().toISOString().split("T")[0]
  const assignedEmployeeIds = new Set(projectEmployees.map((pe) => pe.employee?.id ?? -1))
  const availableEmployees = allEmployees.filter((e) => !assignedEmployeeIds.has(e.id))

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b" style={{ borderColor: "#1E2130" }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-2.5 text-sm font-medium transition-colors"
            style={{
              color: tab === t.key ? "#F4F6FA" : "#6B82A8",
              borderBottom: tab === t.key ? "2px solid #2D6FE8" : "2px solid transparent",
              marginBottom: "-1px",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overzicht */}
      {tab === "overzicht" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Uren", actual: formatNumber(totalHours) + " u", budget: formatNumber(budgetHours) + " u", pct: budgetHours > 0 ? (totalHours / budgetHours) * 100 : 0 },
            { label: "Kosten", actual: formatCurrency(totalCosts), budget: formatCurrency(budgetCosts), pct: budgetCosts > 0 ? (totalCosts / budgetCosts) * 100 : 0 },
            { label: "Omzet", actual: formatCurrency(totalRevenue), budget: formatCurrency(budgetRevenue), pct: budgetRevenue > 0 ? (totalRevenue / budgetRevenue) * 100 : 0, forecast: formatCurrency(forecastRevenue) },
          ].map((item) => (
            <Card key={item.label}>
              <CardBody>
                <p className="text-xs font-medium mb-2" style={{ color: "#6B82A8" }}>{item.label.toUpperCase()}</p>
                <p className="text-2xl font-bold" style={{ color: "#F4F6FA" }}>{item.actual}</p>
                <p className="text-xs mt-1" style={{ color: "#6B82A8" }}>Begroot: {item.budget}</p>
                {"forecast" in item && item.forecast && (
                  <p className="text-xs mt-0.5" style={{ color: "#F5A623" }}>Prognose: {item.forecast}</p>
                )}
                <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "#1E2130" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(item.pct, 100)}%`,
                      background: item.pct > 100 ? "#FF6B6B" : item.pct > 80 ? "#F5A623" : "#2DD68A",
                    }}
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: "#6B82A8" }}>{Math.round(item.pct)}% van budget</p>
              </CardBody>
            </Card>
          ))}

          {project.description && (
            <Card className="md:col-span-3">
              <CardBody>
                <p className="text-xs font-medium mb-1" style={{ color: "#6B82A8" }}>OMSCHRIJVING</p>
                <p className="text-sm" style={{ color: "#F4F6FA" }}>{project.description}</p>
              </CardBody>
            </Card>
          )}

          {project.notes && (
            <Card className="md:col-span-3">
              <CardBody>
                <p className="text-xs font-medium mb-1" style={{ color: "#6B82A8" }}>NOTITIES</p>
                <p className="text-sm" style={{ color: "#F4F6FA" }}>{project.notes}</p>
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {/* Uren */}
      {tab === "uren" && (
        <div className="space-y-4">
          <Card>
            <CardHeader><p className="text-sm font-semibold" style={{ color: "#F4F6FA" }}>Uren registreren</p></CardHeader>
            <CardBody>
              <form onSubmit={handleAddHour} className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
                <div className="space-y-1">
                  <label className="text-xs" style={{ color: "#6B82A8" }}>Datum</label>
                  <input name="date" type="date" required defaultValue={today} style={inputStyle} className="w-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs" style={{ color: "#6B82A8" }}>Medewerker</label>
                  <select name="employeeId" style={inputStyle} className="w-full">
                    <option value="">— Selecteer —</option>
                    {projectEmployees.map((pe) => pe.employee && (
                      <option key={pe.id} value={pe.employee.id}>{pe.employee.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs" style={{ color: "#6B82A8" }}>Uren</label>
                  <input name="hours" type="number" step="0.25" min="0.25" required placeholder="0.00" style={inputStyle} className="w-full" />
                </div>
                <div className="space-y-1 md:col-span-1">
                  <label className="text-xs" style={{ color: "#6B82A8" }}>Omschrijving</label>
                  <input name="description" placeholder="Wat is er gedaan?" style={inputStyle} className="w-full" />
                </div>
                <Button type="submit" size="sm" disabled={saving}>
                  <Plus size={14} />Toevoegen
                </Button>
              </form>
            </CardBody>
          </Card>

          <Card>
            <div className="divide-y" style={{ borderColor: "#1E2130" }}>
              {hours.length === 0 ? (
                <p className="px-6 py-8 text-sm text-center" style={{ color: "#6B82A8" }}>Nog geen uren geregistreerd</p>
              ) : (
                hours.map((h) => (
                  <div key={h.id} className="px-6 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-xs font-mono shrink-0" style={{ color: "#6B82A8" }}>{formatDate(h.date)}</span>
                      <span className="text-sm font-semibold shrink-0" style={{ color: "#F4F6FA" }}>{formatNumber(h.hours)} u</span>
                      {h.employee && <span className="text-xs shrink-0" style={{ color: "#4B8EFF" }}>{h.employee.name}</span>}
                      {h.description && <span className="text-xs truncate" style={{ color: "#6B82A8" }}>{h.description}</span>}
                    </div>
                    <button onClick={() => handleDeleteHour(h.id)} style={{ color: "#6B82A8" }} className="hover:text-red-400 shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
            {hours.length > 0 && (
              <div className="px-6 py-3 flex justify-between" style={{ borderTop: "1px solid #1E2130" }}>
                <span className="text-sm" style={{ color: "#6B82A8" }}>Totaal</span>
                <span className="text-sm font-semibold" style={{ color: "#F4F6FA" }}>{formatNumber(totalHours)} uur ({budgetHours > 0 ? `${Math.round((totalHours / budgetHours) * 100)}% van ${formatNumber(budgetHours)} u budget` : "geen budget"})</span>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Kosten */}
      {tab === "kosten" && (
        <div className="space-y-4">
          <Card>
            <CardHeader><p className="text-sm font-semibold" style={{ color: "#F4F6FA" }}>Kosten registreren</p></CardHeader>
            <CardBody>
              <form onSubmit={handleAddCost} className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
                <div className="space-y-1">
                  <label className="text-xs" style={{ color: "#6B82A8" }}>Datum</label>
                  <input name="date" type="date" required defaultValue={today} style={inputStyle} className="w-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs" style={{ color: "#6B82A8" }}>Categorie</label>
                  <select name="category" style={inputStyle} className="w-full">
                    <option value="">— Categorie —</option>
                    <option value="materiaal">Materiaal</option>
                    <option value="reis">Reis &amp; verblijf</option>
                    <option value="extern">Extern personeel</option>
                    <option value="software">Software/licenties</option>
                    <option value="overig">Overig</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs" style={{ color: "#6B82A8" }}>Bedrag (€)</label>
                  <input name="amount" type="number" step="0.01" min="0" required placeholder="0.00" style={inputStyle} className="w-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs" style={{ color: "#6B82A8" }}>Omschrijving</label>
                  <input name="description" required placeholder="Omschrijving" style={inputStyle} className="w-full" />
                </div>
                <Button type="submit" size="sm" disabled={saving}>
                  <Plus size={14} />Toevoegen
                </Button>
              </form>
            </CardBody>
          </Card>

          <Card>
            <div className="divide-y" style={{ borderColor: "#1E2130" }}>
              {costs.length === 0 ? (
                <p className="px-6 py-8 text-sm text-center" style={{ color: "#6B82A8" }}>Nog geen kosten geregistreerd</p>
              ) : (
                costs.map((c) => (
                  <div key={c.id} className="px-6 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-xs font-mono shrink-0" style={{ color: "#6B82A8" }}>{formatDate(c.date)}</span>
                      <span className="text-sm font-semibold shrink-0" style={{ color: "#F4F6FA" }}>{formatCurrency(c.amount)}</span>
                      {c.category && <span className="text-xs px-2 py-0.5 rounded-full shrink-0" style={{ background: "#1E2130", color: "#6B82A8" }}>{c.category}</span>}
                      <span className="text-xs truncate" style={{ color: "#6B82A8" }}>{c.description}</span>
                    </div>
                    <button onClick={() => handleDeleteCost(c.id)} style={{ color: "#6B82A8" }} className="hover:text-red-400 shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
            {costs.length > 0 && (
              <div className="px-6 py-3 flex justify-between" style={{ borderTop: "1px solid #1E2130" }}>
                <span className="text-sm" style={{ color: "#6B82A8" }}>Totaal</span>
                <span className="text-sm font-semibold" style={{ color: "#F4F6FA" }}>{formatCurrency(totalCosts)} {budgetCosts > 0 ? `(${Math.round((totalCosts / budgetCosts) * 100)}% van ${formatCurrency(budgetCosts)} budget)` : ""}</span>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Omzet */}
      {tab === "omzet" && (
        <div className="space-y-4">
          <Card>
            <CardHeader><p className="text-sm font-semibold" style={{ color: "#F4F6FA" }}>Omzet boeken</p></CardHeader>
            <CardBody>
              <form onSubmit={handleAddRevenue} className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
                <div className="space-y-1">
                  <label className="text-xs" style={{ color: "#6B82A8" }}>Datum</label>
                  <input name="date" type="date" required defaultValue={today} style={inputStyle} className="w-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs" style={{ color: "#6B82A8" }}>Type</label>
                  <select name="type" style={inputStyle} className="w-full">
                    <option value="actual">Geboekt</option>
                    <option value="forecast">Prognose</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs" style={{ color: "#6B82A8" }}>Bedrag (€)</label>
                  <input name="amount" type="number" step="0.01" min="0" required placeholder="0.00" style={inputStyle} className="w-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs" style={{ color: "#6B82A8" }}>Omschrijving</label>
                  <input name="description" required placeholder="Omschrijving" style={inputStyle} className="w-full" />
                </div>
                <Button type="submit" size="sm" disabled={saving}>
                  <Plus size={14} />Toevoegen
                </Button>
              </form>
            </CardBody>
          </Card>

          <Card>
            <div className="divide-y" style={{ borderColor: "#1E2130" }}>
              {revenue.length === 0 ? (
                <p className="px-6 py-8 text-sm text-center" style={{ color: "#6B82A8" }}>Nog geen omzet geboekt</p>
              ) : (
                revenue.map((r) => (
                  <div key={r.id} className="px-6 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-xs font-mono shrink-0" style={{ color: "#6B82A8" }}>{formatDate(r.date)}</span>
                      <span className="text-sm font-semibold shrink-0" style={{ color: "#F4F6FA" }}>{formatCurrency(r.amount)}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full shrink-0" style={{ background: r.type === "actual" ? "#0A2A1A" : "#1E1A10", color: r.type === "actual" ? "#2DD68A" : "#F5A623" }}>
                        {r.type === "actual" ? "Geboekt" : "Prognose"}
                      </span>
                      <span className="text-xs truncate" style={{ color: "#6B82A8" }}>{r.description}</span>
                    </div>
                    <button onClick={() => handleDeleteRevenue(r.id)} style={{ color: "#6B82A8" }} className="hover:text-red-400 shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
            {revenue.length > 0 && (
              <div className="px-6 py-3 space-y-1" style={{ borderTop: "1px solid #1E2130" }}>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: "#6B82A8" }}>Geboekte omzet</span>
                  <span className="text-sm font-semibold" style={{ color: "#2DD68A" }}>{formatCurrency(totalRevenue)}</span>
                </div>
                {forecastRevenue > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: "#6B82A8" }}>Prognose omzet</span>
                    <span className="text-sm font-semibold" style={{ color: "#F5A623" }}>{formatCurrency(forecastRevenue)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: "#6B82A8" }}>Begrote omzet</span>
                  <span className="text-sm" style={{ color: "#6B82A8" }}>{formatCurrency(budgetRevenue)}</span>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Medewerkers */}
      {tab === "medewerkers" && (
        <div className="space-y-4">
          {availableEmployees.length > 0 && (
            <Card>
              <CardHeader><p className="text-sm font-semibold" style={{ color: "#F4F6FA" }}>Medewerker toevoegen</p></CardHeader>
              <CardBody>
                <form onSubmit={handleAddEmployee} className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
                  <div className="space-y-1">
                    <label className="text-xs" style={{ color: "#6B82A8" }}>Medewerker</label>
                    <select name="employeeId" required style={inputStyle} className="w-full">
                      <option value="">— Selecteer —</option>
                      {availableEmployees.map((e) => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs" style={{ color: "#6B82A8" }}>Rol op project</label>
                    <input name="role" placeholder="Bijv. Lead developer" style={inputStyle} className="w-full" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs" style={{ color: "#6B82A8" }}>Budget uren</label>
                    <input name="budgetHours" type="number" step="0.5" min="0" defaultValue="0" placeholder="0" style={inputStyle} className="w-full" />
                  </div>
                  <Button type="submit" size="sm" disabled={saving}>
                    <UserPlus size={14} />Toevoegen
                  </Button>
                </form>
              </CardBody>
            </Card>
          )}

          <Card>
            <div className="divide-y" style={{ borderColor: "#1E2130" }}>
              {projectEmployees.length === 0 ? (
                <p className="px-6 py-8 text-sm text-center" style={{ color: "#6B82A8" }}>Nog geen medewerkers toegewezen</p>
              ) : (
                projectEmployees.map((pe) => (
                  <div key={pe.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: "#F4F6FA" }}>{pe.employee?.name || "Onbekend"}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#6B82A8" }}>
                        {pe.employee?.role || ""}
                        {pe.role ? ` · ${pe.role}` : ""}
                        {parseFloat(pe.budgetHours || "0") > 0 ? ` · ${formatNumber(pe.budgetHours)} u budget` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link href={`/employees/${pe.employee?.id}/edit`}>
                        <span className="text-xs" style={{ color: "#4B8EFF" }}>Bewerken</span>
                      </Link>
                      <button onClick={() => handleRemoveEmployee(pe.id)} style={{ color: "#6B82A8" }} className="hover:text-red-400">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
