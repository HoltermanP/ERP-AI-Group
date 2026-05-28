type BadgeVariant =
  | "draft"
  | "sent"
  | "accepted"
  | "rejected"
  | "paid"
  | "overdue"
  | "expired"
  | "cancelled"
  | "active"
  | "inactive"
  | "prospect"
  | "conversation"
  | "proposal"
  | "customer"
  | "concept"
  | "afgerond"
  | "gepauzeerd"

const styles: Record<BadgeVariant, { bg: string; color: string }> = {
  draft: { bg: "#1E2130", color: "#6B82A8" },
  sent: { bg: "#1A2A4A", color: "#4B8EFF" },
  accepted: { bg: "#0A2A1A", color: "#2DD68A" },
  rejected: { bg: "#2A1010", color: "#FF6B6B" },
  paid: { bg: "#0A2A1A", color: "#2DD68A" },
  overdue: { bg: "#2A1000", color: "#FF4D1C" },
  expired: { bg: "#1E1A10", color: "#F5A623" },
  cancelled: { bg: "#1E1010", color: "#888888" },
  active: { bg: "#0A2A1A", color: "#2DD68A" },
  inactive: { bg: "#1E2130", color: "#6B82A8" },
  prospect: { bg: "#1E2130", color: "#6B82A8" },
  conversation: { bg: "#1A2A4A", color: "#4B8EFF" },
  proposal: { bg: "#1E1A10", color: "#F5A623" },
  customer: { bg: "#0A2A1A", color: "#2DD68A" },
  concept: { bg: "#1E2130", color: "#6B82A8" },
  afgerond: { bg: "#0A2A1A", color: "#2DD68A" },
  gepauzeerd: { bg: "#1E1A10", color: "#F5A623" },
}

const labels: Record<string, string> = {
  draft: "Concept",
  sent: "Verzonden",
  accepted: "Geaccepteerd",
  rejected: "Afgewezen",
  paid: "Betaald",
  overdue: "Verlopen",
  expired: "Vervallen",
  cancelled: "Geannuleerd",
  active: "Actief",
  inactive: "Inactief",
  prospect: "Prospect",
  conversation: "Conversation",
  proposal: "Proposal",
  customer: "Customer",
  concept: "Concept",
  afgerond: "Afgerond",
  gepauzeerd: "Gepauzeerd",
}

interface BadgeProps {
  status: string
  className?: string
}

export function Badge({ status, className = "" }: BadgeProps) {
  const style = styles[status as BadgeVariant] || { bg: "#1E2130", color: "#6B82A8" }
  const label = labels[status] || status

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}
      style={{ background: style.bg, color: style.color }}
    >
      {label}
    </span>
  )
}
