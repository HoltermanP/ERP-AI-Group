"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input, Textarea, Select } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardBody } from "@/components/ui/Card"
import { QuoteLineEditor, type LineItem } from "./QuoteLineEditor"
import { createQuote, updateQuote } from "@/lib/actions/quotes"
import { getCustomers } from "@/lib/actions/customers"
import type { Quote, QuoteLine, Customer } from "@/lib/db/schema"

interface QuoteFormProps {
  quote?: Quote & { lines?: QuoteLine[] }
  preselectedCustomerId?: number
}

export function QuoteForm({ quote, preselectedCustomerId }: QuoteFormProps) {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [lines, setLines] = useState<LineItem[]>([])
  const [totals, setTotals] = useState({ subtotal: 0, btwAmount: 0, total: 0 })

  useEffect(() => {
    getCustomers().then(setCustomers)
  }, [])

  const initialLines: LineItem[] = quote?.lines?.map((l) => ({
    id: l.id,
    description: l.description,
    quantity: l.quantity || "1",
    unit: l.unit || "stuks",
    unitPrice: l.unitPrice || "0",
    btwPercentage: l.btwPercentage || "21",
  })) || []

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = e.currentTarget
    const customerId = parseInt((form.elements.namedItem("customerId") as HTMLSelectElement).value)
    const title = (form.elements.namedItem("title") as HTMLInputElement).value
    const status = (form.elements.namedItem("status") as HTMLSelectElement).value
    const validUntil = (form.elements.namedItem("validUntil") as HTMLInputElement).value
    const notes = (form.elements.namedItem("notes") as HTMLTextAreaElement).value
    const terms = (form.elements.namedItem("terms") as HTMLTextAreaElement).value

    if (!title || !customerId) {
      setError("Klant en titel zijn verplicht")
      setLoading(false)
      return
    }

    const lineData = lines.map((l) => ({
      description: l.description,
      quantity: l.quantity,
      unit: l.unit,
      unitPrice: l.unitPrice,
      btwPercentage: l.btwPercentage,
    }))

    let result
    if (quote) {
      result = await updateQuote(quote.id, { customerId, title, status, validUntil: validUntil || null, notes, terms }, lineData)
    } else {
      result = await createQuote(
        { customerId, title, status, validUntil: validUntil || undefined, notes, terms },
        lineData
      )
    }

    if (result.success) {
      router.push(`/quotes/${result.data?.id}`)
    } else {
      setError(result.error || "Er is een fout opgetreden")
    }
    setLoading(false)
  }

  const customerOptions = customers.map((c) => ({ value: String(c.id), label: c.companyName }))
  const statusOptions = [
    { value: "draft", label: "Concept" },
    { value: "sent", label: "Verzonden" },
    { value: "accepted", label: "Geaccepteerd" },
    { value: "rejected", label: "Afgewezen" },
    { value: "expired", label: "Vervallen" },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div
          className="px-4 py-3 rounded-md text-sm"
          style={{ background: "#2A1010", color: "#FF6B6B", border: "1px solid #FF6B6B20" }}
        >
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-sm" style={{ color: "#F4F6FA" }}>Offerte details</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Titel *"
                name="title"
                defaultValue={quote?.title}
                placeholder="Voorstel voor AI-implementatie"
                required
              />
            </div>
            <Select
              label="Klant *"
              name="customerId"
              defaultValue={String(quote?.customerId || preselectedCustomerId || "")}
              options={[{ value: "", label: "Selecteer klant..." }, ...customerOptions]}
            />
            <Select
              label="Status"
              name="status"
              defaultValue={quote?.status || "draft"}
              options={statusOptions}
            />
            <Input
              label="Geldig tot"
              name="validUntil"
              type="date"
              defaultValue={quote?.validUntil || ""}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-sm" style={{ color: "#F4F6FA" }}>Offerteregels</h2>
        </CardHeader>
        <CardBody>
          <QuoteLineEditor
            initialLines={initialLines}
            onChange={(l, t) => {
              setLines(l)
              setTotals(t)
            }}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-sm" style={{ color: "#F4F6FA" }}>Notities & Voorwaarden</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <Textarea
            label="Notities"
            name="notes"
            defaultValue={quote?.notes || ""}
            placeholder="Bijzondere afspraken of opmerkingen..."
          />
          <Textarea
            label="Betalingsvoorwaarden"
            name="terms"
            defaultValue={quote?.terms || ""}
            placeholder="Betaling binnen 30 dagen na acceptatie."
          />
        </CardBody>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" loading={loading}>
          {quote ? "Offerte opslaan" : "Offerte aanmaken"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Annuleren
        </Button>
      </div>
    </form>
  )
}
