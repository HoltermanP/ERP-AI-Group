import { db } from "@/lib/db"
import { quotes, invoices, projects } from "@/lib/db/schema"
import { sql } from "drizzle-orm"

/** Formaat: JJJJ-NNNN (bijv. 2026-0125). Ook oudere OFF-/FAC-prefixen worden herkend bij het bepalen van het hoogste volgnummer. */

const PAD = 4

/** Vaste starts (override met env ERP_INVOICE_FIRST_SEQ_2026 etc.) */
const DEFAULT_FIRST_INVOICE_SEQ: Record<number, number> = { 2026: 125 }
const DEFAULT_FIRST_QUOTE_SEQ: Record<number, number> = { 2026: 76 }

function envFirstSeq(kind: "invoice" | "quote", year: number): number {
  const key = kind === "invoice" ? `ERP_INVOICE_FIRST_SEQ_${year}` : `ERP_QUOTE_FIRST_SEQ_${year}`
  const raw = process.env[key]
  if (raw !== undefined && raw !== "") {
    const n = parseInt(raw, 10)
    if (!Number.isNaN(n) && n >= 1) return n
  }
  const fallback = kind === "invoice" ? DEFAULT_FIRST_INVOICE_SEQ[year] : DEFAULT_FIRST_QUOTE_SEQ[year]
  return fallback ?? 1
}

/** Voor onderhoudsscripts: eerste volgnummer voor een jaar (zelfde logica als nieuwe nummers). */
export function getConfiguredFirstSeq(kind: "invoice" | "quote", year: number): number {
  return envFirstSeq(kind, year)
}

/** Herkent o.a. 2026-0125, FAC-2026-0125, OFF-2026-0076 */
export function parseDocumentNumber(raw: string): { year: number; seq: number } | null {
  const s = raw.trim()
  const m = s.match(/^(?:[A-Za-z]+-)?(\d{4})-(\d+)$/)
  if (!m) return null
  const year = parseInt(m[1], 10)
  const seq = parseInt(m[2], 10)
  if (Number.isNaN(year) || Number.isNaN(seq) || seq < 1) return null
  return { year, seq }
}

async function maxSeqForYear(
  kind: "invoice" | "quote",
  year: number
): Promise<number> {
  const rows =
    kind === "invoice"
      ? await db.select({ n: invoices.invoiceNumber }).from(invoices)
      : await db.select({ n: quotes.quoteNumber }).from(quotes)

  let max = 0
  for (const row of rows) {
    const p = parseDocumentNumber(row.n)
    if (p && p.year === year) max = Math.max(max, p.seq)
  }
  return max
}

export async function generateQuoteNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const first = envFirstSeq("quote", year)
  const max = await maxSeqForYear("quote", year)
  const next = Math.max(first, max + 1)
  return `${year}-${String(next).padStart(PAD, "0")}`
}

export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const first = envFirstSeq("invoice", year)
  const max = await maxSeqForYear("invoice", year)
  const next = Math.max(first, max + 1)
  return `${year}-${String(next).padStart(PAD, "0")}`
}

export async function generateProjectNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(projects)
    .where(sql`EXTRACT(YEAR FROM created_at) = ${year}`)
  const num = String(Number(result[0].count) + 1).padStart(3, "0")
  return `PRJ-${year}-${num}`
}
