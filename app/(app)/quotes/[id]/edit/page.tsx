import { notFound } from "next/navigation"
import { getQuote } from "@/lib/actions/quotes"
import { QuoteForm } from "@/components/quotes/QuoteForm"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditQuotePage({ params }: PageProps) {
  const { id } = await params
  const quote = await getQuote(parseInt(id))
  if (!quote) notFound()

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#F4F6FA" }}>
          {quote.quoteNumber} bewerken
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#6B82A8" }}>{quote.title}</p>
      </div>
      <QuoteForm quote={quote} />
    </div>
  )
}
