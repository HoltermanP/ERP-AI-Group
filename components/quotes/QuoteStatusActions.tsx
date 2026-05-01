"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { Input } from "@/components/ui/Input"
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
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)
  const [installmentMode, setInstallmentMode] = useState<"full" | "installments">("full")
  const [installmentCount, setInstallmentCount] = useState(2)
  const [invoiceError, setInvoiceError] = useState<string | null>(null)

  async function handleStatus(status: string) {
    setLoading(status)
    await updateQuoteStatus(quote.id, status)
    router.refresh()
    setLoading(null)
  }

  async function handleCreateInvoice() {
    if (!quote.customerId) return
    setInvoiceError(null)
    setLoading("invoice")
    const count = installmentMode === "full" ? 1 : Math.min(12, Math.max(2, installmentCount))
    const result = await createInvoiceFromQuote(quote.id, quote.customerId, {
      installmentCount: count,
    })
    if (result.success && result.data) {
      setInvoiceModalOpen(false)
      if (result.invoices && result.invoices.length > 1) {
        router.push("/invoices")
      } else {
        router.push(`/invoices/${result.data.id}`)
      }
      router.refresh()
    } else {
      setInvoiceError(result.success === false ? result.error : "Onbekende fout")
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
        <>
          <Button
            variant="cta"
            size="sm"
            onClick={() => setInvoiceModalOpen(true)}
            loading={loading === "invoice"}
            disabled={!quote.customerId}
          >
            <Receipt size={14} />
            Maak factuur
          </Button>
          {!quote.customerId && (
            <span className="text-xs self-center" style={{ color: "#FF6B6B" }}>
              Koppel eerst een klant aan deze offerte.
            </span>
          )}
        </>
      )}

      <Modal
        isOpen={invoiceModalOpen}
        onClose={() => !loading && setInvoiceModalOpen(false)}
        title="Factuur vanuit offerte"
        size="md"
      >
        <div className="space-y-4 text-sm" style={{ color: "#F4F6FA" }}>
          <p style={{ color: "#6B82A8" }}>
            Kies of u het volledige offertebedrag op één factuur zet, of het in gelijke deeltermijnen verdeelt (elk
            met eigen factuurnummer).
          </p>

          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="inv-mode"
                checked={installmentMode === "full"}
                onChange={() => setInstallmentMode("full")}
                className="accent-[#2D6FE8]"
              />
              Volledig bedrag op één factuur
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="inv-mode"
                checked={installmentMode === "installments"}
                onChange={() => setInstallmentMode("installments")}
                className="accent-[#2D6FE8]"
              />
              Deeltermijnen (gelijk verdeeld over het totaal excl. BTW)
            </label>
          </div>

          {installmentMode === "installments" && (
            <Input
              label="Aantal termijnen"
              type="number"
              min={2}
              max={12}
              value={String(installmentCount)}
              onChange={(e) => setInstallmentCount(parseInt(e.target.value, 10) || 2)}
            />
          )}

          {invoiceError && (
            <p className="text-sm" style={{ color: "#FF6B6B" }}>
              {invoiceError}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="cta" size="sm" onClick={handleCreateInvoice} loading={loading === "invoice"}>
              Factuur aanmaken
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setInvoiceModalOpen(false)} disabled={!!loading}>
              Annuleren
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
