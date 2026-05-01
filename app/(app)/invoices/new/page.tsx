import { InvoiceForm } from "@/components/invoices/InvoiceForm"
import { getCompanyProfile } from "@/lib/actions/company"
import { buildDefaultInvoiceTerms } from "@/lib/invoice-terms"

interface PageProps {
  searchParams: Promise<{ customerId?: string; quoteId?: string }>
}

export default async function NewInvoicePage({ searchParams }: PageProps) {
  const { customerId } = await searchParams
  const company = await getCompanyProfile()
  const defaultPaymentTerms = buildDefaultInvoiceTerms(company)

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#F4F6FA" }}>Nieuwe factuur</h1>
        <p className="mt-1 text-sm" style={{ color: "#6B82A8" }}>Maak een nieuwe factuur aan</p>
      </div>
      <InvoiceForm
        preselectedCustomerId={customerId ? parseInt(customerId) : undefined}
        defaultPaymentTerms={defaultPaymentTerms}
      />
    </div>
  )
}
