import { config as loadEnv } from "dotenv"
loadEnv({ path: ".env.local" })
loadEnv()

import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { sql, count } from "drizzle-orm"
import * as schema from "../lib/db/schema"
import { calculateTotals } from "../lib/utils/calculations"

const sqlClient = neon(process.env.DATABASE_URL!)
const db = drizzle(sqlClient, { schema })

const RESET = process.argv.includes("--reset") || process.env.SEED_RESET === "1"
const CLEAR_ONLY = process.argv.includes("--clear-only")

const CUSTOMERS: Array<{
  companyName: string
  contactName: string
  email: string
  phone: string
  address: string
  postalCode: string
  city: string
  kvk: string
  btw?: string
  status: string
}> = [
  {
    companyName: "Technologie B.V.",
    contactName: "Jan de Vries",
    email: "jan@technologie.nl",
    phone: "+31 6 12345678",
    address: "Keizersgracht 50",
    postalCode: "1015 CS",
    city: "Amsterdam",
    kvk: "12345678",
    btw: "NL123456789B01",
    status: "active",
  },
  {
    companyName: "Digital Agency N.V.",
    contactName: "Sara Jansen",
    email: "sara@digitalagency.nl",
    phone: "+31 6 87654321",
    address: "Prinsengracht 200",
    postalCode: "1016 HB",
    city: "Amsterdam",
    kvk: "23456789",
    status: "active",
  },
  {
    companyName: "Startup Hub Rotterdam",
    contactName: "Peter Bakker",
    email: "peter@startuphub.nl",
    phone: "+31 10 987 6543",
    address: "Witte de Withstraat 10",
    postalCode: "3012 BK",
    city: "Rotterdam",
    kvk: "34567890",
    status: "active",
  },
  {
    companyName: "GroenStroom Energie",
    contactName: "Lisa Vermeulen",
    email: "lisa@groenstroom.nl",
    phone: "+31 88 555 0100",
    address: "Coolsingel 44",
    postalCode: "3011 AD",
    city: "Rotterdam",
    kvk: "45678901",
    status: "active",
  },
  {
    companyName: "Logistiek Partners",
    contactName: "Mark van Dijk",
    email: "mark@logistiekpartners.nl",
    phone: "+31 40 222 3344",
    address: "Strijp-T 12",
    postalCode: "5617 AR",
    city: "Eindhoven",
    kvk: "56789012",
    status: "active",
  },
  {
    companyName: "ZorgPlus Uitzendbureau",
    contactName: "Eva Scholten",
    email: "eva@zorgplus.nl",
    phone: "+31 30 111 2233",
    address: "Oudegracht 88",
    postalCode: "3511 AW",
    city: "Utrecht",
    kvk: "67890123",
    status: "inactive",
  },
  {
    companyName: "Retail Chain Noord",
    contactName: "Tom Mulder",
    email: "tom@retailchain.nl",
    phone: "+31 50 444 5566",
    address: "Herestraat 72",
    postalCode: "9711 LM",
    city: "Groningen",
    kvk: "78901234",
    status: "active",
  },
  {
    companyName: "FinTech Solutions",
    contactName: "Nina Koster",
    email: "nina@fintechsolutions.nl",
    phone: "+31 20 777 8899",
    address: "Zuidas 5",
    postalCode: "1082 MK",
    city: "Amsterdam",
    kvk: "89012345",
    status: "active",
  },
  {
    companyName: "Bouw & Co",
    contactName: "Rick Hoekstra",
    email: "rick@bouwenco.nl",
    phone: "+31 6 99887766",
    address: "Boulevard 3",
    postalCode: "2586 CD",
    city: "Den Haag",
    kvk: "90123456",
    status: "active",
  },
  {
    companyName: "Media Creators",
    contactName: "Floor de Boer",
    email: "floor@mediacreators.nl",
    phone: "+31 6 11223344",
    address: "Voorstraat 21",
    postalCode: "3512 JE",
    city: "Utrecht",
    kvk: "01234567",
    status: "active",
  },
]

const CONTACT_TYPES = ["call", "email", "meeting", "demo", "follow-up", "note"] as const

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000)
}

function daysFromNow(n: number): Date {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000)
}

async function resetDemoData() {
  console.log("🗑️  Verwijderen alle data...")
  await db.delete(schema.projectRevenue)
  await db.delete(schema.projectCosts)
  await db.delete(schema.projectHours)
  await db.delete(schema.projectEmployees)
  await db.delete(schema.projects)
  await db.delete(schema.employees)
  await db.delete(schema.invoiceLines)
  await db.delete(schema.invoices)
  await db.delete(schema.quoteLines)
  await db.delete(schema.quotes)
  await db.delete(schema.customerContacts)
  await db.delete(schema.customers)
  console.log("✅ Alle tabellen geleegd")
}

