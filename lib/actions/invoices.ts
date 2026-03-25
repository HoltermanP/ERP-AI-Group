"use server"

import { db } from "@/lib/db"
import { invoices, invoiceLines, quoteLines, quotes, type NewInvoice, type NewInvoiceLine } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { generateInvoiceNumber } from "@/lib/utils/numbering"
import { calculateTotals } from "@/lib/utils/calculations"

export async function getInvoices() {
  try {
    return await db.query.invoices.findMany({
      with: { customer: true },
      orderBy: (i, { desc }) => [desc(i.createdAt)],
    })
  } catch (error) {
    console.error("Error fetching invoices:", error)
    throw new Error("Kon facturen niet ophalen")
  }
}

export async function getInvoice(id: number) {
  try {
    return await db.query.invoices.findFirst({
      where: eq(invoices.id, id),
      with: {
        customer: true,
        lines: {
          orderBy: (l, { asc }) => [asc(l.sortOrder)],
        },
        quote: true,
      },
    })
  } catch (error) {
    console.error("Error fetching invoice:", error)
    throw new Error("Kon factuur niet ophalen")
  }
}

export async function createInvoice(
  data: Omit<NewInvoice, "invoiceNumber" | "subtotal" | "btwAmount" | "total">,
  lines: Omit<NewInvoiceLine, "invoiceId" | "lineTotal">[]
) {
  try {
    const invoiceNumber = await generateInvoiceNumber()
    const lineItems = lines.map((l) => ({
      quantity: parseFloat(String(l.quantity)),
      unitPrice: parseFloat(String(l.unitPrice)),
      btwPercentage: parseFloat(String(l.btwPercentage)),
    }))
    const totals = calculateTotals(lineItems)

    // Calculate due date (30 days from invoice date)
    const invoiceDate = data.invoiceDate ? new Date(data.invoiceDate) : new Date()
    const dueDate = new Date(invoiceDate)
    dueDate.setDate(dueDate.getDate() + 30)

    const invoiceResult = await db
      .insert(invoices)
      .values({
        ...data,
        invoiceNumber,
        dueDate: data.dueDate || dueDate.toISOString().split("T")[0],
        subtotal: String(totals.subtotal),
        btwAmount: String(totals.btwAmount),
        total: String(totals.total),
      })
      .returning()

    const invoiceId = invoiceResult[0].id
    if (lines.length > 0) {
      await db.insert(invoiceLines).values(
        lines.map((l, i) => ({
          ...l,
          invoiceId,
          lineTotal: String(
            parseFloat(String(l.quantity)) * parseFloat(String(l.unitPrice))
          ),
          sortOrder: i,
        }))
      )
    }

    revalidatePath("/invoices")
    return { success: true, data: invoiceResult[0] }
  } catch (error) {
    console.error("Error creating invoice:", error)
    return { success: false, error: "Kon factuur niet aanmaken" }
  }
}

export async function createInvoiceFromQuote(quoteId: number, customerId: number) {
  try {
    const lines = await db.query.quoteLines.findMany({
      where: eq(quoteLines.quoteId, quoteId),
      orderBy: (l, { asc }) => [asc(l.sortOrder)],
    })

    const quote = await db.query.quotes.findFirst({
      where: eq(quotes.id, quoteId),
    })

    if (!quote) return { success: false, error: "Offerte niet gevonden" }

    const lineItems = lines.map((l) => ({
      description: l.description,
      quantity: l.quantity || "1",
      unit: l.unit || "stuks",
      unitPrice: l.unitPrice || "0",
      btwPercentage: l.btwPercentage || "21",
    }))

    return createInvoice(
      {
        quoteId,
        customerId,
        title: quote.title,
        status: "draft",
        invoiceDate: new Date().toISOString().split("T")[0],
        notes: quote.notes,
        terms: "Betaling binnen 30 dagen na factuurdatum.",
      },
      lineItems
    )
  } catch (error) {
    console.error("Error creating invoice from quote:", error)
    return { success: false, error: "Kon factuur niet aanmaken vanuit offerte" }
  }
}

export async function updateInvoice(
  id: number,
  data: Partial<NewInvoice>,
  lines?: Omit<NewInvoiceLine, "invoiceId" | "lineTotal">[]
) {
  try {
    if (lines !== undefined) {
      const lineItems = lines.map((l) => ({
        quantity: parseFloat(String(l.quantity)),
        unitPrice: parseFloat(String(l.unitPrice)),
        btwPercentage: parseFloat(String(l.btwPercentage)),
      }))
      const totals = calculateTotals(lineItems)
      data = {
        ...data,
        subtotal: String(totals.subtotal),
        btwAmount: String(totals.btwAmount),
        total: String(totals.total),
      }
    }

    const result = await db
      .update(invoices)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning()

    if (lines !== undefined) {
      await db.delete(invoiceLines).where(eq(invoiceLines.invoiceId, id))
      if (lines.length > 0) {
        await db.insert(invoiceLines).values(
          lines.map((l, i) => ({
            ...l,
            invoiceId: id,
            lineTotal: String(
              parseFloat(String(l.quantity)) * parseFloat(String(l.unitPrice))
            ),
            sortOrder: i,
          }))
        )
      }
    }

    revalidatePath("/invoices")
    revalidatePath(`/invoices/${id}`)
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error updating invoice:", error)
    return { success: false, error: "Kon factuur niet bijwerken" }
  }
}

export async function markInvoicePaid(id: number) {
  return updateInvoice(id, { status: "paid", paidAt: new Date() })
}

export async function updateInvoiceStatus(id: number, status: string) {
  return updateInvoice(id, { status })
}

export async function updateInvoicePdfUrl(id: number, pdfUrl: string) {
  return updateInvoice(id, { pdfUrl })
}

export async function deleteInvoice(id: number) {
  try {
    await db.delete(invoices).where(eq(invoices.id, id))
    revalidatePath("/invoices")
    return { success: true }
  } catch (error) {
    console.error("Error deleting invoice:", error)
    return { success: false, error: "Kon factuur niet verwijderen" }
  }
}
