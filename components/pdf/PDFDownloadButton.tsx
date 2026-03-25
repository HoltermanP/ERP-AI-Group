"use client"

import { Button } from "@/components/ui/Button"
import { FileDown } from "lucide-react"

interface PDFDownloadButtonProps {
  href: string
  label?: string
}

export function PDFDownloadButton({ href, label = "PDF downloaden" }: PDFDownloadButtonProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      <Button variant="secondary" size="sm">
        <FileDown size={14} />
        {label}
      </Button>
    </a>
  )
}
