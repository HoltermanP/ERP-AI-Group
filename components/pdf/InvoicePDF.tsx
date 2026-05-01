import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"
import type { Invoice, InvoiceLine, Customer, CompanyProfile, Quote } from "@/lib/db/schema"

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#0D1428",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  logo: { fontSize: 20, fontFamily: "Helvetica-Bold" },
  divider: { height: 2, backgroundColor: "#2D6FE8", marginBottom: 20 },
  docTitle: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#0D1428", textAlign: "right" },
  docMeta: { fontSize: 9, color: "#6B82A8", textAlign: "right", marginTop: 4 },
  section: { flexDirection: "row", gap: 20, marginBottom: 24 },
  infoBlock: { flex: 1 },
  infoLabel: { fontSize: 8, color: "#6B82A8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, fontFamily: "Helvetica-Bold" },
  infoText: { fontSize: 10, color: "#0D1428", lineHeight: 1.5 },
  tableHeader: { flexDirection: "row", backgroundColor: "#EEF3FF", padding: "8 6" },
  tableHeaderText: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#0D1428", textTransform: "uppercase" },
  tableRow: { flexDirection: "row", padding: "7 6", borderBottomColor: "#E0E6F0", borderBottomWidth: 0.5 },
  tableCell: { fontSize: 9, color: "#0D1428" },
  colDesc: { flex: 3 },
  colNum: { flex: 0.8, textAlign: "right" },
  colUnit: { flex: 1, textAlign: "center" },
  colPrice: { flex: 1.2, textAlign: "right" },
  colBtw: { flex: 0.8, textAlign: "center" },
  colTotal: { flex: 1.2, textAlign: "right" },
  totalsBlock: { alignItems: "flex-end", marginTop: 16 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", width: 200, marginBottom: 4 },
  totalsLabel: { fontSize: 9, color: "#6B82A8" },
  totalsValue: { fontSize: 9, color: "#0D1428" },
  totalsDivider: { width: 200, height: 0.5, backgroundColor: "#E0E6F0", marginVertical: 6 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", width: 200 },
  totalLabel: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#0D1428" },
  totalValue: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#2D6FE8" },
  notes: { marginTop: 24, padding: 12, backgroundColor: "#F8FAFF", borderRadius: 4 },
  notesLabel: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#6B82A8", textTransform: "uppercase", marginBottom: 4 },
  notesText: { fontSize: 9, color: "#0D1428", lineHeight: 1.5 },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 8, color: "#B0BAC9", letterSpacing: 0.5 },
})

function fmt(val: number | string | null | undefined): string {
  const n = typeof val === "string" ? parseFloat(val) : (val ?? 0)
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(n)
}

function fmtDate(val: Date | string | null | undefined): string {
  if (!val) return "-"
  const d = typeof val === "string" ? new Date(val) : val
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(d)
}

interface InvoicePDFProps {
  invoice: Invoice & { lines?: InvoiceLine[]; customer?: Customer | null; quote?: Quote | null }
  company: CompanyProfile | null
}

function btwByRate(lines: InvoiceLine[] | undefined): { pct: string; base: number; amount: number }[] {
  if (!lines?.length) return []
  const map = new Map<string, { base: number; amount: number }>()
  for (const line of lines) {
    const pct = String(line.btwPercentage ?? "0")
    const base = parseFloat(String(line.lineTotal)) || 0
    const rate = (parseFloat(pct) || 0) / 100
    const amount = base * rate
    const cur = map.get(pct) || { base: 0, amount: 0 }
    map.set(pct, { base: cur.base + base, amount: cur.amount + amount })
  }
  return Array.from(map.entries())
    .map(([pct, v]) => ({ pct, ...v }))
    .sort((a, b) => parseFloat(a.pct) - parseFloat(b.pct))
}

