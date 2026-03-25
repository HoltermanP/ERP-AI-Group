import { db } from "@/lib/db"
import { quotes, invoices } from "@/lib/db/schema"
import { sql } from "drizzle-orm"

export async function generateQuoteNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(quotes)
    .where(sql`EXTRACT(YEAR FROM created_at) = ${year}`)
  const num = String(Number(result[0].count) + 1).padStart(3, "0")
  return `OFF-${year}-${num}`
}

export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(invoices)
    .where(sql`EXTRACT(YEAR FROM created_at) = ${year}`)
  const num = String(Number(result[0].count) + 1).padStart(3, "0")
  return `FAC-${year}-${num}`
}
