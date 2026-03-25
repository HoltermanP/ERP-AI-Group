import { getInvoices } from "@/lib/actions/invoices"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Table, Thead, Tbody, Th, Tr, Td, EmptyState } from "@/components/ui/Table"
import { formatCurrency, formatDate } from "@/lib/utils/formatters"
import Link from "next/link"
import { Plus, Receipt } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function InvoicesPage() {
  const allInvoices = await getInvoices()

  // Auto-mark overdue
  const now = new Date()
  const invoices = allInvoices.map((inv) => {
    if (
      inv.status === "sent" &&
      inv.dueDate &&
      new Date(inv.dueDate) < now
    ) {
      return { ...inv, status: "overdue" }
    }
    return inv
  })

  const totalOpen = invoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((s, i) => s + parseFloat(i.total || "0"), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#F4F6FA" }}>Facturen</h1>
          <p className="mt-1 text-sm" style={{ color: "#6B82A8" }}>
            {invoices.length} factuur/facturen · Openstaand:{" "}
            <span style={{ color: "#4B8EFF", fontFamily: "'IBM Plex Mono', monospace" }}>
              {formatCurrency(totalOpen)}
            </span>
          </p>
        </div>
        <Link href="/invoices/new">
          <Button>
            <Plus size={16} />
            Nieuwe factuur
          </Button>
        </Link>
      </div>

      <Card>
        {invoices.length === 0 ? (
          <EmptyState
            icon={<Receipt size={48} />}
            title="Nog geen facturen"
            description="Maak je eerste factuur aan"
            action={
              <Link href="/invoices/new">
                <Button size="sm">
                  <Plus size={14} />
                  Factuur aanmaken
                </Button>
              </Link>
            }
          />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Nummer</Th>
                <Th>Klant</Th>
                <Th>Titel</Th>
                <Th>Status</Th>
                <Th>Totaal</Th>
                <Th>Factuurdatum</Th>
                <Th>Vervaldatum</Th>
              </Tr>
            </Thead>
            <Tbody>
              {invoices.map((invoice) => (
                <Tr
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                >
                  <Td>
                    <span className="font-mono text-xs font-semibold" style={{ color: "#4B8EFF" }}>
                      {invoice.invoiceNumber}
                    </span>
                  </Td>
                  <Td>{invoice.customer?.companyName || "-"}</Td>
                  <Td>{invoice.title}</Td>
                  <Td><Badge status={invoice.status || "draft"} /></Td>
                  <Td>
                    <span className="font-mono font-semibold">{formatCurrency(invoice.total)}</span>
                  </Td>
                  <Td style={{ color: "#6B82A8" }}>{formatDate(invoice.invoiceDate)}</Td>
                  <Td style={{ color: invoice.status === "overdue" ? "#FF4D1C" : "#6B82A8" }}>
                    {invoice.dueDate ? formatDate(invoice.dueDate) : "-"}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>
    </div>
  )
}
