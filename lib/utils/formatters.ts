export function formatCurrency(amount: number | string | null | undefined): string {
  // Drizzle `decimal` kan in sommige omgevingen als een non-string object binnenkomen.
  // We coerced daarom altijd robuust naar een `number`.
  const num =
    amount === null || amount === undefined
      ? 0
      : typeof amount === "number"
        ? amount
        : typeof amount === "string"
          ? parseFloat(amount)
          : parseFloat(String(amount))

  const safeNum = Number.isFinite(num) ? num : 0
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(safeNum)
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-"
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d)
}

export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return "-"
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d)
}

export function formatNumber(num: number | string | null | undefined): string {
  const n =
    num === null || num === undefined
      ? 0
      : typeof num === "number"
        ? num
        : typeof num === "string"
          ? parseFloat(num)
          : parseFloat(String(num))
  const safeN = Number.isFinite(n) ? n : 0
  return new Intl.NumberFormat("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(safeN)
}
