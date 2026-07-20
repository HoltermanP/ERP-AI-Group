import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"
import type { Quote, QuoteLine, Customer, CompanyProfile } from "@/lib/db/schema"

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
    paddingHorizontal: 40,
    paddingBottom: 70,
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
  headerLeft: { flex: 1, paddingRight: 20 },
  headerRight: { width: 220 },
  logo: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
  },
  logoAI: {
    color: "#2D6FE8",
  },
  logoGroup: {
    color: "#0D1428",
  },
  divider: {
    height: 2,
    backgroundColor: "#2D6FE8",
    marginBottom: 20,
  },
  docTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#0D1428",
    textAlign: "right",
  },
  docMeta: {
    fontSize: 9,
    color: "#6B82A8",
    textAlign: "right",
    marginTop: 4,
  },
  section: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 24,
  },
  infoBlock: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 8,
    color: "#6B82A8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
    fontFamily: "Helvetica-Bold",
  },
  infoText: {
    fontSize: 10,
    color: "#0D1428",
    lineHeight: 1.5,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#EEF3FF",
    padding: "8 6",
  },
  tableHeaderText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#0D1428",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    padding: "7 6",
    borderBottomColor: "#E0E6F0",
    borderBottomWidth: 0.5,
  },
  tableCell: {
    fontSize: 9,
    color: "#0D1428",
  },
  colDesc: { flex: 3 },
  colNum: { flex: 0.8, textAlign: "right" },
  colUnit: { flex: 1, textAlign: "center" },
  colPrice: { flex: 1.2, textAlign: "right" },
  colBtw: { flex: 0.8, textAlign: "center" },
  colTotal: { flex: 1.2, textAlign: "right" },
  totalsBlock: {
    alignItems: "flex-end",
    marginTop: 16,
  },
  totalsRow: {
    flexDirection: "row",
    width: 260,
    marginBottom: 4,
  },
  totalsLabel: {
    fontSize: 9,
    color: "#6B82A8",
    flex: 1,
    paddingRight: 12,
  },
  totalsValue: {
    fontSize: 9,
    color: "#0D1428",
    fontFamily: "Helvetica",
    textAlign: "right",
  },
  totalsDivider: {
    width: 260,
    height: 0.5,
    backgroundColor: "#E0E6F0",
    marginVertical: 6,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    width: 260,
  },
  totalLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#0D1428",
    flex: 1,
    paddingRight: 12,
  },
  totalValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#2D6FE8",
    textAlign: "right",
  },
  notes: {
    marginTop: 24,
    padding: 12,
    backgroundColor: "#F8FAFF",
    borderRadius: 4,
  },
  notesLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#6B82A8",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: "#0D1428",
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: "#B0BAC9",
    letterSpacing: 0.5,
  },
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

interface QuotePDFProps {
  quote: Quote & { lines?: QuoteLine[]; customer?: Customer | null }
  company: CompanyProfile | null
}

