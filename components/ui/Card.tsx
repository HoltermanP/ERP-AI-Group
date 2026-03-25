import React from "react"

interface CardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function Card({ children, className = "", style }: CardProps) {
  return (
    <div
      className={`rounded-xl ${className}`}
      style={{
        background: "#111116",
        border: "1px solid #1E2130",
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = "" }: CardProps) {
  return (
    <div
      className={`px-6 py-4 ${className}`}
      style={{ borderBottom: "1px solid #1E2130" }}
    >
      {children}
    </div>
  )
}

export function CardBody({ children, className = "" }: CardProps) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>
}
