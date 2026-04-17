import { notFound } from "next/navigation"
import Link from "next/link"
import { getCustomer } from "@/lib/actions/customers"
import { getProjectsByCustomer } from "@/lib/actions/projects"
import { Card, CardHeader, CardBody } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { ContactLogItem } from "@/components/customers/ContactLogItem"
import { ContactForm } from "@/components/customers/ContactForm"
import { formatCurrency, formatDate } from "@/lib/utils/formatters"
import { Pencil, Mail, Phone, MapPin, Building2, Plus } from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params
  const [customer, projects] = await Promise.all([
    getCustomer(parseInt(id)),
    getProjectsByCustomer(parseInt(id)),
  ])

  if (!customer) notFound()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold" style={{ color: "#F4F6FA" }}>
              {customer.companyName}
            </h1>
            <Badge status={customer.status || "active"} />
          </div>
          {customer.contactName && (
            <p className="mt-1 text-sm" style={{ color: "#6B82A8" }}>
              Contactpersoon: {customer.contactName}
            </p>
          )}
        </div>
        <Link href={`/customers/${customer.id}/edit`}>
          <Button variant="secondary" size="sm">
            <Pencil size={14} />
            Bewerken
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-sm" style={{ color: "#F4F6FA" }}>Klantgegevens</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              {customer.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={14} style={{ color: "#6B82A8" }} />
                  <a href={`mailto:${customer.email}`} style={{ color: "#4B8EFF" }}>
                    {customer.email}
                  </a>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={14} style={{ color: "#6B82A8" }} />
                  <span style={{ color: "#F4F6FA" }}>{customer.phone}</span>
                </div>
              )}
              {(customer.address || customer.city) && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin size={14} style={{ color: "#6B82A8", marginTop: "2px" }} />
                  <div style={{ color: "#F4F6FA" }}>
                    {customer.address && <div>{customer.address}</div>}
                    {(customer.postalCode || customer.city) && (
                      <div>
                        {customer.postalCode} {customer.city}
                      </div>
                    )}
                    {customer.country && <div>{customer.country}</div>}
                  </div>
                </div>
              )}
              {(customer.kvk || customer.btw) && (
                <div className="flex items-start gap-2 text-sm">
                  <Building2 size={14} style={{ color: "#6B82A8", marginTop: "2px" }} />
                  <div style={{ color: "#6B82A8" }}>
                    {customer.kvk && <div>KvK: {customer.kvk}</div>}
                    {customer.btw && <div>BTW: {customer.btw}</div>}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm" style={{ color: "#F4F6FA" }}>
                  Projecten ({projects.length})
                </h2>
                <Link href={`/projects/new?customerId=${customer.id}`}>
                  <button className="flex items-center gap-1 text-xs" style={{ color: "#4B8EFF" }}>
                    <Plus size={12} />Nieuw
                  </button>
                </Link>
              </div>
            </CardHeader>
            <CardBody className="!px-0 !py-0">
              {!projects.length ? (
                <p className="px-6 py-4 text-sm" style={{ color: "#6B82A8" }}>Geen projecten</p>
              ) : (
                <div className="divide-y" style={{ borderColor: "#1E2130" }}>
                  {projects.map((p) => (
                    <Link key={p.id} href={`/projects/${p.id}`}>
                      <div className="px-6 py-3 hover:bg-[#16161C] transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono" style={{ color: "#4B8EFF" }}>{p.projectNumber}</span>
                          <Badge status={p.status || "concept"} />
                        </div>
                        <p className="text-sm font-medium mt-0.5" style={{ color: "#F4F6FA" }}>{p.name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Quotes */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-sm" style={{ color: "#F4F6FA" }}>
                Offertes ({customer.quotes?.length || 0})
              </h2>
            </CardHeader>
            <CardBody className="!px-0 !py-0">
              {!customer.quotes?.length ? (
                <p className="px-6 py-4 text-sm" style={{ color: "#6B82A8" }}>Geen offertes</p>
              ) : (
                <div className="divide-y" style={{ borderColor: "#1E2130" }}>
                  {customer.quotes.map((q) => (
                    <Link key={q.id} href={`/quotes/${q.id}`}>
                      <div className="px-6 py-3 hover:bg-[#16161C] transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium" style={{ color: "#4B8EFF" }}>
                            {q.quoteNumber}
                          </span>
                          <Badge status={q.status || "draft"} />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs truncate" style={{ color: "#6B82A8" }}>{q.title}</span>
                          <span className="text-xs font-mono" style={{ color: "#F4F6FA" }}>
                            {formatCurrency(q.total)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Invoices */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-sm" style={{ color: "#F4F6FA" }}>
                Facturen ({customer.invoices?.length || 0})
              </h2>
            </CardHeader>
            <CardBody className="!px-0 !py-0">
              {!customer.invoices?.length ? (
                <p className="px-6 py-4 text-sm" style={{ color: "#6B82A8" }}>Geen facturen</p>
              ) : (
                <div className="divide-y" style={{ borderColor: "#1E2130" }}>
                  {customer.invoices.map((inv) => (
                    <Link key={inv.id} href={`/invoices/${inv.id}`}>
                      <div className="px-6 py-3 hover:bg-[#16161C] transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium" style={{ color: "#4B8EFF" }}>
                            {inv.invoiceNumber}
                          </span>
                          <Badge status={inv.status || "draft"} />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs" style={{ color: "#6B82A8" }}>
                            {formatDate(inv.invoiceDate)}
                          </span>
                          <span className="text-xs font-mono" style={{ color: "#F4F6FA" }}>
                            {formatCurrency(inv.total)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right: Contact Log */}
        <div className="lg:col-span-2 space-y-4">
          {/* Add contact form */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-sm" style={{ color: "#F4F6FA" }}>Contactmoment toevoegen</h2>
            </CardHeader>
            <CardBody>
              <ContactForm customerId={customer.id} />
            </CardBody>
          </Card>

          {/* Contact history */}
          <div>
            <h2 className="font-semibold text-sm mb-3" style={{ color: "#F4F6FA" }}>
              Contacthistorie ({customer.contacts?.length || 0})
            </h2>
            {!customer.contacts?.length ? (
              <div
                className="text-center py-8 rounded-xl"
                style={{ background: "#111116", border: "1px solid #1E2130" }}
              >
                <p className="text-sm" style={{ color: "#6B82A8" }}>Nog geen contactmomenten</p>
              </div>
            ) : (
              <div className="space-y-3">
                {customer.contacts.map((contact) => (
                  <ContactLogItem key={contact.id} contact={contact} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
