"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getCustomers } from "@/lib/actions/customers"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { Table, Thead, Tbody, Th, Tr, Td, EmptyState } from "@/components/ui/Table"
import { formatDate } from "@/lib/utils/formatters"
import { Plus, Search, Users } from "lucide-react"
import type { Customer } from "@/lib/db/schema"

export const dynamic = "force-dynamic"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filtered, setFiltered] = useState<Customer[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCustomers().then((data) => {
      setCustomers(data)
      setFiltered(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    let result = customers
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.companyName.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.contactName?.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "all") {
      result = result.filter((c) => (c.leadStatus || "prospect") === statusFilter)
    }
    setFiltered(result)
  }, [search, statusFilter, customers])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#F4F6FA" }}>Klanten</h1>
          <p className="mt-1 text-sm" style={{ color: "#6B82A8" }}>
            {customers.length} klant{customers.length !== 1 ? "en" : ""} totaal
          </p>
        </div>
        <Link href="/customers/new">
          <Button>
            <Plus size={16} />
            Nieuwe klant
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "#6B82A8" }}
          />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md outline-none"
            style={{
              background: "#111116",
              border: "1px solid #1E2130",
              color: "#F4F6FA",
            }}
            placeholder="Zoek op naam, e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["all", "prospect", "conversation", "proposal", "customer"].map((s) => (
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
              {s === "all"
                ? "Alle"
                : s === "prospect"
                  ? "Prospect"
                  : s === "conversation"
                    ? "Conversation"
                    : s === "proposal"
                      ? "Proposal"
                      : "Customer"}
            </button>
          ))}
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div
              className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "#2D6FE8", borderTopColor: "transparent" }}
            />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Users size={48} />}
            title={search ? "Geen klanten gevonden" : "Nog geen klanten"}
            description={search ? "Probeer een andere zoekterm" : "Voeg je eerste klant toe"}
            action={
              !search ? (
                <Link href="/customers/new">
                  <Button size="sm">
                    <Plus size={14} />
                    Klant toevoegen
                  </Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Bedrijf</Th>
                <Th>Contactpersoon</Th>
                <Th>E-mail</Th>
                <Th>Telefoon</Th>
                <Th>Leadstatus</Th>
                <Th>Sector</Th>
                <Th>Aangemaakt</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((customer) => (
                <Tr
                  key={customer.id}
                  onClick={() => (window.location.href = `/customers/${customer.id}`)}
                >
                  <Td>
                    <span className="font-medium">{customer.companyName}</span>
                  </Td>
                  <Td>{customer.contactName || "-"}</Td>
                  <Td>{customer.email || "-"}</Td>
                  <Td>{customer.phone || "-"}</Td>
                  <Td>
                    <Badge status={customer.leadStatus || "prospect"} />
                  </Td>
                  <Td>{customer.sector || "-"}</Td>
                  <Td style={{ color: "#6B82A8" }}>{formatDate(customer.createdAt)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>
    </div>
  )
}
