"use client"

import React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "cta" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  loading?: boolean
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"

  const variants = {
    primary: "bg-[#2D6FE8] text-white hover:bg-[#1d5fd8]",
    cta: "bg-[#FF4D1C] text-white hover:bg-[#e03b0a]",
    secondary: "bg-[#16161C] text-[#F4F6FA] border border-[#1E2130] hover:bg-[#1E2130]",
    ghost: "text-[#6B82A8] hover:text-[#F4F6FA] hover:bg-[#111116]",
    danger: "bg-[#2A1010] text-[#FF6B6B] border border-[#FF6B6B]/20 hover:bg-[#3A1515]",
  }

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}
