"use client"

import { useEffect, useEffectEvent } from "react"

/** Fields where a key types instead of running a shortcut (Ctrl+A selects the text there). */
const TYPING_TARGETS =
  'input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="listbox"], [role="menu"]'

/**
 * A key like `"s"`, `"/"`, `"?"` or `"ctrl+a"`. Ctrl is the Control key on every platform, so
 * Cmd+A and Cmd+R keep selecting and reloading on a Mac.
 */
export type Shortcut = string

/** Whether `event` presses `shortcut`. Shift only counts as part of symbols such as `?`. */
export function matchesShortcut(event: KeyboardEvent, shortcut: Shortcut) {
  const ctrl = shortcut.startsWith("ctrl+")
  const key = ctrl ? shortcut.slice("ctrl+".length) : shortcut
  if (event.ctrlKey !== ctrl || event.metaKey || event.altKey) return false
  const isLetter = /^[a-z]$/.test(key)
  if (isLetter && event.shiftKey) return false
  // Some keyboards and tools report Shift+/ instead of `?`.
  if (key === "?" && event.key === "/" && event.shiftKey) return true
  return event.key.toLowerCase() === key
}

/** Whether a page shortcut should wait: the person is typing, or a dialog is open. */
function isBusy(event: KeyboardEvent) {
  const element = event.target instanceof Element ? event.target : null
  if (element?.closest(TYPING_TARGETS)) return true
  return document.querySelector('[role="dialog"], [role="alertdialog"]') !== null
}

/**
 * Runs `handler` when `shortcut` is pressed on the page, never while typing in a field or with a
 * dialog open, so each key has one meaning at a time.
 */
export function useShortcut(shortcut: Shortcut, handler: () => void, enabled = true) {
  const run = useEffectEvent((event: KeyboardEvent) => {
    if (event.defaultPrevented || event.repeat || !matchesShortcut(event, shortcut)) return
    if (isBusy(event)) return
    event.preventDefault()
    handler()
  })
  useEffect(() => {
    if (!enabled) return
    const listener = (event: KeyboardEvent) => run(event)
    window.addEventListener("keydown", listener)
    return () => window.removeEventListener("keydown", listener)
  }, [enabled])
}
