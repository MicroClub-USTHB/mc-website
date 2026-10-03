import type { Metadata } from "next"
import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google"

import { ThemeProvider } from "@/components/providers/theme-provider"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
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
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    url: siteConfig.url,
  },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // next-themes sets the `dark` class on <html> before hydration.
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(dmSans.variable, plusJakartaSans.variable, "h-full scroll-smooth antialiased")}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
