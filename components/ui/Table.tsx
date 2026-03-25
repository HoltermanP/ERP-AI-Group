import React from "react"

interface TableProps {
  children: React.ReactNode
  className?: string
}

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">{children}</table>
    </div>
  )
}

export function Thead({ children }: { children: React.ReactNode }) {
  return <thead>{children}</thead>
}

export function Tbody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>
}

export function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${className}`}
      style={{ background: "#111116", color: "#6B82A8", borderBottom: "1px solid #1E2130" }}
    >
      {children}
    </th>
  )
}

export function Tr({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <tr
      className={`transition-colors ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={{ borderBottom: "1px solid #1E2130" }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) (e.currentTarget as HTMLElement).style.background = "#111116"
      }}
      onMouseLeave={(e) => {
        if (onClick) (e.currentTarget as HTMLElement).style.background = "transparent"
      }}
    >
      {children}
    </tr>
  )
}

export function Td({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <td className={`px-4 py-3 text-sm ${className}`} style={{ color: "#F4F6FA", ...style }}>
      {children}
    </td>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="mb-4 opacity-40" style={{ color: "#4B8EFF" }}>{icon}</div>}
      <h3 className="text-lg font-semibold mb-1" style={{ color: "#F4F6FA" }}>{title}</h3>
      {description && <p className="text-sm mb-4" style={{ color: "#6B82A8" }}>{description}</p>}
      {action}
    </div>
  )
}
