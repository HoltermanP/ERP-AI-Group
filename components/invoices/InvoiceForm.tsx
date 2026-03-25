"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input, Textarea, Select } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardBody } from "@/components/ui/Card"
import { QuoteLineEditor, type LineItem } from "@/components/quotes/QuoteLineEditor"
import { createInvoice, updateInvoice } from "@/lib/actions/invoices"
import { getCustomers } from "@/lib/actions/customers"
import type { Invoice, InvoiceLine, Customer } from "@/lib/db/schema"

interface InvoiceFormProps {
  invoice?: Invoice & { lines?: InvoiceLine[] }
  preselectedCustomerId?: number
}

export function InvoiceForm({ invoice, preselectedCustomerId }: InvoiceFormProps) {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [lines, setLines] = useState<LineItem[]>([])

  useEffect(() => {
    getCustomers().then(setCustomers)
  }, [])

  const initialLines: LineItem[] = invoice?.lines?.map((l) => ({
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
    const invoiceDate = (form.elements.namedItem("invoiceDate") as HTMLInputElement).value
    const dueDate = (form.elements.namedItem("dueDate") as HTMLInputElement).value
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
    if (invoice) {
      result = await updateInvoice(invoice.id, { customerId, title, status, invoiceDate, dueDate, notes, terms }, lineData)
    } else {
      result = await createInvoice(
        { customerId, title, status, invoiceDate, dueDate: dueDate || undefined, notes, terms },
        lineData
      )
    }

    if (result.success) {
      router.push(`/invoices/${result.data?.id}`)
    } else {
      setError(result.error || "Er is een fout opgetreden")
    }
    setLoading(false)
  }

  const today = new Date().toISOString().split("T")[0]
  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const customerOptions = customers.map((c) => ({ value: String(c.id), label: c.companyName }))
  const statusOptions = [
    { value: "draft", label: "Concept" },
    { value: "sent", label: "Verzonden" },
    { value: "paid", label: "Betaald" },
    { value: "overdue", label: "Verlopen" },
    { value: "cancelled", label: "Geannuleerd" },
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
          <h2 className="font-semibold text-sm" style={{ color: "#F4F6FA" }}>Factuur details</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Titel *"
                name="title"
                defaultValue={invoice?.title}
                placeholder="Factuur voor AI-implementatie"
                required
              />
            </div>
            <Select
              label="Klant *"
              name="customerId"
              defaultValue={String(invoice?.customerId || preselectedCustomerId || "")}
              options={[{ value: "", label: "Selecteer klant..." }, ...customerOptions]}
            />
            <Select
              label="Status"
              name="status"
              defaultValue={invoice?.status || "draft"}
              options={statusOptions}
            />
            <Input
              label="Factuurdatum"
              name="invoiceDate"
              type="date"
              defaultValue={invoice?.invoiceDate || today}
            />
            <Input
              label="Vervaldatum"
              name="dueDate"
              type="date"
              defaultValue={invoice?.dueDate || in30Days}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-sm" style={{ color: "#F4F6FA" }}>Factuurregels</h2>
        </CardHeader>
        <CardBody>
          <QuoteLineEditor
            initialLines={initialLines}
            onChange={(l) => setLines(l)}
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
            defaultValue={invoice?.notes || ""}
            placeholder="Bijzondere opmerkingen..."
          />
          <Textarea
            label="Betalingsvoorwaarden"
            name="terms"
            defaultValue={invoice?.terms || "Betaling binnen 30 dagen na factuurdatum."}
          />
        </CardBody>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" loading={loading}>
          {invoice ? "Factuur opslaan" : "Factuur aanmaken"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Annuleren
        </Button>
      </div>
    </form>
  )
}
