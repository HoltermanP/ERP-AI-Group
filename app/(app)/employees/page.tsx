"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getEmployees } from "@/lib/actions/employees"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { Table, Thead, Tbody, Th, Tr, Td, EmptyState } from "@/components/ui/Table"
import { Plus, Search, UserCog } from "lucide-react"
import type { Employee } from "@/lib/db/schema"
import { formatCurrency } from "@/lib/utils/formatters"

export const dynamic = "force-dynamic"

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filtered, setFiltered] = useState<Employee[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getEmployees().then((data) => {
      setEmployees(data)
      setFiltered(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    let result = employees
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.email?.toLowerCase().includes(q) ||
          e.role?.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "all") {
      result = result.filter((e) => e.status === statusFilter)
    }
    setFiltered(result)
  }, [search, statusFilter, employees])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#F4F6FA" }}>Medewerkers</h1>
          <p className="mt-1 text-sm" style={{ color: "#6B82A8" }}>
            {employees.length} medewerker{employees.length !== 1 ? "s" : ""} totaal
          </p>
        </div>
        <Link href="/employees/new">
          <Button>
            <Plus size={16} />
            Nieuwe medewerker
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6B82A8" }} />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md outline-none"
            style={{ background: "#111116", border: "1px solid #1E2130", color: "#F4F6FA" }}
            placeholder="Zoek op naam, rol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["all", "active", "inactive"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 text-xs rounded-md font-medium transition-colors"
              style={{
                background: statusFilter === s ? "#2D6FE8" : "#111116",
                color: statusFilter === s ? "white" : "#6B82A8",
                border: "1px solid #1E2130",
              }}
            >
              {s === "all" ? "Alle" : s === "active" ? "Actief" : "Inactief"}
            </button>
          ))}
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#2D6FE8", borderTopColor: "transparent" }} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<UserCog size={48} />}
            title={search ? "Geen medewerkers gevonden" : "Nog geen medewerkers"}
            description={search ? "Probeer een andere zoekterm" : "Voeg je eerste medewerker toe"}
            action={
              !search ? (
                <Link href="/employees/new">
                  <Button size="sm"><Plus size={14} />Medewerker toevoegen</Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Naam</Th>
                <Th>Functie</Th>
                <Th>E-mail</Th>
                <Th>Uurtarief</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((emp) => (
                <Tr key={emp.id} onClick={() => (window.location.href = `/employees/${emp.id}/edit`)}>
                  <Td><span className="font-medium">{emp.name}</span></Td>
                  <Td>{emp.role || "-"}</Td>
                  <Td>{emp.email || "-"}</Td>
                  <Td style={{ fontFamily: "monospace" }}>{formatCurrency(emp.hourlyRate)}</Td>
                  <Td><Badge status={emp.status || "active"} /></Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>
    </div>
  )
}
