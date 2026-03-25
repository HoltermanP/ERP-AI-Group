import { getContacts } from "@/lib/actions/contacts"
import { Card } from "@/components/ui/Card"
import { ContactLogItem } from "@/components/customers/ContactLogItem"
import Link from "next/link"
import { MessageSquare } from "lucide-react"
import { EmptyState } from "@/components/ui/Table"

export const dynamic = "force-dynamic"

export default async function ContactsPage() {
  const contacts = await getContacts()

  const followUpPending = contacts.filter((c) => c.followUpDate && !c.followUpDone)
  const rest = contacts.filter((c) => !c.followUpDate || c.followUpDone)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#F4F6FA" }}>Contactmomenten</h1>
        <p className="mt-1 text-sm" style={{ color: "#6B82A8" }}>
          {contacts.length} contactmoment{contacts.length !== 1 ? "en" : ""} totaal
        </p>
      </div>

      {contacts.length === 0 ? (
        <Card>
          <EmptyState
            icon={<MessageSquare size={48} />}
            title="Nog geen contactmomenten"
            description="Voeg contactmomenten toe via een klantpagina"
          />
        </Card>
      ) : (
        <>
          {followUpPending.length > 0 && (
            <div>
              <h2 className="font-semibold text-sm mb-3" style={{ color: "#FF4D1C" }}>
                Follow-ups vereist ({followUpPending.length})
              </h2>
              <div className="space-y-3">
                {followUpPending.map((contact) => (
                  <div key={contact.id}>
                    <div className="flex items-center gap-2 mb-1">
                      <Link href={`/customers/${contact.customerId}`}>
                        <span className="text-xs font-medium" style={{ color: "#4B8EFF" }}>
                          {contact.customer?.companyName}
                        </span>
                      </Link>
                    </div>
                    <ContactLogItem contact={contact} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="font-semibold text-sm mb-3" style={{ color: "#F4F6FA" }}>
              Alle contactmomenten
            </h2>
            <div className="space-y-3">
              {rest.map((contact) => (
                <div key={contact.id}>
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/customers/${contact.customerId}`}>
                      <span className="text-xs font-medium" style={{ color: "#4B8EFF" }}>
                        {contact.customer?.companyName}
                      </span>
                    </Link>
                  </div>
                  <ContactLogItem contact={contact} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
