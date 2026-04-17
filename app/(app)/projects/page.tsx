"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getProjects } from "@/lib/actions/projects"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { Table, Thead, Tbody, Th, Tr, Td, EmptyState } from "@/components/ui/Table"
import { formatCurrency, formatDate } from "@/lib/utils/formatters"
import { Plus, Search, FolderKanban } from "lucide-react"

type ProjectWithCustomer = Awaited<ReturnType<typeof getProjects>>[number]

export const dynamic = "force-dynamic"

const statusOptions = ["all", "concept", "active", "gepauzeerd", "afgerond"]

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithCustomer[]>([])
  const [filtered, setFiltered] = useState<ProjectWithCustomer[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProjects().then((data) => {
      setProjects(data)
      setFiltered(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    let result = projects
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.projectNumber.toLowerCase().includes(q) ||
          p.customer?.companyName?.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter)
    }
    setFiltered(result)
  }, [search, statusFilter, projects])

  const statusLabel = (s: string) => {
    const map: Record<string, string> = { all: "Alle", concept: "Concept", active: "Actief", gepauzeerd: "Gepauzeerd", afgerond: "Afgerond" }
    return map[s] || s
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#F4F6FA" }}>Projecten</h1>
          <p className="mt-1 text-sm" style={{ color: "#6B82A8" }}>
            {projects.length} project{projects.length !== 1 ? "en" : ""} totaal
          </p>
        </div>
        <Link href="/projects/new">
          <Button>
            <Plus size={16} />
            Nieuw project
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6B82A8" }} />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md outline-none"
            style={{ background: "#111116", border: "1px solid #1E2130", color: "#F4F6FA" }}
            placeholder="Zoek op naam, nummer, klant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statusOptions.map((s) => (
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
              {statusLabel(s)}
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
            icon={<FolderKanban size={48} />}
            title={search ? "Geen projecten gevonden" : "Nog geen projecten"}
            description={search ? "Probeer een andere zoekterm" : "Maak je eerste project aan"}
            action={
              !search ? (
                <Link href="/projects/new">
                  <Button size="sm"><Plus size={14} />Project aanmaken</Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Nummer</Th>
                <Th>Projectnaam</Th>
                <Th>Klant</Th>
                <Th>Status</Th>
                <Th>Begrote omzet</Th>
                <Th>Startdatum</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((project) => (
                <Tr key={project.id} onClick={() => (window.location.href = `/projects/${project.id}`)}>
                  <Td>
                    <span className="font-mono text-xs" style={{ color: "#4B8EFF" }}>{project.projectNumber}</span>
                  </Td>
                  <Td><span className="font-medium">{project.name}</span></Td>
                  <Td style={{ color: "#6B82A8" }}>{project.customer?.companyName || "-"}</Td>
                  <Td><Badge status={project.status || "concept"} /></Td>
                  <Td style={{ fontFamily: "monospace" }}>{formatCurrency(project.budgetRevenue)}</Td>
                  <Td style={{ color: "#6B82A8" }}>{formatDate(project.startDate)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>
    </div>
  )
}
