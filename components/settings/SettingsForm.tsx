"use client"

import { useState } from "react"
import { Input, Textarea } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { upsertCompanyProfile } from "@/lib/actions/company"
import type { CompanyProfile } from "@/lib/db/schema"
import {
  DEFAULT_QUOTE_EMAIL_SUBJECT,
  DEFAULT_QUOTE_EMAIL_BODY,
  DEFAULT_INVOICE_EMAIL_SUBJECT,
  DEFAULT_INVOICE_EMAIL_BODY,
  TEMPLATE_PLACEHOLDERS,
} from "@/lib/email/templates"

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
      logoUrl: (form.elements.namedItem("logoUrl") as HTMLInputElement).value || undefined,
      emailSignature: (form.elements.namedItem("emailSignature") as HTMLTextAreaElement).value || undefined,
      quoteEmailSubject: (form.elements.namedItem("quoteEmailSubject") as HTMLInputElement).value || undefined,
      quoteEmailBody: (form.elements.namedItem("quoteEmailBody") as HTMLTextAreaElement).value || undefined,
      invoiceEmailSubject: (form.elements.namedItem("invoiceEmailSubject") as HTMLInputElement).value || undefined,
      invoiceEmailBody: (form.elements.namedItem("invoiceEmailBody") as HTMLTextAreaElement).value || undefined,
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

      {/* E-mail & huisstijl */}
      <div className="pt-4 space-y-4" style={{ borderTop: "1px solid #1E2130" }}>
        <div>
          <h3 className="font-semibold text-sm" style={{ color: "#F4F6FA" }}>
            E-mail &amp; huisstijl
          </h3>
          <p className="mt-1 text-xs" style={{ color: "#6B82A8" }}>
            Standaardteksten voor het versturen van offertes en facturen per e-mail. Beschikbare
            placeholders:{" "}
            {TEMPLATE_PLACEHOLDERS.map((p) => `{{${p.key}}}`).join(", ")}
          </p>
        </div>

        <Input
          label="Logo-URL"
          name="logoUrl"
          type="url"
          defaultValue={profile?.logoUrl || ""}
          placeholder="https://ai-group.nl/logo.png"
          hint="Wordt bovenaan de e-mail getoond. Leeg laten voor het standaard AI-Group.nl tekstlogo."
        />

        <Textarea
          label="E-mailhandtekening"
          name="emailSignature"
          defaultValue={profile?.emailSignature || ""}
          placeholder={"Met vriendelijke groet,\n\nAI-Group.nl"}
          hint="Wordt onder elke e-mail geplaatst. Leeg laten voor een automatische handtekening op basis van uw bedrijfsgegevens."
        />

        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Onderwerp offerte-e-mail"
            name="quoteEmailSubject"
            defaultValue={profile?.quoteEmailSubject || ""}
            placeholder={DEFAULT_QUOTE_EMAIL_SUBJECT}
          />
          <Textarea
            label="Standaardtekst offerte-e-mail"
            name="quoteEmailBody"
            defaultValue={profile?.quoteEmailBody || ""}
            placeholder={DEFAULT_QUOTE_EMAIL_BODY}
            style={{ minHeight: "140px" }}
          />
          <Input
            label="Onderwerp factuur-e-mail"
            name="invoiceEmailSubject"
            defaultValue={profile?.invoiceEmailSubject || ""}
            placeholder={DEFAULT_INVOICE_EMAIL_SUBJECT}
          />
          <Textarea
            label="Standaardtekst factuur-e-mail"
            name="invoiceEmailBody"
            defaultValue={profile?.invoiceEmailBody || ""}
            placeholder={DEFAULT_INVOICE_EMAIL_BODY}
            style={{ minHeight: "140px" }}
          />
        </div>
        <p className="text-xs" style={{ color: "#6B82A8" }}>
          Lege velden gebruiken automatisch de standaardtekst (zoals getoond als voorbeeldtekst).
          Voor het verzenden per e-mail wordt de tekst per klant ingevuld en kan deze vóór verzending
          nog worden aangepast.
        </p>
      </div>

      <div className="pt-2">
        <Button type="submit" loading={loading}>
          Instellingen opslaan
        </Button>
      </div>
    </form>
  )
}
