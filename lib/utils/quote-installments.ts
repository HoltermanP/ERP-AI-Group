import type { QuoteLine } from "@/lib/db/schema"

export type QuoteLineInput = {
  description: string
  quantity: string
  unit: string
  unitPrice: string
  btwPercentage: string
}

/** Verdeelt totaal excl. BTW in n gelijke deelbedragen (centen, geen afrondingsrest). */
export function equalInstallmentPortionsExcl(totalExcl: number, n: number): number[] {
  if (n < 1) return []
  const cents = Math.round(totalExcl * 100)
  const out: number[] = []
  let prev = 0
  for (let i = 1; i <= n; i++) {
    const cumulative = Math.floor((cents * i) / n)
    out.push((cumulative - prev) / 100)
    prev = cumulative
  }
  return out
}

function lineExcl(line: Pick<QuoteLine, "quantity" | "unitPrice">): number {
  const q = parseFloat(String(line.quantity)) || 0
  const p = parseFloat(String(line.unitPrice)) || 0
  return q * p
}

/**
 * Schaal offerteregels naar één deeltermijn (zelfde verhoudingen tussen regels).
 * `installmentIndex` is 0-based.
 */
export function scaleQuoteLinesForInstallment(
  lines: QuoteLineInput[],
  installmentIndex: number,
  totalInstallments: number
): QuoteLineInput[] {
  if (totalInstallments < 2 || installmentIndex < 0 || installmentIndex >= totalInstallments) {
    return lines
  }

  const weights = lines.map((line) => ({ line, w: lineExcl(line) }))
  const totalExcl = weights.reduce((s, x) => s + x.w, 0)
  if (totalExcl <= 0) {
    return lines.map((l) => ({ ...l, unitPrice: "0" }))
  }

  const portions = equalInstallmentPortionsExcl(totalExcl, totalInstallments)
  const portion = portions[installmentIndex] ?? 0

  const scaled = weights.map(({ line, w }) => {
    const q = parseFloat(String(line.quantity)) || 0
    const shareExcl = (w / totalExcl) * portion
    const newUnitPrice = q > 0 ? Math.round((shareExcl / q) * 100) / 100 : 0
    return { ...line, unitPrice: String(newUnitPrice) }
  })

  let sum = scaled.reduce((s, l) => s + lineExcl(l), 0)
  let drift = Math.round((portion - sum) * 100) / 100
  if (Math.abs(drift) >= 0.005 && scaled[0]) {
    const q0 = parseFloat(String(scaled[0].quantity)) || 1
    const p0 = parseFloat(String(scaled[0].unitPrice)) || 0
    scaled[0].unitPrice = String(Math.round((p0 + drift / q0) * 100) / 100)
    sum = scaled.reduce((s, l) => s + lineExcl(l), 0)
    drift = Math.round((portion - sum) * 100) / 100
    if (Math.abs(drift) >= 0.005 && scaled.length > 1) {
      const q1 = parseFloat(String(scaled[1].quantity)) || 1
      const p1 = parseFloat(String(scaled[1].unitPrice)) || 0
      scaled[1].unitPrice = String(Math.round((p1 + drift / q1) * 100) / 100)
    }
  }

  return scaled
}
