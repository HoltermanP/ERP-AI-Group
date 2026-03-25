import { NextResponse } from "next/server"
import { getInvoice } from "@/lib/actions/invoices"
import { getCompanyProfile } from "@/lib/actions/company"
import { renderToBuffer } from "@react-pdf/renderer"
import { InvoicePDF } from "@/components/pdf/InvoicePDF"
import React from "react"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const [invoice, company] = await Promise.all([
      getInvoice(parseInt(id)),
      getCompanyProfile(),
    ])

    if (!invoice) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = React.createElement(InvoicePDF, { invoice, company }) as any
    const buffer = await renderToBuffer(element)

    return new Response(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 })
  }
}
