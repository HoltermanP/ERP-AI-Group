"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createProject, updateProject } from "@/lib/actions/projects"
import { getCustomers } from "@/lib/actions/customers"
import { Button } from "@/components/ui/Button"
import type { Project, Customer } from "@/lib/db/schema"

interface ProjectFormProps {
  project?: Project
  preselectedCustomerId?: number
}

export function ProjectForm({ project, preselectedCustomerId }: ProjectFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])

  useEffect(() => {
    getCustomers().then(setCustomers)
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError("")

    const fd = new FormData(e.currentTarget)
    const data = {
      customerId: fd.get("customerId") ? parseInt(fd.get("customerId") as string) : null,
      name: fd.get("name") as string,
      description: (fd.get("description") as string) || null,
      status: fd.get("status") as string,
      startDate: (fd.get("startDate") as string) || null,
      endDate: (fd.get("endDate") as string) || null,
      budgetHours: (fd.get("budgetHours") as string) || "0",
      budgetCosts: (fd.get("budgetCosts") as string) || "0",
      budgetRevenue: (fd.get("budgetRevenue") as string) || "0",
      notes: (fd.get("notes") as string) || null,
    }

    const result = project
      ? await updateProject(project.id, data)
      : await createProject(data)

    if (result.success) {
      router.push(result.data ? `/projects/${result.data.id}` : "/projects")
    } else {
      setError(result.error || "Er is een fout opgetreden")
      setSaving(false)
    }
  }

  const inputStyle = {
    background: "#111116",
    border: "1px solid #1E2130",
    color: "#F4F6FA",
    borderRadius: "6px",
    padding: "8px 12px",
    fontSize: "14px",
    width: "100%",
    outline: "none",
  }

  const labelStyle = { color: "#6B82A8", fontSize: "13px", fontWeight: 500 as const }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5 md:col-span-2">
          <label style={labelStyle}>Projectnaam *</label>
          <input name="name" required defaultValue={project?.name} style={inputStyle} placeholder="Naam van het project" />
        </div>

        <div className="space-y-1.5">
          <label style={labelStyle}>Klant</label>
          <select
            name="customerId"
            defaultValue={project?.customerId || preselectedCustomerId || ""}
            style={inputStyle}
          >
            <option value="">— Selecteer klant —</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.companyName}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label style={labelStyle}>Status</label>
          <select name="status" defaultValue={project?.status || "concept"} style={inputStyle}>
            <option value="concept">Concept</option>
            <option value="active">Actief</option>
            <option value="gepauzeerd">Gepauzeerd</option>
            <option value="afgerond">Afgerond</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label style={labelStyle}>Startdatum</label>
          <input name="startDate" type="date" defaultValue={project?.startDate || ""} style={inputStyle} />
        </div>

        <div className="space-y-1.5">
          <label style={labelStyle}>Einddatum (gepland)</label>
          <input name="endDate" type="date" defaultValue={project?.endDate || ""} style={inputStyle} />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label style={labelStyle}>Omschrijving</label>
          <textarea
            name="description"
            defaultValue={project?.description || ""}
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
            placeholder="Korte beschrijving van het project..."
          />
        </div>
      </div>

      <div style={{ borderTop: "1px solid #1E2130", paddingTop: "20px" }}>
        <p className="text-sm font-semibold mb-4" style={{ color: "#F4F6FA" }}>Budget</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label style={labelStyle}>Budget uren</label>
            <input
              name="budgetHours"
              type="number"
              step="0.5"
              min="0"
              defaultValue={project?.budgetHours || "0"}
              style={inputStyle}
              placeholder="0"
            />
          </div>
          <div className="space-y-1.5">
            <label style={labelStyle}>Budget kosten (€)</label>
            <input
              name="budgetCosts"
              type="number"
              step="0.01"
              min="0"
              defaultValue={project?.budgetCosts || "0"}
              style={inputStyle}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-1.5">
            <label style={labelStyle}>Begrote omzet (€)</label>
            <input
              name="budgetRevenue"
              type="number"
              step="0.01"
              min="0"
              defaultValue={project?.budgetRevenue || "0"}
              style={inputStyle}
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label style={labelStyle}>Notities</label>
        <textarea
          name="notes"
          defaultValue={project?.notes || ""}
          rows={2}
          style={{ ...inputStyle, resize: "vertical" }}
          placeholder="Interne notities..."
        />
      </div>

      {error && <p style={{ color: "#FF6B6B", fontSize: "13px" }}>{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Opslaan..." : project ? "Wijzigingen opslaan" : "Project aanmaken"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Annuleren
        </Button>
      </div>
    </form>
  )
}
