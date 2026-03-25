"use client"

import { useState } from "react"
import { formatDate } from "@/lib/utils/formatters"
import { markFollowUpDone } from "@/lib/actions/contacts"
import { Button } from "@/components/ui/Button"
import { useRouter } from "next/navigation"
import type { CustomerContact } from "@/lib/db/schema"
import { Phone, Mail, Users, FileText, ArrowRight, StickyNote } from "lucide-react"

const typeIcons: Record<string, React.ReactNode> = {
  call: <Phone size={14} />,
  email: <Mail size={14} />,
  meeting: <Users size={14} />,
  demo: <FileText size={14} />,
  "follow-up": <ArrowRight size={14} />,
  note: <StickyNote size={14} />,
}

const typeLabels: Record<string, string> = {
  call: "Telefoongesprek",
  email: "E-mail",
  meeting: "Vergadering",
  demo: "Demo",
  "follow-up": "Follow-up",
  note: "Notitie",
}

export function ContactLogItem({ contact }: { contact: CustomerContact }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleMarkDone() {
    setLoading(true)
    await markFollowUpDone(contact.id)
    router.refresh()
    setLoading(false)
  }

  return (
    <div
      className="p-4 rounded-lg"
      style={{ background: "#16161C", border: "1px solid #1E2130" }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: "#1A2A4A", color: "#4B8EFF" }}
        >
          {typeIcons[contact.type] || <StickyNote size={14} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: "#F4F6FA" }}>
                {contact.subject}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "#1E2130", color: "#6B82A8" }}
              >
                {typeLabels[contact.type] || contact.type}
              </span>
            </div>
            <span className="text-xs" style={{ color: "#6B82A8" }}>
              {formatDate(contact.contactDate)}
            </span>
          </div>
          {contact.content && (
            <p className="mt-1.5 text-sm" style={{ color: "#6B82A8" }}>
              {contact.content}
            </p>
          )}
          {contact.followUpDate && (
            <div className="mt-2 flex items-center gap-2">
              <span
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  background: contact.followUpDone ? "#0A2A1A" : "#2A1000",
                  color: contact.followUpDone ? "#2DD68A" : "#FF4D1C",
                }}
              >
                Follow-up: {formatDate(contact.followUpDate)}
                {contact.followUpDone ? " ✓" : ""}
              </span>
              {!contact.followUpDone && (
                <Button size="sm" variant="ghost" onClick={handleMarkDone} loading={loading}>
                  Afgerond
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
