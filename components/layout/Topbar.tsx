"use client"

import { UserButton } from "@clerk/nextjs"
import { Menu } from "lucide-react"

interface TopbarProps {
  onMenuClick?: () => void
  title?: string
}

export function Topbar({ onMenuClick, title }: TopbarProps) {
  return (
    <header
      className="flex items-center justify-between px-4 lg:px-6 h-14"
      style={{ background: "#0A0A0B", borderBottom: "1px solid #1E2130" }}
    >
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden p-2 rounded-md"
          style={{ color: "#6B82A8" }}
          onClick={onMenuClick}
        >
          <Menu size={20} />
        </button>
        {title && (
          <h1 className="text-base font-semibold" style={{ color: "#F4F6FA" }}>
            {title}
          </h1>
        )}
      </div>
      <div className="flex items-center gap-3">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
            },
          }}
        />
      </div>
    </header>
  )
}
