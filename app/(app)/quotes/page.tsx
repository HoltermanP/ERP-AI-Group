import { getQuotes } from "@/lib/actions/quotes"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Table, Thead, Tbody, Th, Tr, Td, EmptyState } from "@/components/ui/Table"
import { formatCurrency, formatDate } from "@/lib/utils/formatters"
import Link from "next/link"
import { Plus, FileText } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function QuotesPage() {
  const quotes = await getQuotes()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#F4F6FA" }}>Offertes</h1>
          <p className="mt-1 text-sm" style={{ color: "#6B82A8" }}>
            {quotes.length} offerte{quotes.length !== 1 ? "s" : ""} totaal
          </p>
        </div>
        <Link href="/quotes/new">
          <Button>
            <Plus size={16} />
            Nieuwe offerte
          </Button>
        </Link>
      </div>

      <Card>
        {quotes.length === 0 ? (
          <EmptyState
            icon={<FileText size={48} />}
            title="Nog geen offertes"
            description="Maak je eerste offerte aan"
            action={
              <Link href="/quotes/new">
                <Button size="sm">
                  <Plus size={14} />
                  Offerte aanmaken
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
                <Th>Geldig tot</Th>
                <Th>Aangemaakt</Th>
              </Tr>
            </Thead>
            <Tbody>
              {quotes.map((quote) => (
                <Tr key={quote.id} onClick={() => (window.location.href = `/quotes/${quote.id}`)}>
                  <Td>
                    <span className="font-mono text-xs font-semibold" style={{ color: "#4B8EFF" }}>
                      {quote.quoteNumber}
                    </span>
                  </Td>
                  <Td>{quote.customer?.companyName || "-"}</Td>
                  <Td>{quote.title}</Td>
                  <Td><Badge status={quote.status || "draft"} /></Td>
                  <Td>
                    <span className="font-mono font-semibold">{formatCurrency(quote.total)}</span>
                  </Td>
                  <Td style={{ color: "#6B82A8" }}>{quote.validUntil ? formatDate(quote.validUntil) : "-"}</Td>
                  <Td style={{ color: "#6B82A8" }}>{formatDate(quote.createdAt)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>
    </div>
  )
}
