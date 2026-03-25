"use client"

import { useState } from "react"
import { Input, Textarea, Select } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { createContact } from "@/lib/actions/contacts"
import { useRouter } from "next/navigation"

interface ContactFormProps {
  customerId: number
  onSuccess?: () => void
}

export function ContactForm({ customerId, onSuccess }: ContactFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = e.currentTarget
    const subject = (form.elements.namedItem("subject") as HTMLInputElement).value
    const type = (form.elements.namedItem("type") as HTMLSelectElement).value
    const content = (form.elements.namedItem("content") as HTMLTextAreaElement).value
    const contactDate = (form.elements.namedItem("contactDate") as HTMLInputElement).value
    const followUpDate = (form.elements.namedItem("followUpDate") as HTMLInputElement).value

    if (!subject || !type) {
      setError("Type en onderwerp zijn verplicht")
      setLoading(false)
      return
    }

    const result = await createContact({
      customerId,
      type,
      subject,
      content: content || undefined,
      contactDate: contactDate ? new Date(contactDate) : new Date(),
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
    })

    if (result.success) {
      form.reset()
      router.refresh()
      onSuccess?.()
    } else {
      setError(result.error || "Er is een fout opgetreden")
    }
    setLoading(false)
  }

  const today = new Date().toISOString().slice(0, 16)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          className="px-4 py-3 rounded-md text-sm"
          style={{ background: "#2A1010", color: "#FF6B6B", border: "1px solid #FF6B6B20" }}
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Type *"
          name="type"
          options={[
            { value: "call", label: "Telefoongesprek" },
            { value: "email", label: "E-mail" },
            { value: "meeting", label: "Vergadering" },
            { value: "demo", label: "Demo" },
            { value: "follow-up", label: "Follow-up" },
            { value: "note", label: "Notitie" },
          ]}
        />
        <Input
          label="Datum *"
          name="contactDate"
          type="datetime-local"
          defaultValue={today}
        />
        <div className="md:col-span-2">
          <Input
            label="Onderwerp *"
            name="subject"
            placeholder="Introductiegesprek over AI-diensten"
            required
          />
        </div>
        <div className="md:col-span-2">
          <Textarea
            label="Inhoud"
            name="content"
            placeholder="Wat is er besproken of afgesproken?"
          />
        </div>
        <Input
          label="Follow-up datum"
          name="followUpDate"
          type="datetime-local"
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" loading={loading} size="sm">
          Contactmoment opslaan
        </Button>
      </div>
    </form>
  )
}
