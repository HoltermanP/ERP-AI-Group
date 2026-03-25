export interface LineItem {
  quantity: number | string
  unitPrice: number | string
  btwPercentage: number | string
}

export function calculateLineTotal(item: LineItem): number {
  const qty = parseFloat(String(item.quantity)) || 0
  const price = parseFloat(String(item.unitPrice)) || 0
  return qty * price
}

export function calculateTotals(lines: LineItem[]): {
  subtotal: number
  btwAmount: number
  total: number
} {
  const subtotal = lines.reduce((sum, line) => sum + calculateLineTotal(line), 0)
  const btwAmount = lines.reduce((sum, line) => {
    const lineTotal = calculateLineTotal(line)
    const btwPct = parseFloat(String(line.btwPercentage)) || 0
    return sum + lineTotal * (btwPct / 100)
  }, 0)
  return {
    subtotal,
    btwAmount,
    total: subtotal + btwAmount,
  }
}
