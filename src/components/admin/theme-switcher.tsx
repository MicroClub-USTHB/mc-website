"use client"

import { MoonIcon, SunIcon } from "lucide-react"

import { useAdminTheme } from "@/components/admin/admin-theme"
import { McButton } from "@/components/ui/mc-button"

/** Header button switching the admin area between its light and dark themes. */
export function ThemeSwitcher() {
  const { theme, toggle } = useAdminTheme()
  const dark = theme === "dark"

  return (
    <McButton
      variant="tertiary"
      size="sm"
      icon="only"
      iconDefinition={dark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
      aria-pressed={dark}
      onClick={toggle}
    >
      {dark ? "Switch to the light theme" : "Switch to the dark theme"}
    </McButton>
  )
}
