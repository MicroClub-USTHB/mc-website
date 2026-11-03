"use client"

import { createContext, use, useEffect, useState } from "react"

import { ADMIN_THEME_COOKIE, adminRoutes, type AdminTheme } from "@/config/admin"
import { cn } from "@/lib/utils"

const AdminThemeContext = createContext<{ theme: AdminTheme; toggle: () => void } | null>(null)

/** The admin theme and its toggle, for the switcher in the header. */
export function useAdminTheme() {
  const value = use(AdminThemeContext)
  if (!value) throw new Error("useAdminTheme must be used inside AdminTheme")
  return value
}

/**
 * Admin area theme, light or dark with the mcoli-ui tokens (`dark` scopes the dark ones, as on the
 * site's dark sections). The layout reads the saved choice from a cookie, so the server renders
 * the right theme on the first paint. While an admin page is open the class is also set on `<html>`:
 * dialogs and menus are portalled to `<body>`, outside this wrapper, and the page's background and
 * scrollbars follow too. Leaving the admin area takes it off, so the public site stays light.
 */
export function AdminTheme({
  initialTheme,
  children,
}: {
  initialTheme: AdminTheme
  children: React.ReactNode
}) {
  const [theme, setTheme] = useState(initialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", theme === "dark")
    root.style.colorScheme = theme
    return () => {
      root.classList.remove("dark")
      root.style.colorScheme = ""
    }
  }, [theme])

  function toggle() {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    // A year, for the admin pages only.
    document.cookie = `${ADMIN_THEME_COOKIE}=${next}; path=${adminRoutes.home}; max-age=31536000; samesite=lax`
  }

  return (
    <AdminThemeContext value={{ theme, toggle }}>
      <div
        className={cn(
          "flex flex-1 flex-col bg-background text-foreground",
          theme === "dark" && "dark",
        )}
      >
        {children}
      </div>
    </AdminThemeContext>
  )
}
