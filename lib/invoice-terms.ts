import type { CompanyProfile } from "@/lib/db/schema"
import { INVOICE_PAYMENT_TERM_DAYS } from "@/lib/constants/invoicing"

/**
 * Standaard NL-factuurtekst: betalingstermijn, rekening, kenmerk.
 * Vul in Instellingen minimaal IBAN en bedrijfsnaam voor een volledige tekst.
 */
export function buildDefaultInvoiceTerms(company: CompanyProfile | null): string {
  const name = company?.name?.trim() || "onze organisatie"
  const iban = company?.iban?.trim()
  const dagen = INVOICE_PAYMENT_TERM_DAYS

  const core = iban
    ? `Graag het totaalbedrag binnen ${dagen} dagen na factuurdatum overmaken op bankrekening ${iban} t.n.v. ${name}, onder vermelding van het factuurnummer.`
    : `Graag het totaalbedrag binnen ${dagen} dagen na factuurdatum overmaken, onder vermelding van het factuurnummer. (Vul uw IBAN in bij Instellingen om de bankregel automatisch te tonen.)`

  return `${core} Bij betaling na de vervaldatum zijn wij gerechtigd wettelijke (handels)rente en buitengerechtelijke incassokosten in rekening te brengen.`
}
