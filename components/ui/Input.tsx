import React from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, className = "", id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-")

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          style={{ color: "#6B82A8", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-2 text-sm rounded-md transition-colors outline-none ${className}`}
        style={{
          background: "#16161C",
          border: `1px solid ${error ? "#FF6B6B" : "#1E2130"}`,
          color: "#F4F6FA",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "#2D6FE8"
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? "#FF6B6B" : "#1E2130"
          props.onBlur?.(e)
        }}
        {...props}
      />
      {error && <p style={{ color: "#FF6B6B", fontSize: "12px" }}>{error}</p>}
      {hint && !error && <p style={{ color: "#6B82A8", fontSize: "12px" }}>{hint}</p>}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export function Textarea({ label, error, hint, className = "", id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-")

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          style={{ color: "#6B82A8", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`w-full px-3 py-2 text-sm rounded-md transition-colors outline-none resize-vertical ${className}`}
        style={{
          background: "#16161C",
          border: `1px solid ${error ? "#FF6B6B" : "#1E2130"}`,
          color: "#F4F6FA",
          minHeight: "80px",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "#2D6FE8"
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? "#FF6B6B" : "#1E2130"
          props.onBlur?.(e)
        }}
        {...props}
      />
      {error && <p style={{ color: "#FF6B6B", fontSize: "12px" }}>{error}</p>}
      {hint && !error && <p style={{ color: "#6B82A8", fontSize: "12px" }}>{hint}</p>}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export function Select({ label, error, options, className = "", id, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-")

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          style={{ color: "#6B82A8", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}
        >
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={`w-full px-3 py-2 text-sm rounded-md transition-colors outline-none ${className}`}
        style={{
          background: "#16161C",
          border: `1px solid ${error ? "#FF6B6B" : "#1E2130"}`,
          color: "#F4F6FA",
        }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: "#16161C", color: "#F4F6FA" }}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p style={{ color: "#FF6B6B", fontSize: "12px" }}>{error}</p>}
    </div>
  )
}
