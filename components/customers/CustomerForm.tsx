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
      email: (form.elements.namedItem("email") as HTMLInputElement).value || undefined,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value || undefined,
      address: (form.elements.namedItem("address") as HTMLInputElement).value || undefined,
      postalCode: (form.elements.namedItem("postalCode") as HTMLInputElement).value || undefined,
      city: (form.elements.namedItem("city") as HTMLInputElement).value || undefined,
      country: (form.elements.namedItem("country") as HTMLInputElement).value || "Nederland",
      kvk: (form.elements.namedItem("kvk") as HTMLInputElement).value || undefined,
      btw: (form.elements.namedItem("btw") as HTMLInputElement).value || undefined,
      notes: (form.elements.namedItem("notes") as HTMLTextAreaElement).value || undefined,
      status: (form.elements.namedItem("status") as HTMLSelectElement).value,
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
        <Select
          label="Status"
          name="status"
          defaultValue={customer?.status || "active"}
          options={[
            { value: "active", label: "Actief" },
            { value: "inactive", label: "Inactief" },
          ]}
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
