import { notFound } from "next/navigation"
import Link from "next/link"
import { getInvoice } from "@/lib/actions/invoices"
import { getCompanyProfile } from "@/lib/actions/company"
import { buildInvoiceEmailDraft } from "@/lib/email/templates"
import { isSmtpConfigured } from "@/lib/email/mailer"
import { SendEmailModal } from "@/components/email/SendEmailModal"
import { Card, CardHeader, CardBody } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { formatCurrency, formatDate } from "@/lib/utils/formatters"
import { Pencil, FileDown } from "lucide-react"
import { InvoiceStatusActions } from "@/components/invoices/InvoiceStatusActions"
import { PDFDownloadButton } from "@/components/pdf/PDFDownloadButton"
import { Table, Thead, Tbody, Th, Tr, Td } from "@/components/ui/Table"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { id } = await params
  const invoice = await getInvoice(parseInt(id))
  if (!invoice) notFound()

  const company = await getCompanyProfile()
  const emailDraft = buildInvoiceEmailDraft(invoice, company)
  const smtpConfigured = isSmtpConfigured()

  const now = new Date()
  const isOverdue =
    invoice.status === "sent" &&
    invoice.dueDate &&
    new Date(invoice.dueDate) < now

  const displayStatus = isOverdue ? "overdue" : (invoice.status || "draft")

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono" style={{ color: "#F4F6FA" }}>
              {invoice.invoiceNumber}
            </h1>
            <Badge status={displayStatus} />
          </div>
          <p className="mt-1 text-sm" style={{ color: "#6B82A8" }}>{invoice.title}</p>
          {invoice.paidAt && (
            <p className="mt-1 text-sm" style={{ color: "#2DD68A" }}>
              Betaald op {formatDate(invoice.paidAt)}
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <SendEmailModal
            kind="invoice"
            documentId={invoice.id}
            attachmentName={`${invoice.invoiceNumber}.pdf`}
            defaultTo={emailDraft.to}
            defaultSubject={emailDraft.subject}
            defaultBody={emailDraft.body}
            smtpConfigured={smtpConfigured}
          />
          <PDFDownloadButton href={`/api/pdf/invoice/${invoice.id}`} label="PDF" />
          <Link href={`/invoices/${invoice.id}/edit`}>
            <Button variant="secondary" size="sm">
              <Pencil size={14} />
              Bewerken
            </Button>
          </Link>
          <InvoiceStatusActions invoice={{ ...invoice, status: displayStatus }} />
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-sm" style={{ color: "#F4F6FA" }}>Klantgegevens</h2>
          </CardHeader>
          <CardBody className="space-y-1 text-sm">
            <p className="font-semibold" style={{ color: "#F4F6FA" }}>{invoice.customer?.companyName}</p>
            {invoice.customer?.contactName && (
              <p style={{ color: "#6B82A8" }}>{invoice.customer.contactName}</p>
            )}
            {invoice.customer?.address && <p style={{ color: "#6B82A8" }}>{invoice.customer.address}</p>}
            {(invoice.customer?.postalCode || invoice.customer?.city) && (
              <p style={{ color: "#6B82A8" }}>
                {invoice.customer.postalCode} {invoice.customer.city}
              </p>
            )}
            {invoice.customer?.email && <p style={{ color: "#4B8EFF" }}>{invoice.customer.email}</p>}
            {invoice.customer?.btw && <p style={{ color: "#6B82A8" }}>BTW: {invoice.customer.btw}</p>}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-sm" style={{ color: "#F4F6FA" }}>Factuur details</h2>
          </CardHeader>
          <CardBody className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span style={{ color: "#6B82A8" }}>Factuurdatum</span>
              <span style={{ color: "#F4F6FA" }}>{formatDate(invoice.invoiceDate)}</span>
            </div>
            {invoice.dueDate && (
              <div className="flex justify-between">
                <span style={{ color: "#6B82A8" }}>Vervaldatum</span>
                <span style={{ color: isOverdue ? "#FF4D1C" : "#F4F6FA" }}>
                  {formatDate(invoice.dueDate)}
                </span>
              </div>
            )}
            {invoice.quote && (
              <div className="flex justify-between">
                <span style={{ color: "#6B82A8" }}>Offerte</span>
                <Link href={`/quotes/${invoice.quoteId}`} style={{ color: "#4B8EFF" }}>
                  {invoice.quote.quoteNumber}
                </Link>
              </div>
            )}
            {invoice.pdfUrl && (
              <div className="flex justify-between items-center">
                <span style={{ color: "#6B82A8" }}>PDF</span>
                <a href={invoice.pdfUrl} target="_blank" rel="noopener" style={{ color: "#4B8EFF" }}>
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
          <h2 className="font-semibold text-sm" style={{ color: "#F4F6FA" }}>Factuurregels</h2>
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
              {invoice.lines?.map((line) => (
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
                <span className="font-mono" style={{ color: "#F4F6FA" }}>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "#6B82A8" }}>BTW ({invoice.btwPercentage}%)</span>
                <span className="font-mono" style={{ color: "#F4F6FA" }}>{formatCurrency(invoice.btwAmount)}</span>
              </div>
              <div
                className="flex justify-between text-base font-bold pt-2"
                style={{ borderTop: "1px solid #1E2130" }}
              >
                <span style={{ color: "#F4F6FA" }}>Totaal</span>
                <span className="font-mono" style={{ color: "#4B8EFF" }}>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Terms */}
      {(invoice.notes || invoice.terms) && (
        <Card>
          <CardBody className="space-y-3 text-sm">
            {invoice.notes && (
              <div>
                <p className="font-semibold mb-1" style={{ color: "#6B82A8" }}>Notities</p>
                <p style={{ color: "#F4F6FA" }}>{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <p className="font-semibold mb-1" style={{ color: "#6B82A8" }}>Betalingsvoorwaarden</p>
                <p style={{ color: "#F4F6FA" }}>{invoice.terms}</p>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
