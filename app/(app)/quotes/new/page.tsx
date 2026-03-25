import { QuoteForm } from "@/components/quotes/QuoteForm"

interface PageProps {
  searchParams: Promise<{ customerId?: string }>
}

export default async function NewQuotePage({ searchParams }: PageProps) {
  const { customerId } = await searchParams

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#F4F6FA" }}>Nieuwe offerte</h1>
        <p className="mt-1 text-sm" style={{ color: "#6B82A8" }}>Maak een nieuwe offerte aan</p>
      </div>
      <QuoteForm preselectedCustomerId={customerId ? parseInt(customerId) : undefined} />
    </div>
  )
}
