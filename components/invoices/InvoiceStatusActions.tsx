"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { markInvoicePaid, updateInvoiceStatus } from "@/lib/actions/invoices"
import type { Invoice } from "@/lib/db/schema"
import { CheckCircle, Send, XCircle } from "lucide-react"

interface InvoiceStatusActionsProps {
  invoice: Invoice
}

export function InvoiceStatusActions({ invoice }: InvoiceStatusActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function handleStatus(status: string) {
    setLoading(status)
    if (status === "paid") {
      await markInvoicePaid(invoice.id)
    } else {
      await updateInvoiceStatus(invoice.id, status)
    }
    router.refresh()
    setLoading(null)
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {invoice.status === "draft" && (
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleStatus("sent")}
          loading={loading === "sent"}
        >
          <Send size={14} />
          Verzenden
        </Button>
      )}
      {(invoice.status === "sent" || invoice.status === "overdue") && (
        <>
          <Button
            size="sm"
            style={{ background: "#0A2A1A", color: "#2DD68A", border: "none" }}
            onClick={() => handleStatus("paid")}
            loading={loading === "paid"}
          >
            <CheckCircle size={14} />
            Betaald markeren
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleStatus("cancelled")}
            loading={loading === "cancelled"}
          >
            <XCircle size={14} />
            Annuleren
          </Button>
        </>
      )}
    </div>
  )
}
