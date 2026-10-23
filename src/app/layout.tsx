import type { Metadata } from "next"
import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google"

import { SmoothScrollProvider } from "@/providers/smooth-scroll-provider"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import "lenis/dist/lenis.css"
import "./globals.css"

// mcoli-ui typography: DM Sans for body text, Plus Jakarta Sans for headings.
// Mapped to `font-sans` / `font-heading` in globals.css.
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
})

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  category: "education",
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    url: siteConfig.url,
    locale: "en_US",
  },
  // The Open Graph image (`opengraph-image.tsx`) is reused as a large X card.
  twitter: { card: "summary_large_image" },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn(dmSans.variable, plusJakartaSans.variable, "h-full antialiased")}>
      <body className="flex min-h-full flex-col">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  )
}