export function InvoicePDF({ invoice, company }: InvoicePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>
              <Text style={{ color: "#2D6FE8" }}>AI</Text>
              <Text style={{ color: "#0D1428" }}>-Group.nl</Text>
            </Text>
            {company?.address && <Text style={{ fontSize: 9, color: "#6B82A8", marginTop: 4 }}>{company.address}</Text>}
            {company?.city && <Text style={{ fontSize: 9, color: "#6B82A8" }}>{company.postalCode} {company.city}</Text>}
            {company?.email && <Text style={{ fontSize: 9, color: "#2D6FE8" }}>{company.email}</Text>}
          </View>
          <View>
            <Text style={styles.docTitle}>FACTUUR</Text>
            <Text style={styles.docMeta}>Factuurnummer: {invoice.invoiceNumber}</Text>
            <Text style={styles.docMeta}>Factuurdatum: {fmtDate(invoice.invoiceDate)}</Text>
            {invoice.dueDate && <Text style={styles.docMeta}>Vervaldatum: {fmtDate(invoice.dueDate)}</Text>}
            {invoice.quote?.quoteNumber && (
              <Text style={styles.docMeta}>Offerte: {invoice.quote.quoteNumber}</Text>
            )}
          </View>
        </View>
        <View style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Factuur aan</Text>
            <Text style={styles.infoText}>
              {invoice.customer?.companyName}{"\n"}
              {invoice.customer?.contactName ? invoice.customer.contactName + "\n" : ""}
              {invoice.customer?.address ? invoice.customer.address + "\n" : ""}
              {invoice.customer?.postalCode} {invoice.customer?.city}
              {invoice.customer?.country && invoice.customer.country !== "Nederland"
                ? "\n" + invoice.customer.country
                : ""}
              {"\n"}
              {invoice.customer?.kvk ? "KvK: " + invoice.customer.kvk + "\n" : ""}
              {invoice.customer?.btw ? "BTW-nummer: " + invoice.customer.btw : ""}
            </Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Van</Text>
            <Text style={styles.infoText}>
              {company?.name || "AI-Group.nl"}{"\n"}
              {company?.address ? company.address + "\n" : ""}
              {company?.postalCode} {company?.city}{"\n"}
              {company?.kvk ? "KvK: " + company.kvk + "\n" : ""}
              {company?.btw ? "BTW-nummer: " + company.btw + "\n" : ""}
              {company?.iban ? "IBAN: " + company.iban : ""}
              {company?.country && company.country !== "Nederland" ? "\n" + company.country : ""}
            </Text>
          </View>
        </View>

        <Text style={{ fontSize: 13, fontFamily: "Helvetica-Bold", marginBottom: 16, color: "#0D1428" }}>
          {invoice.title}
        </Text>

        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colDesc]}>Omschrijving</Text>
          <Text style={[styles.tableHeaderText, styles.colNum]}>Aantal</Text>
          <Text style={[styles.tableHeaderText, styles.colUnit]}>Eenheid</Text>
          <Text style={[styles.tableHeaderText, styles.colPrice]}>Stukprijs</Text>
          <Text style={[styles.tableHeaderText, styles.colBtw]}>BTW%</Text>
          <Text style={[styles.tableHeaderText, styles.colTotal]}>Bedrag excl. BTW</Text>
        </View>
        {invoice.lines?.map((line, i) => (
          <View key={i} style={[styles.tableRow, i % 2 === 1 ? { backgroundColor: "#FAFBFF" } : {}]}>
            <Text style={[styles.tableCell, styles.colDesc]}>{line.description}</Text>
            <Text style={[styles.tableCell, styles.colNum]}>{line.quantity}</Text>
            <Text style={[styles.tableCell, styles.colUnit]}>{line.unit}</Text>
            <Text style={[styles.tableCell, styles.colPrice]}>{fmt(line.unitPrice)}</Text>
            <Text style={[styles.tableCell, styles.colBtw]}>{line.btwPercentage}%</Text>
            <Text style={[styles.tableCell, styles.colTotal]}>{fmt(line.lineTotal)}</Text>
          </View>
        ))}

        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Totaal excl. BTW</Text>
            <Text style={styles.totalsValue}>{fmt(invoice.subtotal)}</Text>
          </View>
          {(() => {
            const rows = btwByRate(invoice.lines)
            if (rows.length <= 1) {
              return (
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>
                    BTW {rows[0] ? `(${rows[0].pct}%)` : `(${invoice.btwPercentage}%)`}
                  </Text>
                  <Text style={styles.totalsValue}>{fmt(invoice.btwAmount)}</Text>
                </View>
              )
            }
            return rows.map((r) => (
              <View key={r.pct} style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>
                  BTW {r.pct}% over {fmt(r.base)}
                </Text>
                <Text style={styles.totalsValue}>{fmt(r.amount)}</Text>
              </View>
            ))
          })()}
          <View style={styles.totalsDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Totaal te betalen (incl. BTW)</Text>
            <Text style={styles.totalValue}>{fmt(invoice.total)}</Text>
          </View>
        </View>

        <View style={[styles.notes, { marginTop: 16 }]}>
          <Text style={styles.notesLabel}>Betalingsinstructie</Text>
          <Text style={styles.notesText}>
            {invoice.terms ||
              (company?.iban
                ? `Graag het totaalbedrag vóór de vervaldatum overmaken op ${company.iban} onder vermelding van het factuurnummer.`
                : "Betaal voor de vervaldatum onder vermelding van het factuurnummer.")}
          </Text>
          {invoice.notes && (
            <>
              <Text style={[styles.notesLabel, { marginTop: 10 }]}>Toelichting / referentie</Text>
              <Text style={styles.notesText}>{invoice.notes}</Text>
            </>
          )}
        </View>

        <View style={{ marginTop: 12, padding: 10, borderWidth: 0.5, borderColor: "#E0E6F0", borderRadius: 4 }}>
          <Text style={{ fontSize: 7, color: "#6B82A8", lineHeight: 1.4 }}>
            Factuur conform de Nederlandse factuurvereisten: factuurnummer, factuurdatum, volledige naam en adres van
            leverancier en afnemer, BTW-identificatienummer(s) waar van toepassing, omschrijving van de prestatie,
            bedrag excl. BTW, BTW-tarief en BTW-bedrag, en totaalbedrag incl. BTW.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>AI-FIRST · WE SHIP FAST · ai-group.nl</Text>
        </View>
      </Page>
    </Document>
  )
}
