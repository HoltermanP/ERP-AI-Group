/**
 * Hernummer bestaande facturen en offertes naar het formaat JJJJ-NNNN,
 * oplopend per kalenderjaar vanaf de geconfigureerde start (zelfde als bij nieuwe documenten).
 *
 * Optioneel in .env.local:
 *   ERP_INVOICE_FIRST_SEQ_2026=125
 *   ERP_QUOTE_FIRST_SEQ_2026=76
 *
 * Gebruik: npx tsx scripts/renumber-documents.ts
 */
import { config as loadEnv } from "dotenv"

loadEnv({ path: ".env.local" })
loadEnv()

import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { asc, eq } from "drizzle-orm"
import * as schema from "../lib/db/schema"
import { getConfiguredFirstSeq } from "../lib/utils/numbering"

const sqlClient = neon(process.env.DATABASE_URL!)
const db = drizzle(sqlClient, { schema })

function calendarYearFromInvoice(row: typeof schema.invoices.$inferSelect): number {
  if (row.invoiceDate) {
    const y = new Date(row.invoiceDate as string).getFullYear()
    if (!Number.isNaN(y)) return y
  }
  return row.createdAt ? new Date(row.createdAt).getFullYear() : new Date().getFullYear()
}

function calendarYearFromQuote(row: typeof schema.quotes.$inferSelect): number {
  return row.createdAt ? new Date(row.createdAt).getFullYear() : new Date().getFullYear()
}

async function main() {
  const invRows = await db.select().from(schema.invoices).orderBy(asc(schema.invoices.id))
  const byInvYear = new Map<number, typeof invRows>()
  for (const row of invRows) {
    const y = calendarYearFromInvoice(row)
    const list = byInvYear.get(y) || []
    list.push(row)
    byInvYear.set(y, list)
  }

  for (const [year, rows] of byInvYear) {
    const start = getConfiguredFirstSeq("invoice", year)
    let seq = start
    for (const row of rows) {
      const num = `${year}-${String(seq).padStart(4, "0")}`
      await db
        .update(schema.invoices)
        .set({ invoiceNumber: num, updatedAt: new Date() })
        .where(eq(schema.invoices.id, row.id))
      console.log(`Factuur ${row.id}: ${row.invoiceNumber} → ${num}`)
      seq += 1
    }
  }

  const quoteRows = await db.select().from(schema.quotes).orderBy(asc(schema.quotes.id))
  const byQuoteYear = new Map<number, typeof quoteRows>()
  for (const row of quoteRows) {
    const y = calendarYearFromQuote(row)
    const list = byQuoteYear.get(y) || []
    list.push(row)
    byQuoteYear.set(y, list)
  }

  for (const [year, rows] of byQuoteYear) {
    const start = getConfiguredFirstSeq("quote", year)
    let seq = start
    for (const row of rows) {
      const num = `${year}-${String(seq).padStart(4, "0")}`
      await db
        .update(schema.quotes)
        .set({ quoteNumber: num, updatedAt: new Date() })
        .where(eq(schema.quotes.id, row.id))
      console.log(`Offerte ${row.id}: ${row.quoteNumber} → ${num}`)
      seq += 1
    }
  }

  console.log("Klaar.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
