"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { updateQuoteStatus } from "@/lib/actions/quotes"
import { createInvoiceFromQuote } from "@/lib/actions/invoices"
import type { Quote } from "@/lib/db/schema"
import { Send, Check, X, Receipt } from "lucide-react"

interface QuoteStatusActionsProps {
  quote: Quote
}

export function QuoteStatusActions({ quote }: QuoteStatusActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function handleStatus(status: string) {
    setLoading(status)
    await updateQuoteStatus(quote.id, status)
    router.refresh()
    setLoading(null)
  }

  async function handleCreateInvoice() {
    setLoading("invoice")
    const result = await createInvoiceFromQuote(quote.id, quote.customerId!)
    if (result.success && result.data) {
      router.push(`/invoices/${result.data.id}`)
    }
    setLoading(null)
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {quote.status === "draft" && (
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleStatus("sent")}
          loading={loading === "sent"}
        >
          <Send size={14} />
          Verzonden
        </Button>
      )}
      {quote.status === "sent" && (
        <>
          <Button
            variant="primary"
            size="sm"
            style={{ background: "#0A2A1A", color: "#2DD68A" }}
            onClick={() => handleStatus("accepted")}
            loading={loading === "accepted"}
          >
            <Check size={14} />
            Geaccepteerd
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleStatus("rejected")}
            loading={loading === "rejected"}
          >
            <X size={14} />
            Afgewezen
          </Button>
        </>
      )}
      {quote.status === "accepted" && (
        <Button
          variant="cta"
          size="sm"
          onClick={handleCreateInvoice}
          loading={loading === "invoice"}
        >
          <Receipt size={14} />
          Maak factuur
        </Button>
      )}
    </div>
  )
}