async function ensureCompanyProfile() {
  const existing = await db.select().from(schema.companyProfile).limit(1)
  if (existing.length > 0) {
    console.log("ℹ️  Company profile bestaat al, overslaan")
    return
  }
  await db.insert(schema.companyProfile).values({
    name: "AI-Group.nl",
    address: "Herengracht 100",
    postalCode: "1015 BS",
    city: "Amsterdam",
    country: "Nederland",
    kvk: "87654321",
    btw: "NL001234567B01",
    iban: "NL91ABNA0417164300",
    email: "info@ai-group.nl",
    phone: "+31 20 123 4567",
    website: "ai-group.nl",
  })
  console.log("✅ Company profile aangemaakt")
}

async function nextQuoteNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(schema.quotes)
    .where(sql`EXTRACT(YEAR FROM created_at) = ${year}`)
  const num = String(Number(result[0].count) + 1).padStart(3, "0")
  return `OFF-${year}-${num}`
}

async function nextInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(schema.invoices)
    .where(sql`EXTRACT(YEAR FROM created_at) = ${year}`)
  const num = String(Number(result[0].count) + 1).padStart(3, "0")
  return `FAC-${year}-${num}`
}

type LineInput = {
  description: string
  quantity: string
  unit: string
  unitPrice: string
  btwPercentage: string
}

