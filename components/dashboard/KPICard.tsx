interface KPICardProps {
  label: string
  value: string | number
  unit?: string
  icon?: React.ReactNode
  trend?: string
}

export function KPICard({ label, value, unit, icon, trend }: KPICardProps) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "#111116", border: "1px solid #1E2130" }}
    >
      <div className="flex items-start justify-between mb-3">
        <p style={{ color: "#6B82A8", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </p>
        {icon && <div style={{ color: "#4B8EFF", opacity: 0.7 }}>{icon}</div>}
      </div>
      <div className="flex items-end gap-1">
        <span
          className="text-3xl font-bold leading-none"
          style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#4B8EFF" }}
        >
          {value}
        </span>
        {unit && (
          <span
            className="text-sm mb-0.5"
            style={{ color: "#6B82A8", fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {unit}
          </span>
        )}
      </div>
      {trend && (
        <p className="mt-2 text-xs" style={{ color: "#6B82A8" }}>{trend}</p>
      )}
    </div>
  )
}
