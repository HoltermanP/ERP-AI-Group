import type { CompanyProfile, Customer, Invoice, Quote } from "@/lib/db/schema"
import { INVOICE_PAYMENT_TERM_DAYS } from "@/lib/constants/invoicing"

/**
 * Beschikbare placeholders voor e-mailtemplates (beheer via Instellingen).
 * Gebruik in onderwerp en tekst: {{placeholder}}.
 */
export const TEMPLATE_PLACEHOLDERS = [
  { key: "contactpersoon", label: "Naam contactpersoon van de klant" },
  { key: "klant", label: "Bedrijfsnaam van de klant" },
  { key: "nummer", label: "Offerte- of factuurnummer" },
  { key: "titel", label: "Titel van de offerte/factuur" },
  { key: "totaal", label: "Totaalbedrag incl. BTW" },
  { key: "subtotaal", label: "Totaalbedrag excl. BTW" },
  { key: "geldig_tot", label: "Geldigheidsdatum (offerte)" },
  { key: "factuurdatum", label: "Factuurdatum (factuur)" },
  { key: "vervaldatum", label: "Vervaldatum (factuur)" },
  { key: "betalingstermijn", label: "Betalingstermijn in dagen" },
  { key: "bedrijf", label: "Uw eigen bedrijfsnaam" },
] as const

export const DEFAULT_QUOTE_EMAIL_SUBJECT = "Offerte {{nummer}} – {{titel}}"

export const DEFAULT_QUOTE_EMAIL_BODY = `Beste {{contactpersoon}},

Hartelijk dank voor uw interesse in {{bedrijf}}. In de bijlage vindt u offerte {{nummer}} ({{titel}}) met een totaalbedrag van {{totaal}} incl. BTW.

De offerte is geldig tot {{geldig_tot}}. Heeft u vragen of wilt u de offerte bespreken? Neem gerust contact met ons op — we denken graag met u mee.`

export const DEFAULT_INVOICE_EMAIL_SUBJECT = "Factuur {{nummer}} – {{bedrijf}}"

export const DEFAULT_INVOICE_EMAIL_BODY = `Beste {{contactpersoon}},

In de bijlage vindt u factuur {{nummer}} ({{titel}}) met een totaalbedrag van {{totaal}} incl. BTW.

Wij verzoeken u vriendelijk het bedrag uiterlijk op {{vervaldatum}} te voldoen onder vermelding van het factuurnummer. De betalingstermijn is {{betalingstermijn}} dagen na factuurdatum.`

function fmtCurrency(val: number | string | null | undefined): string {
  const n = typeof val === "string" ? parseFloat(val) : (val ?? 0)
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(n || 0)
}

function fmtDate(val: Date | string | null | undefined): string {
  if (!val) return "-"
  const d = typeof val === "string" ? new Date(val) : val
  if (isNaN(d.getTime())) return "-"
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(d)
}

export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*([a-zA-Z_]+)\s*\}\}/g, (match, key: string) => {
    const value = vars[key.toLowerCase()]
    return value !== undefined ? value : match
  })
}

function baseVars(customer: Customer | null | undefined, company: CompanyProfile | null): Record<string, string> {
  return {
    contactpersoon: customer?.contactName?.trim() || customer?.companyName?.trim() || "relatie",
    klant: customer?.companyName?.trim() || "",
    bedrijf: company?.name?.trim() || "AI-Group.nl",
    betalingstermijn: String(INVOICE_PAYMENT_TERM_DAYS),
  }
}

export function buildQuoteEmailVars(
  quote: Quote & { customer?: Customer | null },
  company: CompanyProfile | null
): Record<string, string> {
  return {
    ...baseVars(quote.customer, company),
    nummer: quote.quoteNumber,
    titel: quote.title,
    totaal: fmtCurrency(quote.total),
    subtotaal: fmtCurrency(quote.subtotal),
    geldig_tot: quote.validUntil ? fmtDate(quote.validUntil) : "14 dagen na dagtekening",
  }
}

export function buildInvoiceEmailVars(
  invoice: Invoice & { customer?: Customer | null },
  company: CompanyProfile | null
): Record<string, string> {
  return {
    ...baseVars(invoice.customer, company),
    nummer: invoice.invoiceNumber,
    titel: invoice.title,
    totaal: fmtCurrency(invoice.total),
    subtotaal: fmtCurrency(invoice.subtotal),
    factuurdatum: fmtDate(invoice.invoiceDate),
    vervaldatum: invoice.dueDate
      ? fmtDate(invoice.dueDate)
      : `${INVOICE_PAYMENT_TERM_DAYS} dagen na factuurdatum`,
  }
}

