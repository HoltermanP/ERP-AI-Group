"use server"

import React from "react"
import { renderToBuffer } from "@react-pdf/renderer"
import { db } from "@/lib/db"
import { customerContacts } from "@/lib/db/schema"
import { revalidatePath } from "next/cache"
import { getQuote, updateQuoteStatus } from "@/lib/actions/quotes"
import { getInvoice, updateInvoiceStatus } from "@/lib/actions/invoices"
import { getCompanyProfile } from "@/lib/actions/company"
import { QuotePDF } from "@/components/pdf/QuotePDF"
import { InvoicePDF } from "@/components/pdf/InvoicePDF"
import { sendMail } from "@/lib/email/mailer"
import { buildEmailHtml, buildEmailText } from "@/lib/email/templates"

export interface SendDocumentEmailInput {
  to: string
  subject: string
  body: string
}

type SendResult = { success: true } | { success: false; error: string }

function validateInput(input: SendDocumentEmailInput): string | null {
  const to = input.to.trim()
  if (!to) return "Vul een e-mailadres van de ontvanger in."
  const addresses = to.split(/[,;]/).map((a) => a.trim()).filter(Boolean)
  if (addresses.some((a) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a))) {
    return "Eén of meer e-mailadressen zijn ongeldig."
  }
  if (!input.subject.trim()) return "Vul een onderwerp in."
  if (!input.body.trim()) return "Vul een e-mailtekst in."
  return null
}

async function logEmailContact(
  customerId: number | null | undefined,
  subject: string,
  content: string
) {
  if (!customerId) return
  try {
    await db.insert(customerContacts).values({
      customerId,
      type: "email",
      subject,
      content,
      createdBy: "ERP (automatisch)",
    })
  } catch (error) {
    // Loggen in het CRM mag het verzenden nooit blokkeren.
    console.error("Kon e-mailcontact niet loggen:", error)
  }
}

export async function sendQuoteEmail(
  quoteId: number,
  input: SendDocumentEmailInput
): Promise<SendResult> {
  const validationError = validateInput(input)
  if (validationError) return { success: false, error: validationError }

  try {
    const [quote, company] = await Promise.all([getQuote(quoteId), getCompanyProfile()])
    if (!quote) return { success: false, error: "Offerte niet gevonden" }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = React.createElement(QuotePDF, { quote, company }) as any
    const pdfBuffer = await renderToBuffer(element)

    await sendMail({
      to: input.to.trim(),
      subject: input.subject.trim(),
      html: buildEmailHtml({ bodyText: input.body, company, subject: input.subject.trim() }),
      text: buildEmailText(input.body, company),
      fromName: company?.name?.trim() || "AI-Group.nl",
      attachments: [
        {
          filename: `${quote.quoteNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    })

    if (quote.status === "draft") {
      await updateQuoteStatus(quoteId, "sent")
    }
    await logEmailContact(
      quote.customerId,
      `Offerte ${quote.quoteNumber} verzonden per e-mail`,
      `Aan: ${input.to.trim()}\nOnderwerp: ${input.subject.trim()}\n\n${input.body.trim()}`
    )

    revalidatePath(`/quotes/${quoteId}`)
    revalidatePath("/quotes")
    return { success: true }
  } catch (error) {
    console.error("Error sending quote email:", error)
    const message = error instanceof Error ? error.message : "Onbekende fout"
    return { success: false, error: `Kon offerte niet verzenden: ${message}` }
  }
}

export async function sendInvoiceEmail(
  invoiceId: number,
  input: SendDocumentEmailInput
): Promise<SendResult> {
  const validationError = validateInput(input)
  if (validationError) return { success: false, error: validationError }

  try {
    const [invoice, company] = await Promise.all([getInvoice(invoiceId), getCompanyProfile()])
    if (!invoice) return { success: false, error: "Factuur niet gevonden" }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = React.createElement(InvoicePDF, { invoice, company }) as any
    const pdfBuffer = await renderToBuffer(element)

    await sendMail({
      to: input.to.trim(),
      subject: input.subject.trim(),
      html: buildEmailHtml({ bodyText: input.body, company, subject: input.subject.trim() }),
      text: buildEmailText(input.body, company),
      fromName: company?.name?.trim() || "AI-Group.nl",
      attachments: [
        {
          filename: `${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    })

    if (invoice.status === "draft") {
      await updateInvoiceStatus(invoiceId, "sent")
    }
    await logEmailContact(
      invoice.customerId,
      `Factuur ${invoice.invoiceNumber} verzonden per e-mail`,
      `Aan: ${input.to.trim()}\nOnderwerp: ${input.subject.trim()}\n\n${input.body.trim()}`
    )

    revalidatePath(`/invoices/${invoiceId}`)
    revalidatePath("/invoices")
    return { success: true }
  } catch (error) {
    console.error("Error sending invoice email:", error)
    const message = error instanceof Error ? error.message : "Onbekende fout"
    return { success: false, error: `Kon factuur niet verzenden: ${message}` }
  }
}
