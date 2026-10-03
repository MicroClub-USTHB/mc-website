"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

/** Light/dark theme via the `.dark` class on <html>, following the OS preference by default. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
