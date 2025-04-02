import type { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  title: "Authentication - ImageMax",
  description: "Sign in or create an account to access professional image processing tools.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 