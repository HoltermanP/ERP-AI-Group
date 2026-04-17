"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createEmployee, updateEmployee } from "@/lib/actions/employees"
import { Button } from "@/components/ui/Button"
import type { Employee } from "@/lib/db/schema"

interface EmployeeFormProps {
  employee?: Employee
}

export function EmployeeForm({ employee }: EmployeeFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError("")

    const fd = new FormData(e.currentTarget)
    const data = {
      name: fd.get("name") as string,
      email: (fd.get("email") as string) || null,
      role: (fd.get("role") as string) || null,
      hourlyRate: (fd.get("hourlyRate") as string) || "0",
      status: fd.get("status") as string,
    }

    const result = employee
      ? await updateEmployee(employee.id, data)
      : await createEmployee(data)

    if (result.success) {
      router.push("/employees")
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

  const labelStyle = { color: "#6B82A8", fontSize: "13px", fontWeight: 500 }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div className="space-y-1.5">
        <label style={labelStyle}>Naam *</label>
        <input name="name" required defaultValue={employee?.name} style={inputStyle} placeholder="Volledige naam" />
      </div>

      <div className="space-y-1.5">
        <label style={labelStyle}>E-mail</label>
        <input name="email" type="email" defaultValue={employee?.email || ""} style={inputStyle} placeholder="naam@bedrijf.nl" />
      </div>

      <div className="space-y-1.5">
        <label style={labelStyle}>Functie / Rol</label>
        <input name="role" defaultValue={employee?.role || ""} style={inputStyle} placeholder="Bijv. Developer, Designer..." />
      </div>

      <div className="space-y-1.5">
        <label style={labelStyle}>Uurtarief (€)</label>
        <input
          name="hourlyRate"
          type="number"
          step="0.01"
          min="0"
          defaultValue={employee?.hourlyRate || "0"}
          style={inputStyle}
          placeholder="0.00"
        />
      </div>

      <div className="space-y-1.5">
        <label style={labelStyle}>Status</label>
        <select name="status" defaultValue={employee?.status || "active"} style={inputStyle}>
          <option value="active">Actief</option>
          <option value="inactive">Inactief</option>
        </select>
      </div>

      {error && <p style={{ color: "#FF6B6B", fontSize: "13px" }}>{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Opslaan..." : employee ? "Wijzigingen opslaan" : "Medewerker aanmaken"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Annuleren
        </Button>
      </div>
    </form>
  )
}