function totalsForLines(lines: LineInput[]) {
  const items = lines.map((l) => ({
    quantity: l.quantity,
    unitPrice: l.unitPrice,
    btwPercentage: l.btwPercentage,
  }))
  return calculateTotals(items)
}

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL ontbreekt (bijv. in .env.local)")
    process.exit(1)
  }

  if (CLEAR_ONLY || RESET) {
    await resetDemoData()
  }

  if (CLEAR_ONLY) {
    console.log("✅ Klaar — database is leeg.")
    process.exit(0)
  }

  console.log("🌱 Seeding database...")
  if (RESET) {
    // already reset above
  }

  await ensureCompanyProfile()

  const [customerCountRow] = await db.select({ n: count() }).from(schema.customers)
  const existingCustomers = Number(customerCountRow?.n ?? 0)

  if (existingCustomers > 0 && !RESET) {
    console.error(
      "Er staan al klanten in de database. Voer opnieuw uit met --reset om eerst alle klantdata te wissen:\n  npm run seed -- --reset"
    )
    process.exit(1)
  }

  const insertedCustomers = await db.insert(schema.customers).values(CUSTOMERS).returning()
  console.log(`✅ ${insertedCustomers.length} klanten aangemaakt`)

  const contactRows: Array<{
    customerId: number
    type: string
    subject: string
    content: string | null
    contactDate: Date
    followUpDate: Date | null
    followUpDone: boolean
  }> = []

  insertedCustomers.forEach((c, idx) => {
    const nContacts = 2 + (idx % 4)
    for (let k = 0; k < nContacts; k++) {
      const t = CONTACT_TYPES[(idx + k) % CONTACT_TYPES.length]
      contactRows.push({
        customerId: c.id,
        type: t,
        subject:
          k === 0
            ? "Eerste kennismaking"
            : k === 1
              ? "Vervolg en scope"
              : k === 2
                ? "Technische details"
                : "Afspraak planning",
        content:
          t === "call"
            ? "Kort telefoongesprek over behoeften en planning."
            : t === "email"
              ? "E-mail met documentatie en voorstel voor volgende stap."
              : t === "meeting"
                ? "Teams-vergadering met stakeholders; actiepunten vastgelegd."
                : t === "demo"
                  ? "Live demo van het platform; positieve feedback."
                  : t === "follow-up"
                    ? "Follow-up op openstaande vragen."
                    : "Interne notitie bijgewerkt.",
        contactDate: daysAgo(3 + idx * 2 + k * 5),
        followUpDate: k % 2 === 0 ? daysFromNow(7 + k) : null,
        followUpDone: idx % 3 === 0 && k === 0,
      })
    }
  })

  await db.insert(schema.customerContacts).values(contactRows)
  console.log(`✅ ${contactRows.length} contactmomenten aangemaakt`)

  const quoteSpecs: Array<{
    customerIndex: number
    title: string
    status: string
    validDaysFromNow: number
    lines: LineInput[]
  }> = [
    { customerIndex: 0, title: "AI Chatbot implementatie", status: "sent", validDaysFromNow: 30, lines: [
      { description: "AI Chatbot ontwikkeling", quantity: "1", unit: "stuks", unitPrice: "5000", btwPercentage: "21" },
      { description: "Training medewerkers", quantity: "2", unit: "dag", unitPrice: "1500", btwPercentage: "21" },
    ]},
    { customerIndex: 0, title: "Support jaar 2", status: "draft", validDaysFromNow: 60, lines: [
      { description: "Support & SLA", quantity: "12", unit: "maand", unitPrice: "250", btwPercentage: "21" },
    ]},
    { customerIndex: 1, title: "SEO Content AI", status: "accepted", validDaysFromNow: 14, lines: [
      { description: "Contentstrategie", quantity: "16", unit: "uur", unitPrice: "125", btwPercentage: "21" },
    ]},
    { customerIndex: 2, title: "Data-integratie API", status: "draft", validDaysFromNow: 45, lines: [
      { description: "API koppelingen", quantity: "5", unit: "dag", unitPrice: "950", btwPercentage: "21" },
    ]},
    { customerIndex: 3, title: "Energie rapportage dashboard", status: "sent", validDaysFromNow: 21, lines: [
      { description: "Dashboard bouw", quantity: "1", unit: "stuks", unitPrice: "12000", btwPercentage: "21" },
      { description: "Workshops", quantity: "3", unit: "dag", unitPrice: "800", btwPercentage: "21" },
    ]},
    { customerIndex: 4, title: "Route-optimalisatie AI", status: "rejected", validDaysFromNow: 10, lines: [
      { description: "Proof of concept", quantity: "10", unit: "uur", unitPrice: "140", btwPercentage: "21" },
    ]},
    { customerIndex: 5, title: "Urenregistratie module", status: "expired", validDaysFromNow: -5, lines: [
      { description: "Analyse & ontwerp", quantity: "1", unit: "stuks", unitPrice: "3500", btwPercentage: "21" },
    ]},
    { customerIndex: 6, title: "Voorraad voorspelling", status: "sent", validDaysFromNow: 28, lines: [
      { description: "Model training", quantity: "20", unit: "uur", unitPrice: "135", btwPercentage: "21" },
    ]},
    { customerIndex: 7, title: "Compliance monitoring", status: "draft", validDaysFromNow: 90, lines: [
      { description: "Regelset inrichting", quantity: "4", unit: "dag", unitPrice: "1100", btwPercentage: "21" },
    ]},
    { customerIndex: 8, title: "Projectplanning tool", status: "accepted", validDaysFromNow: 20, lines: [
      { description: "Implementatie fase 1", quantity: "1", unit: "stuks", unitPrice: "18500", btwPercentage: "21" },
    ]},
    { customerIndex: 9, title: "Video content pipeline", status: "sent", validDaysFromNow: 35, lines: [
      { description: "Automatisering renders", quantity: "8", unit: "uur", unitPrice: "95", btwPercentage: "21" },
    ]},
  ]

  const quoteIdBySpecIndex: number[] = []
  for (let i = 0; i < quoteSpecs.length; i++) {
    const spec = quoteSpecs[i]
    const cust = insertedCustomers[spec.customerIndex]
    if (!cust) continue

    const totals = totalsForLines(spec.lines)
    const quoteNumber = await nextQuoteNumber()
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + spec.validDaysFromNow)
    const validUntilStr = validUntil.toISOString().split("T")[0]

    const [q] = await db
      .insert(schema.quotes)
      .values({
        quoteNumber,
        customerId: cust.id,
        title: spec.title,
        status: spec.status,
        validUntil: validUntilStr,
        subtotal: String(totals.subtotal.toFixed(2)),
        btwPercentage: "21",
        btwAmount: String(totals.btwAmount.toFixed(2)),
        total: String(totals.total.toFixed(2)),
        notes: "Testdata — gegenereerd door seed script.",
        terms: "Betaling binnen 30 dagen na acceptatie, tenzij anders overeengekomen.",
      })
      .returning()

    quoteIdBySpecIndex[i] = q.id

    await db.insert(schema.quoteLines).values(
      spec.lines.map((l, order) => {
        const qty = parseFloat(l.quantity)
        const price = parseFloat(l.unitPrice)
        return {
          quoteId: q.id,
          description: l.description,
          quantity: l.quantity,
          unit: l.unit,
          unitPrice: l.unitPrice,
          btwPercentage: l.btwPercentage,
          lineTotal: String((qty * price).toFixed(2)),
          sortOrder: order,
        }
      })
    )
  }
  console.log(`✅ ${quoteSpecs.length} offertes met regels aangemaakt`)

  type InvSpec = {
    customerIndex: number
    quoteSpecIndex?: number
    title: string
    status: string
    invoiceDaysAgo: number
    dueDaysFromNow: number
    paid?: boolean
    lines: LineInput[]
  }

  const invoiceSpecs: InvSpec[] = [
    {
      customerIndex: 1,
      quoteSpecIndex: 2,
      title: "Factuur SEO Content AI (milestone 1)",
      status: "sent",
      invoiceDaysAgo: 10,
      dueDaysFromNow: 20,
      lines: [
        { description: "Contentstrategie (deel 1)", quantity: "8", unit: "uur", unitPrice: "125", btwPercentage: "21" },
      ],
    },
    {
      customerIndex: 3,
      title: "Factuur dashboard (voorschot)",
      status: "paid",
      invoiceDaysAgo: 45,
      dueDaysFromNow: -15,
      paid: true,
      lines: [
        { description: "Voorschot 40%", quantity: "1", unit: "stuks", unitPrice: "4800", btwPercentage: "21" },
      ],
    },
    {
      customerIndex: 4,
      title: "Factuur PoC route-optimalisatie",
      status: "sent",
      invoiceDaysAgo: 5,
      dueDaysFromNow: 25,
      lines: [
        { description: "Uren PoC", quantity: "10", unit: "uur", unitPrice: "140", btwPercentage: "21" },
      ],
    },
    {
      customerIndex: 6,
      title: "Factuur voorraadmodel",
      status: "overdue",
      invoiceDaysAgo: 40,
      dueDaysFromNow: -5,
      lines: [
        { description: "Model training & evaluatie", quantity: "20", unit: "uur", unitPrice: "135", btwPercentage: "21" },
      ],
    },
    {
      customerIndex: 8,
      quoteSpecIndex: 9,
      title: "Factuur planning tool (milestone)",
      status: "sent",
      invoiceDaysAgo: 2,
      dueDaysFromNow: 28,
      lines: [
        { description: "Implementatie fase 1 (deelbetaling)", quantity: "1", unit: "stuks", unitPrice: "9250", btwPercentage: "21" },
      ],
    },
    {
      customerIndex: 9,
      title: "Factuur video pipeline",
      status: "draft",
      invoiceDaysAgo: 0,
      dueDaysFromNow: 30,
      lines: [
        { description: "Automatisering", quantity: "8", unit: "uur", unitPrice: "95", btwPercentage: "21" },
      ],
    },
  ]

  for (const inv of invoiceSpecs) {
    const cust = insertedCustomers[inv.customerIndex]
    const totals = totalsForLines(inv.lines)
    const invoiceNumber = await nextInvoiceNumber()
    const invDate = daysAgo(inv.invoiceDaysAgo)
    const due = daysFromNow(inv.dueDaysFromNow)
    const invDateStr = invDate.toISOString().split("T")[0]
    const dueStr = due.toISOString().split("T")[0]

    const quoteId =
      inv.quoteSpecIndex !== undefined ? quoteIdBySpecIndex[inv.quoteSpecIndex] : undefined

    const [row] = await db
      .insert(schema.invoices)
      .values({
        invoiceNumber,
        quoteId: quoteId ?? null,
        customerId: cust.id,
        title: inv.title,
        status: inv.status,
        invoiceDate: invDateStr,
        dueDate: dueStr,
        subtotal: String(totals.subtotal.toFixed(2)),
        btwPercentage: "21",
        btwAmount: String(totals.btwAmount.toFixed(2)),
        total: String(totals.total.toFixed(2)),
        notes: "Testdata — seed script.",
        terms: "Betaling binnen 30 dagen na factuurdatum.",
        paidAt: inv.paid ? invDate : null,
      })
      .returning()

    await db.insert(schema.invoiceLines).values(
      inv.lines.map((l, order) => {
        const qty = parseFloat(l.quantity)
        const price = parseFloat(l.unitPrice)
        return {
          invoiceId: row.id,
          description: l.description,
          quantity: l.quantity,
          unit: l.unit,
          unitPrice: l.unitPrice,
          btwPercentage: l.btwPercentage,
          lineTotal: String((qty * price).toFixed(2)),
          sortOrder: order,
        }
      })
    )
  }

  console.log(`✅ ${invoiceSpecs.length} facturen met regels aangemaakt`)
  console.log("🎉 Seeding klaar!")
  if (!RESET) {
    console.log("ℹ️  Tip: voer opnieuw uit met --reset om eerst klantdata te wissen (voorkomt dubbele testklanten).")
  }
  process.exit(0)
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
