"use server"

import { db } from "@/lib/db"
import { quotes, quoteLines, type NewQuote, type NewQuoteLine } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { generateQuoteNumber } from "@/lib/utils/numbering"
import { calculateTotals } from "@/lib/utils/calculations"

export async function getQuotes() {
  try {
    return await db.query.quotes.findMany({
      with: { customer: true },
      orderBy: (q, { desc }) => [desc(q.createdAt)],
    })
  } catch (error) {
    console.error("Error fetching quotes:", error)
    throw new Error("Kon offertes niet ophalen")
  }
}

export async function getQuote(id: number) {
  try {
    return await db.query.quotes.findFirst({
      where: eq(quotes.id, id),
      with: {
        customer: true,
        lines: {
          orderBy: (l, { asc }) => [asc(l.sortOrder)],
        },
      },
    })
  } catch (error) {
    console.error("Error fetching quote:", error)
    throw new Error("Kon offerte niet ophalen")
  }
}

export async function createQuote(
  data: Omit<NewQuote, "quoteNumber" | "subtotal" | "btwAmount" | "total">,
  lines: Omit<NewQuoteLine, "quoteId" | "lineTotal">[]
) {
  try {
    const quoteNumber = await generateQuoteNumber()
    const lineItems = lines.map((l) => ({
      quantity: parseFloat(String(l.quantity)),
      unitPrice: parseFloat(String(l.unitPrice)),
      btwPercentage: parseFloat(String(l.btwPercentage)),
    }))
    const totals = calculateTotals(lineItems)

    const quoteResult = await db
      .insert(quotes)
      .values({
        ...data,
        quoteNumber,
        subtotal: String(totals.subtotal),
        btwAmount: String(totals.btwAmount),
        total: String(totals.total),
      })
      .returning()

    const quoteId = quoteResult[0].id
    if (lines.length > 0) {
      await db.insert(quoteLines).values(
        lines.map((l, i) => ({
          ...l,
          quoteId,
          lineTotal: String(
            parseFloat(String(l.quantity)) * parseFloat(String(l.unitPrice))
          ),
          sortOrder: i,
        }))
      )
    }

    revalidatePath("/quotes")
    return { success: true, data: quoteResult[0] }
  } catch (error) {
    console.error("Error creating quote:", error)
    return { success: false, error: "Kon offerte niet aanmaken" }
  }
}

export async function updateQuote(
  id: number,
  data: Partial<NewQuote>,
  lines?: Omit<NewQuoteLine, "quoteId" | "lineTotal">[]
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
      .update(quotes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(quotes.id, id))
      .returning()

    if (lines !== undefined) {
      await db.delete(quoteLines).where(eq(quoteLines.quoteId, id))
      if (lines.length > 0) {
        await db.insert(quoteLines).values(
          lines.map((l, i) => ({
            ...l,
            quoteId: id,
            lineTotal: String(
              parseFloat(String(l.quantity)) * parseFloat(String(l.unitPrice))
            ),
            sortOrder: i,
          }))
        )
      }
    }

    revalidatePath("/quotes")
    revalidatePath(`/quotes/${id}`)
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error updating quote:", error)
    return { success: false, error: "Kon offerte niet bijwerken" }
  }
}

export async function updateQuoteStatus(id: number, status: string) {
  return updateQuote(id, { status })
}

export async function updateQuotePdfUrl(id: number, pdfUrl: string) {
  return updateQuote(id, { pdfUrl })
}

export async function deleteQuote(id: number) {
  try {
    await db.delete(quotes).where(eq(quotes.id, id))
    revalidatePath("/quotes")
    return { success: true }
  } catch (error) {
    console.error("Error deleting quote:", error)
    return { success: false, error: "Kon offerte niet verwijderen" }
  }
}
