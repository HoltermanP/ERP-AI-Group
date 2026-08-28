import type { WeekBucket } from "@/lib/insights/projects"
import { formatNumber } from "@/lib/utils/formatters"

/** Enkelvoudige staafgrafiek: uren per week (alle projecten). */
export function WeeklyHoursChart({ data }: { data: WeekBucket[] }) {
  const max = Math.max(1, ...data.map((d) => d.hours))
  const avg = data.reduce((s, d) => s + d.hours, 0) / Math.max(1, data.length)
  const H = 120

  return (
    <div>
      <div className="flex items-end gap-1.5" style={{ height: H }}>
        {data.map((d, i) => {
          const h = Math.max(d.hours > 0 ? 3 : 0, (d.hours / max) * H)
          const isCurrent = i === data.length - 1
          return (
            <div key={d.weekStart} className="flex-1 flex flex-col justify-end h-full group relative" title={`Week van ${d.label}: ${formatNumber(d.hours)} u`}>
              {d.hours > 0 && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-mono opacity-0 group-hover:opacity-100 whitespace-nowrap" style={{ color: "#F4F6FA" }}>
                  {formatNumber(d.hours)}
                </span>
              )}
              <div
                className="w-full rounded-t"
                style={{ height: h, background: isCurrent ? "#4B8EFF" : "#2D6FE8", opacity: isCurrent ? 1 : 0.75 }}
              />
            </div>
          )
        })}
      </div>
      <div className="relative">
        <div className="absolute left-0 right-0 border-t" style={{ borderColor: "#1E2130", top: 0 }} />
      </div>
      <div className="flex gap-1.5 mt-1.5">
        {data.map((d, i) => (
          <div key={d.weekStart} className="flex-1 text-center text-[10px] font-mono" style={{ color: i === data.length - 1 ? "#F4F6FA" : "#6B82A8" }}>
            {i % 2 === data.length % 2 ? d.label : ""}
          </div>
        ))}
      </div>
      <p className="text-xs mt-2" style={{ color: "#6B82A8" }}>
        Gemiddeld <span className="font-mono" style={{ color: "#F4F6FA" }}>{formatNumber(avg)} u</span> per week over de laatste {data.length} weken
      </p>
    </div>
  )
}
