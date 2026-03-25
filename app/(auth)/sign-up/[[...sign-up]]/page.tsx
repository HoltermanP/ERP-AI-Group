import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "#0A0A0B" }}
    >
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-1">
          <span style={{ color: "#4B8EFF" }}>AI</span>
          <span style={{ color: "#F4F6FA" }}>-Group.nl</span>
        </h1>
        <p style={{ color: "#6B82A8", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px" }}>
          AI-FIRST · WE SHIP FAST · ai-group.nl
        </p>
      </div>
      <SignUp />
    </div>
  )
}
