"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { formatCurrency } from "@/lib/utils/formatters"
import { Plus, Trash2 } from "lucide-react"

export interface LineItem {
  id?: number
  description: string
  quantity: string
  unit: string
  unitPrice: string
  btwPercentage: string
  lineTotal?: number
}

const unitOptions = ["stuks", "uur", "dag", "maand"]

interface QuoteLineEditorProps {
  initialLines?: LineItem[]
  onChange?: (lines: LineItem[], totals: { subtotal: number; btwAmount: number; total: number }) => void
}

function calcLineTotal(line: LineItem): number {
  return (parseFloat(line.quantity) || 0) * (parseFloat(line.unitPrice) || 0)
}

function calcTotals(lines: LineItem[]): { subtotal: number; btwAmount: number; total: number } {
  const subtotal = lines.reduce((s, l) => s + calcLineTotal(l), 0)
  const btwAmount = lines.reduce((s, l) => {
    const lt = calcLineTotal(l)
    const btw = parseFloat(l.btwPercentage) || 0
    return s + lt * (btw / 100)
  }, 0)
  return { subtotal, btwAmount, total: subtotal + btwAmount }
}

export function QuoteLineEditor({ initialLines, onChange }: QuoteLineEditorProps) {
  const [lines, setLines] = useState<LineItem[]>(
    initialLines?.length
      ? initialLines
      : [{ description: "", quantity: "1", unit: "stuks", unitPrice: "0", btwPercentage: "21" }]
  )

  const totals = calcTotals(lines)

  useEffect(() => {
    onChange?.(lines, totals)
  }, [lines])

  function addLine() {
    setLines([...lines, { description: "", quantity: "1", unit: "stuks", unitPrice: "0", btwPercentage: "21" }])
  }

  function removeLine(index: number) {
    setLines(lines.filter((_, i) => i !== index))
  }

  function updateLine(index: number, field: keyof LineItem, value: string) {
    const updated = [...lines]
    updated[index] = { ...updated[index], [field]: value }
    setLines(updated)
  }

  const inputStyle = {
    background: "#16161C",
    border: "1px solid #1E2130",
    color: "#F4F6FA",
    padding: "6px 8px",
    borderRadius: "6px",
    fontSize: "13px",
    width: "100%",
    outline: "none",
  }

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: "separate", borderSpacing: "0 4px" }}>
          <thead>
            <tr>
              {["Omschrijving", "Aantal", "Eenheid", "Stukprijs", "BTW%", "Totaal", ""].map((h) => (
                <th
                  key={h}
                  className="text-left pb-2 text-xs font-semibold uppercase"
                  style={{ color: "#6B82A8", letterSpacing: "0.05em", paddingRight: "8px" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lines.map((line, i) => (
              <tr key={i}>
                <td style={{ paddingRight: "8px", width: "35%" }}>
                  <input
                    style={inputStyle}
                    placeholder="Omschrijving van dienst of product"
                    value={line.description}
                    onChange={(e) => updateLine(i, "description", e.target.value)}
                  />
                </td>
                <td style={{ paddingRight: "8px", width: "8%" }}>
                  <input
                    style={{ ...inputStyle, textAlign: "right" }}
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.quantity}
                    onChange={(e) => updateLine(i, "quantity", e.target.value)}
                  />
                </td>
                <td style={{ paddingRight: "8px", width: "10%" }}>
                  <select
                    style={{ ...inputStyle, appearance: "none" }}
                    value={line.unit}
                    onChange={(e) => updateLine(i, "unit", e.target.value)}
                  >
                    {unitOptions.map((u) => (
                      <option key={u} value={u} style={{ background: "#16161C" }}>{u}</option>
                    ))}
                  </select>
                </td>
                <td style={{ paddingRight: "8px", width: "14%" }}>
                  <input
                    style={{ ...inputStyle, textAlign: "right" }}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={line.unitPrice}
                    onChange={(e) => updateLine(i, "unitPrice", e.target.value)}
                  />
                </td>
                <td style={{ paddingRight: "8px", width: "8%" }}>
                  <input
                    style={{ ...inputStyle, textAlign: "right" }}
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={line.btwPercentage}
                    onChange={(e) => updateLine(i, "btwPercentage", e.target.value)}
                  />
                </td>
                <td style={{ paddingRight: "8px", width: "14%", textAlign: "right" }}>
                  <span
                    className="text-sm font-mono font-semibold"
                    style={{ color: "#4B8EFF" }}
                  >
                    {formatCurrency(calcLineTotal(line))}
                  </span>
                </td>
                <td style={{ width: "32px" }}>
                  <button
                    type="button"
                    onClick={() => removeLine(i)}
                    className="p-1 rounded transition-colors"
                    style={{ color: "#6B82A8" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#FF6B6B")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#6B82A8")}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {lines.map((line, i) => (
          <div key={i} className="p-3 rounded-lg space-y-2" style={{ background: "#16161C", border: "1px solid #1E2130" }}>
            <input
              style={inputStyle}
              placeholder="Omschrijving"
              value={line.description}
              onChange={(e) => updateLine(i, "description", e.target.value)}
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                style={inputStyle}
                type="number"
                placeholder="Aantal"
                value={line.quantity}
                onChange={(e) => updateLine(i, "quantity", e.target.value)}
              />
              <select
                style={{ ...inputStyle, appearance: "none" }}
                value={line.unit}
                onChange={(e) => updateLine(i, "unit", e.target.value)}
              >
                {unitOptions.map((u) => (
                  <option key={u} value={u} style={{ background: "#16161C" }}>{u}</option>
                ))}
              </select>
              <input
                style={inputStyle}
                type="number"
                placeholder="Prijs"
                value={line.unitPrice}
                onChange={(e) => updateLine(i, "unitPrice", e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono font-semibold" style={{ color: "#4B8EFF" }}>
                {formatCurrency(calcLineTotal(line))}
              </span>
              <button type="button" onClick={() => removeLine(i)} style={{ color: "#FF6B6B" }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <Button type="button" variant="secondary" size="sm" onClick={addLine}>
          <Plus size={14} />
          Regel toevoegen
        </Button>
      </div>

      {/* Totals */}
      <div className="mt-6 flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span style={{ color: "#6B82A8" }}>Subtotaal</span>
            <span className="font-mono" style={{ color: "#F4F6FA" }}>
              {formatCurrency(totals.subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: "#6B82A8" }}>BTW</span>
            <span className="font-mono" style={{ color: "#F4F6FA" }}>
              {formatCurrency(totals.btwAmount)}
            </span>
          </div>
          <div
            className="flex justify-between text-base font-bold pt-2"
            style={{ borderTop: "1px solid #1E2130" }}
          >
            <span style={{ color: "#F4F6FA" }}>Totaal</span>
            <span className="font-mono" style={{ color: "#4B8EFF" }}>
              {formatCurrency(totals.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