function btwByRate(lines: QuoteLine[] | undefined): { pct: string; base: number; amount: number }[] {
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

export function QuotePDF({ quote, company }: QuotePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.logo}>
              <Text style={styles.logoAI}>AI</Text>
              <Text style={styles.logoGroup}>-Group.nl</Text>
            </Text>
            {company?.address && <Text style={{ fontSize: 9, color: "#6B82A8", marginTop: 4 }}>{company.address}</Text>}
            {company?.city && <Text style={{ fontSize: 9, color: "#6B82A8" }}>{company.postalCode} {company.city}</Text>}
            {company?.email && <Text style={{ fontSize: 9, color: "#2D6FE8" }}>{company.email}</Text>}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.docTitle}>OFFERTE</Text>
            <Text style={styles.docMeta}>{quote.quoteNumber}</Text>
            <Text style={styles.docMeta}>{fmtDate(quote.createdAt)}</Text>
            {quote.validUntil && (
              <Text style={styles.docMeta}>Geldig tot: {fmtDate(quote.validUntil)}</Text>
            )}
          </View>
        </View>
        <View style={styles.divider} />

        {/* Client & Company info */}
        <View style={styles.section}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Aan</Text>
            <Text style={styles.infoText}>
              {quote.customer?.companyName}{"\n"}
              {quote.customer?.contactName ? quote.customer.contactName + "\n" : ""}
              {quote.customer?.address ? quote.customer.address + "\n" : ""}
              {quote.customer?.postalCode} {quote.customer?.city}{"\n"}
              {quote.customer?.email || ""}
            </Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Van</Text>
            <Text style={styles.infoText}>
              {company?.name || "AI-Group.nl"}{"\n"}
              {company?.address ? company.address + "\n" : ""}
              {company?.postalCode} {company?.city}{"\n"}
              {company?.kvk ? "KvK: " + company.kvk + "\n" : ""}
              {company?.btw ? "BTW: " + company.btw + "\n" : ""}
              {company?.iban ? "IBAN: " + company.iban : ""}
            </Text>
          </View>
        </View>

        {/* Subject */}
        <Text style={{ fontSize: 13, fontFamily: "Helvetica-Bold", marginBottom: 16, color: "#0D1428" }}>
          {quote.title}
        </Text>

        {/* Table */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colDesc]}>Omschrijving</Text>
          <Text style={[styles.tableHeaderText, styles.colNum]}>Aantal</Text>
          <Text style={[styles.tableHeaderText, styles.colUnit]}>Eenheid</Text>
          <Text style={[styles.tableHeaderText, styles.colPrice]}>Stukprijs</Text>
          <Text style={[styles.tableHeaderText, styles.colBtw]}>BTW%</Text>
          <Text style={[styles.tableHeaderText, styles.colTotal]}>Totaal</Text>
        </View>
        {quote.lines?.map((line, i) => (
          <View key={i} wrap={false} style={[styles.tableRow, i % 2 === 1 ? { backgroundColor: "#FAFBFF" } : {}]}>
            <Text style={[styles.tableCell, styles.colDesc]}>{line.description}</Text>
            <Text style={[styles.tableCell, styles.colNum]}>{line.quantity}</Text>
            <Text style={[styles.tableCell, styles.colUnit]}>{line.unit}</Text>
            <Text style={[styles.tableCell, styles.colPrice]}>{fmt(line.unitPrice)}</Text>
            <Text style={[styles.tableCell, styles.colBtw]}>{line.btwPercentage}%</Text>
            <Text style={[styles.tableCell, styles.colTotal]}>{fmt(line.lineTotal)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totalsBlock} wrap={false}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotaal</Text>
            <Text style={styles.totalsValue}>{fmt(quote.subtotal)}</Text>
          </View>
          {(() => {
            const rows = btwByRate(quote.lines)
            if (rows.length <= 1) {
              return (
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>
                    BTW {rows[0] ? `(${rows[0].pct}%)` : `(${quote.btwPercentage}%)`}
                  </Text>
                  <Text style={styles.totalsValue}>{fmt(quote.btwAmount)}</Text>
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
            <Text style={styles.totalLabel}>Totaal</Text>
            <Text style={styles.totalValue}>{fmt(quote.total)}</Text>
          </View>
        </View>

        {/* Notes */}
        {(quote.notes || quote.terms) && (
          <View style={styles.notes}>
            {quote.notes && (
              <>
                <Text style={styles.notesLabel}>Notities</Text>
                <Text style={styles.notesText}>{quote.notes}</Text>
              </>
            )}
            {quote.terms && (
              <>
                <Text style={[styles.notesLabel, { marginTop: 8 }]}>Betalingsvoorwaarden</Text>
                <Text style={styles.notesText}>{quote.terms}</Text>
              </>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>AI-FIRST · WE SHIP FAST · ai-group.nl</Text>
        </View>
      </Page>
    </Document>
  )
}
