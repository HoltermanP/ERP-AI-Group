"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  FileText,
  Receipt,
  Settings,
  X,
  FolderKanban,
  UserCog,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Klanten", icon: Users },
  { href: "/projects", label: "Projecten", icon: FolderKanban },
  { href: "/contacts", label: "Contacten", icon: MessageSquare },
  { href: "/quotes", label: "Offertes", icon: FileText },
  { href: "/invoices", label: "Facturen", icon: Receipt },
  { href: "/employees", label: "Medewerkers", icon: UserCog },
  { href: "/settings", label: "Instellingen", icon: Settings },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {onClose && isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full z-50 flex flex-col transition-transform duration-300
          ${onClose ? (isOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
          lg:relative lg:translate-x-0`}
        style={{ width: "240px", background: "#0D1428", borderRight: "1px solid #1E2130" }}
      >
        {/* Logo */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold">
                <span style={{ color: "#4B8EFF" }}>AI</span>
                <span style={{ color: "#F4F6FA" }}>-Group.nl</span>
              </div>
              <div
                className="mt-0.5"
                style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#6B82A8", letterSpacing: "0.05em" }}
              >
                AI-FIRST · WE SHIP FAST
              </div>
            </div>
            {onClose && (
              <button onClick={onClose} className="lg:hidden" style={{ color: "#6B82A8" }}>
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "#1E2130", margin: "0 16px" }} />

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors relative"
                style={{
                  background: isActive ? "#1A2540" : "transparent",
                  color: isActive ? "#F4F6FA" : "#6B82A8",
                  borderLeft: isActive ? "3px solid #2D6FE8" : "3px solid transparent",
                }}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div
          className="px-6 py-4"
          style={{ borderTop: "1px solid #1E2130" }}
        >
          <p
            style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#6B82A8" }}
          >
            AI-FIRST · WE SHIP FAST · ai-group.nl
          </p>
        </div>
      </aside>
    </>
  )
}
