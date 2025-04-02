import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ImageMax - Professional Image Processing Tools",
  description: "Enhance, upscale, and transform your images with our professional-grade tools. Remove backgrounds, enhance quality, and convert formats with ease.",
  keywords: [
    "image editing",
    "AI image processing",
    "background removal",
    "image upscaling",
    "object removal",
    "photo editor",
    "AI photo editor",
  ],
  authors: [{ name: "ImageMax Team" }],
  creator: "ImageMax",
  publisher: "ImageMax",
  robots: "index, follow",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    title: "ImageMax - Professional Image Processing Tools",
    description: "Enhance, upscale, and transform your images with our professional-grade tools.",
    siteName: "ImageMax",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ImageMax - Professional Image Processing Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ImageMax - Professional Image Processing Tools",
    description: "Enhance, upscale, and transform your images with our professional-grade tools.",
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <AuthProvider>
          <ToastProvider>
            <div className="relative flex min-h-screen flex-col">
              <div className="flex-1">{children}</div>
            </div>
            <Toaster />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