export function buildDefaultSignature(company: CompanyProfile | null): string {
  const lines = [
    "Met vriendelijke groet,",
    "",
    company?.name?.trim() || "AI-Group.nl",
  ]
  if (company?.phone?.trim()) lines.push(company.phone.trim())
  if (company?.email?.trim()) lines.push(company.email.trim())
  lines.push(company?.website?.trim() || "ai-group.nl")
  return lines.join("\n")
}

export interface EmailDraft {
  to: string
  subject: string
  body: string
}

export function buildQuoteEmailDraft(
  quote: Quote & { customer?: Customer | null },
  company: CompanyProfile | null
): EmailDraft {
  const vars = buildQuoteEmailVars(quote, company)
  return {
    to: quote.customer?.email?.trim() || "",
    subject: renderTemplate(company?.quoteEmailSubject?.trim() || DEFAULT_QUOTE_EMAIL_SUBJECT, vars),
    body: renderTemplate(company?.quoteEmailBody?.trim() || DEFAULT_QUOTE_EMAIL_BODY, vars),
  }
}

export function buildInvoiceEmailDraft(
  invoice: Invoice & { customer?: Customer | null },
  company: CompanyProfile | null
): EmailDraft {
  const vars = buildInvoiceEmailVars(invoice, company)
  return {
    to: invoice.customer?.email?.trim() || "",
    subject: renderTemplate(company?.invoiceEmailSubject?.trim() || DEFAULT_INVOICE_EMAIL_SUBJECT, vars),
    body: renderTemplate(company?.invoiceEmailBody?.trim() || DEFAULT_INVOICE_EMAIL_BODY, vars),
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function textToHtmlParagraphs(text: string): string {
  return text
    .split(/\n{2,}/)
    .map(
      (par) =>
        `<p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#0D1428;">${escapeHtml(par).replace(/\n/g, "<br />")}</p>`
    )
    .join("")
}

/**
 * Bouwt de volledige e-mail in huisstijl (tabel-layout voor brede mailclient-
 * ondersteuning): logo, blauwe accentlijn, tekst, handtekening en footer.
 */
export function buildEmailHtml(options: {
  bodyText: string
  company: CompanyProfile | null
  subject: string
}): string {
  const { bodyText, company, subject } = options
  const signatureText = company?.emailSignature?.trim() || buildDefaultSignature(company)

  const logoHtml = company?.logoUrl?.trim()
    ? `<img src="${escapeHtml(company.logoUrl.trim())}" alt="${escapeHtml(company?.name || "AI-Group.nl")}" style="max-height:48px;max-width:220px;display:block;" />`
    : `<span style="font-size:24px;font-weight:bold;font-family:Helvetica,Arial,sans-serif;"><span style="color:#2D6FE8;">AI</span><span style="color:#0D1428;">-Group.nl</span></span>`

  const footerParts = [
    company?.name?.trim(),
    [company?.address?.trim(), [company?.postalCode?.trim(), company?.city?.trim()].filter(Boolean).join(" ")]
      .filter(Boolean)
      .join(", "),
    company?.kvk?.trim() ? `KvK ${company.kvk.trim()}` : null,
    company?.btw?.trim() ? `BTW ${company.btw.trim()}` : null,
    company?.iban?.trim() ? `IBAN ${company.iban.trim()}` : null,
  ].filter(Boolean)

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F6FA;font-family:Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6FA;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:32px 40px 20px 40px;">
              ${logoHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px;">
              <div style="height:2px;background-color:#2D6FE8;"></div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 40px 8px 40px;">
              ${textToHtmlParagraphs(bodyText)}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 40px 32px 40px;">
              <p style="margin:0;font-size:14px;line-height:1.6;color:#0D1428;">${escapeHtml(signatureText).replace(/\n/g, "<br />")}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;background-color:#F8FAFF;border-top:1px solid #E0E6F0;">
              <p style="margin:0;font-size:11px;line-height:1.6;color:#6B82A8;">${footerParts.map((p) => escapeHtml(String(p))).join(" &middot; ")}</p>
              <p style="margin:6px 0 0 0;font-size:11px;letter-spacing:0.5px;color:#B0BAC9;">AI-FIRST &middot; WE SHIP FAST &middot; ${escapeHtml(company?.website?.trim() || "ai-group.nl")}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/** Platte-tekstversie van de mail (fallback voor mailclients zonder HTML). */
export function buildEmailText(bodyText: string, company: CompanyProfile | null): string {
  const signatureText = company?.emailSignature?.trim() || buildDefaultSignature(company)
  return `${bodyText}\n\n${signatureText}`
}
