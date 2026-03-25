import { db } from "@/lib/db"
import { customers, quotes, invoices } from "@/lib/db/schema"
import { eq, and, lt, gte, sql } from "drizzle-orm"
import { KPICard } from "@/components/dashboard/KPICard"
import { Card, CardHeader, CardBody } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { formatCurrency, formatDate } from "@/lib/utils/formatters"
import { Users, FileText, Receipt, TrendingUp } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

async function getDashboardData() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

  const [
    activeCustomers,
    openQuotes,
    allInvoices,
    recentContacts,
    upcomingDue,
    pendingQuotes,
  ] = await Promise.all([
    db.select({ count: sql<number>`COUNT(*)` })
      .from(customers)
      .where(eq(customers.status, "active")),
    db.select({ count: sql<number>`COUNT(*)` })
      .from(quotes)
      .where(sql`status IN ('draft','sent')`),
    db.query.invoices.findMany({
      with: { customer: true },
      orderBy: (i, { desc }) => [desc(i.createdAt)],
    }),
    db.query.customerContacts.findMany({
      with: { customer: true },
      orderBy: (c, { desc }) => [desc(c.contactDate)],
      limit: 5,
    }),
    db.query.invoices.findMany({
      where: and(
        eq(invoices.status, "sent"),
        lt(invoices.dueDate, in14Days.toISOString().split("T")[0])
      ),
      with: { customer: true },
      limit: 5,
    }),
    db.query.quotes.findMany({
      where: eq(quotes.status, "sent"),
      with: { customer: true },
      limit: 5,
    }),
  ])

  const openInvoicesTotal = allInvoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((sum, i) => sum + parseFloat(i.total || "0"), 0)

  const monthlyRevenue = allInvoices
    .filter((i) => i.status === "paid" && i.paidAt && new Date(i.paidAt) >= startOfMonth)
    .reduce((sum, i) => sum + parseFloat(i.total || "0"), 0)

  return {
    activeCustomers: Number(activeCustomers[0].count),
    openQuotes: Number(openQuotes[0].count),
    openInvoicesTotal,
    monthlyRevenue,
    recentContacts,
    upcomingDue,
    pendingQuotes,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#F4F6FA" }}>
          <span style={{ color: "#4B8EFF" }}>AI</span>-Group ERP
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#6B82A8" }}>Overzicht van je bedrijf</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          label="Actieve klanten"
          value={data.activeCustomers}
          icon={<Users size={20} />}
        />
        <KPICard
          label="Open offertes"
          value={data.openQuotes}
          icon={<FileText size={20} />}
        />
        <KPICard
          label="Openstaande facturen"
          value={formatCurrency(data.openInvoicesTotal).replace("€\u00a0", "€ ")}
          icon={<Receipt size={20} />}
        />
        <KPICard
          label="Omzet deze maand"
          value={formatCurrency(data.monthlyRevenue).replace("€\u00a0", "€ ")}
          icon={<TrendingUp size={20} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent contacts */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="font-semibold text-base" style={{ color: "#F4F6FA" }}>
              Laatste contactmomenten
            </h2>
          </CardHeader>
          <CardBody className="!px-0 !py-0">
            {data.recentContacts.length === 0 ? (
              <div className="px-6 py-8 text-center" style={{ color: "#6B82A8" }}>
                <p className="text-sm">Geen contactmomenten</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "#1E2130" }}>
                {data.recentContacts.map((contact) => (
                  <div key={contact.id} className="px-6 py-3">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "#F4F6FA" }}>
                          {contact.subject}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "#6B82A8" }}>
                          {contact.customer?.companyName} · {contact.type}
                        </p>
                      </div>
                      <p className="text-xs ml-2 shrink-0" style={{ color: "#6B82A8" }}>
                        {formatDate(contact.contactDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Upcoming due invoices */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="font-semibold text-base" style={{ color: "#F4F6FA" }}>
              Facturen bijna verlopen
            </h2>
          </CardHeader>
          <CardBody className="!px-0 !py-0">
            {data.upcomingDue.length === 0 ? (
              <div className="px-6 py-8 text-center" style={{ color: "#6B82A8" }}>
                <p className="text-sm">Geen verlopende facturen</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "#1E2130" }}>
                {data.upcomingDue.map((invoice) => (
                  <Link key={invoice.id} href={`/invoices/${invoice.id}`}>
                    <div className="px-6 py-3 hover:bg-[#111116] transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: "#F4F6FA" }}>
                            {invoice.invoiceNumber}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "#6B82A8" }}>
                            {invoice.customer?.companyName}
                          </p>
                        </div>
                        <div className="text-right ml-2">
                          <p className="text-sm font-mono font-bold" style={{ color: "#FF4D1C" }}>
                            {formatCurrency(invoice.total)}
                          </p>
                          <p className="text-xs" style={{ color: "#6B82A8" }}>
                            {formatDate(invoice.dueDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Pending quotes */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="font-semibold text-base" style={{ color: "#F4F6FA" }}>
              Offertes die wachten op acceptatie
            </h2>
          </CardHeader>
          <CardBody className="!px-0 !py-0">
            {data.pendingQuotes.length === 0 ? (
              <div className="px-6 py-8 text-center" style={{ color: "#6B82A8" }}>
                <p className="text-sm">Geen openstaande offertes</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "#1E2130" }}>
                {data.pendingQuotes.map((quote) => (
                  <Link key={quote.id} href={`/quotes/${quote.id}`}>
                    <div className="px-6 py-3 hover:bg-[#111116] transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: "#F4F6FA" }}>
                            {quote.quoteNumber}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "#6B82A8" }}>
                            {quote.customer?.companyName}
                          </p>
                        </div>
                        <div className="text-right ml-2">
                          <p className="text-sm font-mono font-bold" style={{ color: "#4B8EFF" }}>
                            {formatCurrency(quote.total)}
                          </p>
                          <Badge status={quote.status || "draft"} />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
