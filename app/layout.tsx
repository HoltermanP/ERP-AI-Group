import type { Metadata } from "next"
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-space-grotesk",
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-ibm-plex-mono",
})

export const metadata: Metadata = {
  title: "AI-Group ERP",
  description: "Intern ERP-systeem voor AI-Group.nl",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html
        lang="nl"
        className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} h-full`}
        style={{ background: "#0A0A0B" }}
      >
        <body
          className="min-h-full"
          style={{
            background: "#0A0A0B",
            color: "#F4F6FA",
            fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
          }}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
