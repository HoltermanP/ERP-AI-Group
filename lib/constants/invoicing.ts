/** Standaard betalingstermijn op facturen (dagen na factuurdatum / vervaldatum). */
export const INVOICE_PAYMENT_TERM_DAYS = 14

/**
 * Berekent vervaldatum: factuurdatum + {@link INVOICE_PAYMENT_TERM_DAYS}.
 * Zelfde aanpak als bij `createInvoice` op de server (`setDate`).
 */
export function computeDefaultDueDate(invoiceDateYmd: string | undefined): string {
  const invoiceDate = invoiceDateYmd ? new Date(invoiceDateYmd) : new Date()
  const due = new Date(invoiceDate)
  due.setDate(due.getDate() + INVOICE_PAYMENT_TERM_DAYS)
  return due.toISOString().split("T")[0]
}
