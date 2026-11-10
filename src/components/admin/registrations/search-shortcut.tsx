"use client"

import { useShortcut } from "@/components/admin/shortcuts/use-shortcut"

/** `/` puts the cursor in the field with `id`, its text selected to type a new search. */
export function SearchShortcut({ inputId }: { inputId: string }) {
  useShortcut("/", () => {
    const input = document.getElementById(inputId)
    if (!(input instanceof HTMLInputElement)) return
    input.focus()
    input.select()
  })
  return null
}
