import { notFound } from "next/navigation"
import Link from "next/link"
import { getQuote } from "@/lib/actions/quotes"
import { Card, CardHeader, CardBody } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { formatCurrency, formatDate } from "@/lib/utils/formatters"
import { Pencil, FileDown } from "lucide-react"
import { QuoteStatusActions } from "@/components/quotes/QuoteStatusActions"
import { PDFDownloadButton } from "@/components/pdf/PDFDownloadButton"
import { Table, Thead, Tbody, Th, Tr, Td } from "@/components/ui/Table"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function QuoteDetailPage({ params }: PageProps) {
  const { id } = await params
  const quote = await getQuote(parseInt(id))
  if (!quote) notFound()

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono" style={{ color: "#F4F6FA" }}>
              {quote.quoteNumber}
            </h1>
            <Badge status={quote.status || "draft"} />
          </div>
          <p className="mt-1 text-sm" style={{ color: "#6B82A8" }}>{quote.title}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <PDFDownloadButton href={`/api/pdf/quote/${quote.id}`} label="PDF" />
          <Link href={`/quotes/${quote.id}/edit`}>
            <Button variant="secondary" size="sm">
              <Pencil size={14} />
              Bewerken
            </Button>
          </Link>
          <QuoteStatusActions quote={quote} />
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-sm" style={{ color: "#F4F6FA" }}>Klantgegevens</h2>
          </CardHeader>
          <CardBody className="space-y-1 text-sm">
            <p className="font-semibold" style={{ color: "#F4F6FA" }}>{quote.customer?.companyName}</p>
            {quote.customer?.contactName && (
              <p style={{ color: "#6B82A8" }}>{quote.customer.contactName}</p>
            )}
            {quote.customer?.address && <p style={{ color: "#6B82A8" }}>{quote.customer.address}</p>}
            {(quote.customer?.postalCode || quote.customer?.city) && (
              <p style={{ color: "#6B82A8" }}>
                {quote.customer.postalCode} {quote.customer.city}
              </p>
            )}
            {quote.customer?.email && <p style={{ color: "#4B8EFF" }}>{quote.customer.email}</p>}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-sm" style={{ color: "#F4F6FA" }}>Offerte details</h2>
          </CardHeader>
          <CardBody className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span style={{ color: "#6B82A8" }}>Offertedatum</span>
              <span style={{ color: "#F4F6FA" }}>{formatDate(quote.createdAt)}</span>
            </div>
            {quote.validUntil && (
              <div className="flex justify-between">
                <span style={{ color: "#6B82A8" }}>Geldig tot</span>
                <span style={{ color: "#F4F6FA" }}>{formatDate(quote.validUntil)}</span>
              </div>
            )}
            {quote.pdfUrl && (
              <div className="flex justify-between items-center">
                <span style={{ color: "#6B82A8" }}>PDF</span>
                <a href={quote.pdfUrl} target="_blank" rel="noopener" style={{ color: "#4B8EFF" }}>
                  <FileDown size={14} className="inline mr-1" />
                  Downloaden
                </a>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Lines */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-sm" style={{ color: "#F4F6FA" }}>Offerteregels</h2>
        </CardHeader>
        <CardBody className="!px-0 !pb-0">
          <Table>
            <Thead>
              <Tr>
                <Th>Omschrijving</Th>
                <Th>Aantal</Th>
                <Th>Eenheid</Th>
                <Th>Stukprijs</Th>
                <Th>BTW%</Th>
                <Th className="text-right">Totaal</Th>
              </Tr>
            </Thead>
            <Tbody>
              {quote.lines?.map((line) => (
                <Tr key={line.id}>
                  <Td>{line.description}</Td>
                  <Td>{line.quantity}</Td>
                  <Td>{line.unit}</Td>
                  <Td className="font-mono">{formatCurrency(line.unitPrice)}</Td>
                  <Td>{line.btwPercentage}%</Td>
                  <Td className="text-right font-mono font-semibold" style={{ color: "#4B8EFF" }}>
                    {formatCurrency(line.lineTotal)}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          {/* Totals */}
          <div className="px-6 py-4 flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: "#6B82A8" }}>Subtotaal</span>
                <span className="font-mono" style={{ color: "#F4F6FA" }}>{formatCurrency(quote.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "#6B82A8" }}>BTW ({quote.btwPercentage}%)</span>
                <span className="font-mono" style={{ color: "#F4F6FA" }}>{formatCurrency(quote.btwAmount)}</span>
              </div>
              <div
                className="flex justify-between text-base font-bold pt-2"
                style={{ borderTop: "1px solid #1E2130" }}
              >
                <span style={{ color: "#F4F6FA" }}>Totaal</span>
                <span className="font-mono" style={{ color: "#4B8EFF" }}>{formatCurrency(quote.total)}</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Notes */}
      {(quote.notes || quote.terms) && (
        <Card>
          <CardBody className="space-y-3 text-sm">
            {quote.notes && (
              <div>
                <p className="font-semibold mb-1" style={{ color: "#6B82A8" }}>Notities</p>
                <p style={{ color: "#F4F6FA" }}>{quote.notes}</p>
              </div>
            )}
            {quote.terms && (
              <div>
                <p className="font-semibold mb-1" style={{ color: "#6B82A8" }}>Betalingsvoorwaarden</p>
                <p style={{ color: "#F4F6FA" }}>{quote.terms}</p>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
