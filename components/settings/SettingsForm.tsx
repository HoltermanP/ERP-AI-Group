"use client"

import { useState } from "react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { upsertCompanyProfile } from "@/lib/actions/company"
import type { CompanyProfile } from "@/lib/db/schema"

interface SettingsFormProps {
  profile: CompanyProfile | null
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError("")

    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      address: (form.elements.namedItem("address") as HTMLInputElement).value || undefined,
      postalCode: (form.elements.namedItem("postalCode") as HTMLInputElement).value || undefined,
      city: (form.elements.namedItem("city") as HTMLInputElement).value || undefined,
      country: (form.elements.namedItem("country") as HTMLInputElement).value || "Nederland",
      kvk: (form.elements.namedItem("kvk") as HTMLInputElement).value || undefined,
      btw: (form.elements.namedItem("btw") as HTMLInputElement).value || undefined,
      iban: (form.elements.namedItem("iban") as HTMLInputElement).value || undefined,
      email: (form.elements.namedItem("email") as HTMLInputElement).value || undefined,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value || undefined,
      website: (form.elements.namedItem("website") as HTMLInputElement).value || "ai-group.nl",
    }

    if (!data.name) {
      setError("Bedrijfsnaam is verplicht")
      setLoading(false)
      return
    }

    const result = await upsertCompanyProfile(data)
    if (result.success) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
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
      {success && (
        <div
          className="px-4 py-3 rounded-md text-sm"
          style={{ background: "#0A2A1A", color: "#2DD68A", border: "1px solid #2DD68A20" }}
        >
          Instellingen opgeslagen
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input
            label="Bedrijfsnaam *"
            name="name"
            defaultValue={profile?.name || "AI-Group.nl"}
            required
          />
        </div>
        <Input
          label="E-mail"
          name="email"
          type="email"
          defaultValue={profile?.email || ""}
          placeholder="info@ai-group.nl"
        />
        <Input
          label="Telefoon"
          name="phone"
          defaultValue={profile?.phone || ""}
          placeholder="+31 6 12345678"
        />
        <div className="md:col-span-2">
          <Input
            label="Adres"
            name="address"
            defaultValue={profile?.address || ""}
            placeholder="Straatnaam 1"
          />
        </div>
        <Input
          label="Postcode"
          name="postalCode"
          defaultValue={profile?.postalCode || ""}
          placeholder="1234 AB"
        />
        <Input
          label="Stad"
          name="city"
          defaultValue={profile?.city || ""}
          placeholder="Amsterdam"
        />
        <Input
          label="Land"
          name="country"
          defaultValue={profile?.country || "Nederland"}
        />
        <Input
          label="Website"
          name="website"
          defaultValue={profile?.website || "ai-group.nl"}
          placeholder="ai-group.nl"
        />
        <Input
          label="KvK-nummer"
          name="kvk"
          defaultValue={profile?.kvk || ""}
          placeholder="12345678"
        />
        <Input
          label="BTW-nummer"
          name="btw"
          defaultValue={profile?.btw || ""}
          placeholder="NL123456789B01"
        />
        <div className="md:col-span-2">
          <Input
            label="IBAN"
            name="iban"
            defaultValue={profile?.iban || ""}
            placeholder="NL00BANK0123456789"
          />
        </div>
      </div>

      <div className="pt-2">
        <Button type="submit" loading={loading}>
          Instellingen opslaan
        </Button>
      </div>
    </form>
  )
}
