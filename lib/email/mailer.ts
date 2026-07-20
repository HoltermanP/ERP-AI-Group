import nodemailer from "nodemailer"

/**
 * SMTP-configuratie voor verzending via de mailserver van ai-group.nl.
 * Vereist in .env.local (zie .env.example):
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS en optioneel SMTP_FROM / SMTP_SECURE.
 */
export function getSmtpConfigError(): string | null {
  const missing = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"].filter((key) => !process.env[key]?.trim())
  if (missing.length > 0) {
    return `SMTP is nog niet geconfigureerd: vul ${missing.join(", ")} in bij de environment-variabelen (.env.local).`
  }
  return null
}

export function isSmtpConfigured(): boolean {
  return getSmtpConfigError() === null
}

function createTransport() {
  const port = parseInt(process.env.SMTP_PORT || "587", 10)
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === "true"
    : port === 465

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export interface MailAttachment {
  filename: string
  content: Buffer
  contentType?: string
}

export async function sendMail(options: {
  to: string
  subject: string
  html: string
  text: string
  attachments?: MailAttachment[]
  fromName?: string
}): Promise<void> {
  const configError = getSmtpConfigError()
  if (configError) throw new Error(configError)

  const fromAddress = process.env.SMTP_FROM?.trim() || process.env.SMTP_USER!.trim()
  const from = options.fromName ? `"${options.fromName.replace(/"/g, "")}" <${fromAddress}>` : fromAddress

  const transport = createTransport()
  await transport.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    attachments: options.attachments,
  })
}
