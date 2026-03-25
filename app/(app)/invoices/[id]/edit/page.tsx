import { notFound } from "next/navigation"
import { getInvoice } from "@/lib/actions/invoices"
import { InvoiceForm } from "@/components/invoices/InvoiceForm"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditInvoicePage({ params }: PageProps) {
  const { id } = await params
  const invoice = await getInvoice(parseInt(id))
  if (!invoice) notFound()

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#F4F6FA" }}>
          {invoice.invoiceNumber} bewerken
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#6B82A8" }}>{invoice.title}</p>
      </div>
      <InvoiceForm invoice={invoice} />
    </div>
  )
}
