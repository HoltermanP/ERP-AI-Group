import "dotenv/config"
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "../lib/db/schema"

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

async function seed() {
  console.log("🌱 Seeding database...")

  // Company profile
  const [company] = await db
    .insert(schema.companyProfile)
    .values({
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
    .returning()
    .onConflictDoNothing()

  console.log("✅ Company profile created")

  // Customers
  const [c1, c2, c3] = await db
    .insert(schema.customers)
    .values([
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
        status: "active",
      },
    ])
    .returning()

  console.log(`✅ ${[c1, c2, c3].length} customers created`)

  // Contact moments
  await db.insert(schema.customerContacts).values([
    {
      customerId: c1.id,
      type: "call",
      subject: "Introductiegesprek AI-implementatie",
      content: "Gesproken over mogelijkheden voor AI in hun workflow. Interesse in AI chatbot.",
      contactDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      followUpDone: false,
    },
    {
      customerId: c2.id,
      type: "meeting",
      subject: "Demo AI-platform",
      content: "Demo gegeven van ons AI-platform. Positieve reactie. Offerte wordt verwacht.",
      contactDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      followUpDone: false,
    },
  ])

  console.log("✅ Contact moments created")

  // Quote
  const year = new Date().getFullYear()
  const [quote] = await db
    .insert(schema.quotes)
    .values({
      quoteNumber: `OFF-${year}-001`,
      customerId: c1.id,
      title: "AI Chatbot implementatie",
      status: "sent",
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      subtotal: "8500.00",
      btwPercentage: "21",
      btwAmount: "1785.00",
      total: "10285.00",
      notes: "Inclusief 3 maanden support na livegang.",
      terms: "50% aanbetaling bij opdracht, 50% na oplevering.",
    })
    .returning()

  await db.insert(schema.quoteLines).values([
    {
      quoteId: quote.id,
      description: "AI Chatbot ontwikkeling en implementatie",
      quantity: "1",
      unit: "stuks",
      unitPrice: "5000.00",
      btwPercentage: "21",
      lineTotal: "5000.00",
      sortOrder: 0,
    },
    {
      quoteId: quote.id,
      description: "Training en onboarding medewerkers",
      quantity: "2",
      unit: "dag",
      unitPrice: "1500.00",
      btwPercentage: "21",
      lineTotal: "3000.00",
      sortOrder: 1,
    },
    {
      quoteId: quote.id,
      description: "Support pakket (3 maanden)",
      quantity: "1",
      unit: "stuks",
      unitPrice: "500.00",
      btwPercentage: "21",
      lineTotal: "500.00",
      sortOrder: 2,
    },
  ])

  console.log("✅ Quote created:", quote.quoteNumber)

  // Invoice
  const [invoice] = await db
    .insert(schema.invoices)
    .values({
      invoiceNumber: `FAC-${year}-001`,
      customerId: c2.id,
      title: "SEO Content AI-optimalisatie",
      status: "sent",
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      subtotal: "2400.00",
      btwPercentage: "21",
      btwAmount: "504.00",
      total: "2904.00",
      terms: "Betaling binnen 30 dagen na factuurdatum.",
    })
    .returning()

  await db.insert(schema.invoiceLines).values([
    {
      invoiceId: invoice.id,
      description: "AI Content strategie en implementatie",
      quantity: "8",
      unit: "uur",
      unitPrice: "150.00",
      btwPercentage: "21",
      lineTotal: "1200.00",
      sortOrder: 0,
    },
    {
      invoiceId: invoice.id,
      description: "AI SEO analyse en rapportage",
      quantity: "4",
      unit: "uur",
      unitPrice: "150.00",
      btwPercentage: "21",
      lineTotal: "600.00",
      sortOrder: 1,
    },
    {
      invoiceId: invoice.id,
      description: "Content kalender setup",
      quantity: "1",
      unit: "stuks",
      unitPrice: "600.00",
      btwPercentage: "21",
      lineTotal: "600.00",
      sortOrder: 2,
    },
  ])

  console.log("✅ Invoice created:", invoice.invoiceNumber)
  console.log("🎉 Seeding complete!")
  process.exit(0)
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
