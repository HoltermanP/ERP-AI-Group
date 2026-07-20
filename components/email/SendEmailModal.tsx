"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { Input, Textarea } from "@/components/ui/Input"
import { sendQuoteEmail, sendInvoiceEmail } from "@/lib/actions/email"
import { Mail, Paperclip, CheckCircle } from "lucide-react"

interface SendEmailModalProps {
  kind: "quote" | "invoice"
  documentId: number
  attachmentName: string
  defaultTo: string
  defaultSubject: string
  defaultBody: string
  smtpConfigured: boolean
}

export function SendEmailModal({
  kind,
  documentId,
  attachmentName,
  defaultTo,
  defaultSubject,
  defaultBody,
  smtpConfigured,
}: SendEmailModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [to, setTo] = useState(defaultTo)
  const [subject, setSubject] = useState(defaultSubject)
  const [body, setBody] = useState(defaultBody)

  const docLabel = kind === "quote" ? "offerte" : "factuur"

  async function handleSend() {
    setLoading(true)
    setError(null)
    const action = kind === "quote" ? sendQuoteEmail : sendInvoiceEmail
    const result = await action(documentId, { to, subject, body })
    setLoading(false)
    if (result.success) {
      setSent(true)
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  function handleClose() {
    if (loading) return
    setOpen(false)
    setSent(false)
    setError(null)
  }

  return (
    <>
      <Button variant="cta" size="sm" onClick={() => setOpen(true)}>
        <Mail size={14} />
        E-mail versturen
      </Button>

      <Modal
        isOpen={open}
        onClose={handleClose}
        title={`${docLabel === "offerte" ? "Offerte" : "Factuur"} per e-mail versturen`}
        size="lg"
      >
        {sent ? (
          <div className="space-y-4 py-4 text-center">
            <CheckCircle size={40} className="mx-auto" style={{ color: "#2DD68A" }} />
            <p className="text-sm" style={{ color: "#F4F6FA" }}>
              De {docLabel} is verzonden naar <span style={{ color: "#4B8EFF" }}>{to}</span>.
            </p>
            <Button variant="secondary" size="sm" onClick={handleClose}>
              Sluiten
            </Button>
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            {!smtpConfigured && (
              <div
                className="px-4 py-3 rounded-md text-sm"
                style={{ background: "#2A2010", color: "#FFB347", border: "1px solid #FFB34720" }}
              >
                SMTP is nog niet geconfigureerd. Vul SMTP_HOST, SMTP_USER en SMTP_PASS in bij de
                environment-variabelen (.env.local) om te kunnen verzenden via de mailserver van
                ai-group.nl.
              </div>
            )}

            <Input
              label="Aan"
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="klant@bedrijf.nl"
              hint="Meerdere adressen scheiden met een komma."
            />
            <Input
              label="Onderwerp"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <Textarea
              label="Bericht"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              style={{ minHeight: "220px" }}
              hint="Uw handtekening en logo worden automatisch toegevoegd (beheer via Instellingen)."
            />

            <div
              className="flex items-center gap-2 px-3 py-2 rounded-md"
              style={{ background: "#16161C", border: "1px solid #1E2130", color: "#6B82A8" }}
            >
              <Paperclip size={14} />
              <span className="font-mono text-xs">{attachmentName}</span>
              <span className="text-xs">wordt als PDF-bijlage meegestuurd</span>
            </div>

            {error && (
              <p className="text-sm" style={{ color: "#FF6B6B" }}>
                {error}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="cta" size="sm" onClick={handleSend} loading={loading} disabled={!smtpConfigured}>
                <Mail size={14} />
                Versturen
              </Button>
              <Button variant="secondary" size="sm" onClick={handleClose} disabled={loading}>
                Annuleren
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
