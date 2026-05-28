"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input, Textarea, Select } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { createCustomer, updateCustomer } from "@/lib/actions/customers"
import type { Customer } from "@/lib/db/schema"

interface CustomerFormProps {
  customer?: Customer
}

export function CustomerForm({ customer }: CustomerFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = e.currentTarget
    const data = {
      companyName: (form.elements.namedItem("companyName") as HTMLInputElement).value,
      contactName: (form.elements.namedItem("contactName") as HTMLInputElement).value || undefined,
      contactRole: (form.elements.namedItem("contactRole") as HTMLInputElement).value || undefined,
      email: (form.elements.namedItem("email") as HTMLInputElement).value || undefined,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value || undefined,
      sector: (form.elements.namedItem("sector") as HTMLInputElement).value || undefined,
      aiOpportunity: (form.elements.namedItem("aiOpportunity") as HTMLInputElement).value || undefined,
      leadStatus: (form.elements.namedItem("leadStatus") as HTMLSelectElement).value,
      leadSource: (form.elements.namedItem("leadSource") as HTMLInputElement).value || undefined,
      address: (form.elements.namedItem("address") as HTMLInputElement).value || undefined,
      postalCode: (form.elements.namedItem("postalCode") as HTMLInputElement).value || undefined,
      city: (form.elements.namedItem("city") as HTMLInputElement).value || undefined,
      country: (form.elements.namedItem("country") as HTMLInputElement).value || "Nederland",
      companySize: (form.elements.namedItem("companySize") as HTMLInputElement).value || undefined,
      budgetIndicator: (form.elements.namedItem("budgetIndicator") as HTMLSelectElement).value || undefined,
      timing: (form.elements.namedItem("timing") as HTMLSelectElement).value || undefined,
      competitorCheck: (form.elements.namedItem("competitorCheck") as HTMLInputElement).value || undefined,
      kvk: (form.elements.namedItem("kvk") as HTMLInputElement).value || undefined,
      btw: (form.elements.namedItem("btw") as HTMLInputElement).value || undefined,
      notes: (form.elements.namedItem("notes") as HTMLTextAreaElement).value || undefined,
      status: "active",
    }

    if (!data.companyName) {
      setError("Bedrijfsnaam is verplicht")
      setLoading(false)
      return
    }

    let result
    if (customer) {
      result = await updateCustomer(customer.id, data)
    } else {
      result = await createCustomer(data)
    }

    if (result.success) {
      router.push("/customers")
    } else {
      setError(result.error || "Er is een fout opgetreden")
    }
    setLoading(false)
  }

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input
            label="Bedrijfsnaam *"
            name="companyName"
            defaultValue={customer?.companyName}
            required
            placeholder="AI-Group.nl"
          />
        </div>
        <Input
          label="Contactpersoon"
          name="contactName"
          defaultValue={customer?.contactName || ""}
          placeholder="Jan de Vries"
        />
        <Input
          label="Rol / functie"
          name="contactRole"
          defaultValue={customer?.contactRole || ""}
          placeholder="Procurement Manager"
        />
        <Input
          label="E-mail"
          name="email"
          type="email"
          defaultValue={customer?.email || ""}
          placeholder="info@bedrijf.nl"
        />
        <Input
          label="Telefoon"
          name="phone"
          defaultValue={customer?.phone || ""}
          placeholder="+31 6 12345678"
        />
        <Input
          label="Sector"
          name="sector"
          defaultValue={customer?.sector || ""}
          placeholder="Energie, logistiek, bouw..."
        />
        <Input
          label="AI-opportuniteit"
          name="aiOpportunity"
          defaultValue={customer?.aiOpportunity || ""}
          placeholder="AI-chatbot, forecasting, document automation..."
        />
        <Select
          label="Leadstatus"
          name="leadStatus"
          defaultValue={customer?.leadStatus || "prospect"}
          options={[
            { value: "prospect", label: "Prospect" },
            { value: "conversation", label: "Conversation" },
            { value: "proposal", label: "Proposal" },
            { value: "customer", label: "Customer" },
          ]}
        />
        <Input
          label="Bron"
          name="leadSource"
          defaultValue={customer?.leadSource || ""}
          placeholder="LinkedIn, referral, event, cold outreach..."
        />
        <Input
          label="KvK-nummer"
          name="kvk"
          defaultValue={customer?.kvk || ""}
          placeholder="12345678"
        />
        <Input
          label="BTW-nummer"
          name="btw"
          defaultValue={customer?.btw || ""}
          placeholder="NL123456789B01"
        />
        <div className="md:col-span-2">
          <Input
            label="Adres"
            name="address"
            defaultValue={customer?.address || ""}
            placeholder="Straatnaam 1"
          />
        </div>
        <Input
          label="Postcode"
          name="postalCode"
          defaultValue={customer?.postalCode || ""}
          placeholder="1234 AB"
        />
        <Input
          label="Stad"
          name="city"
          defaultValue={customer?.city || ""}
          placeholder="Amsterdam"
        />
        <Input
          label="Land"
          name="country"
          defaultValue={customer?.country || "Nederland"}
          placeholder="Nederland"
        />
        <Input
          label="Bedrijfsgrootte"
          name="companySize"
          defaultValue={customer?.companySize || ""}
          placeholder="50 medewerkers / 10M omzet"
        />
        <Select
          label="Budget indicator"
          name="budgetIndicator"
          defaultValue={customer?.budgetIndicator || ""}
          options={[
            { value: "", label: "Onbekend" },
            { value: "low", label: "Laag" },
            { value: "medium", label: "Middel" },
            { value: "high", label: "Hoog" },
            { value: "approved", label: "Goedgekeurd budget" },
          ]}
        />
        <Select
          label="Timing"
          name="timing"
          defaultValue={customer?.timing || ""}
          options={[
            { value: "", label: "Onbekend" },
            { value: "immediate", label: "Immediate" },
            { value: "six_months", label: "Binnen 6 maanden" },
            { value: "future", label: "Future" },
          ]}
        />
        <Input
          label="Competitor check"
          name="competitorCheck"
          defaultValue={customer?.competitorCheck || ""}
          placeholder="Alternatieven die ze overwegen"
        />
        <div className="md:col-span-2">
          <Textarea
            label="Notities"
            name="notes"
            defaultValue={customer?.notes || ""}
            placeholder="Interne notities over deze klant..."
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {customer ? "Klant opslaan" : "Klant aanmaken"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Annuleren
        </Button>
      </div>
    </form>
  )
}
