import { NextResponse } from "next/server"
import { getQuote } from "@/lib/actions/quotes"
import { getCompanyProfile } from "@/lib/actions/company"
import { renderToBuffer } from "@react-pdf/renderer"
import { QuotePDF } from "@/components/pdf/QuotePDF"
import React from "react"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const [quote, company] = await Promise.all([
      getQuote(parseInt(id)),
      getCompanyProfile(),
    ])

    if (!quote) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = React.createElement(QuotePDF, { quote, company }) as any
    const buffer = await renderToBuffer(element)

    return new Response(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${quote.quoteNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 })
  }
}
