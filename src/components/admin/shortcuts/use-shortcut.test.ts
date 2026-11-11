import { describe, expect, it } from "vitest"

import { matchesShortcut } from "@/components/admin/shortcuts/use-shortcut"

function key(value: string, modifiers: Partial<KeyboardEvent> = {}) {
  return {
    key: value,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    ...modifiers,
  } as KeyboardEvent
}

describe("matchesShortcut", () => {
  it("matches Ctrl + letter with the Control key only", () => {
    expect(matchesShortcut(key("a", { ctrlKey: true }), "ctrl+a")).toBe(true)
    expect(matchesShortcut(key("A", { ctrlKey: true }), "ctrl+a")).toBe(true)
    expect(matchesShortcut(key("a", { metaKey: true }), "ctrl+a")).toBe(false)
    expect(matchesShortcut(key("a"), "ctrl+a")).toBe(false)
  })

  it("matches a single letter without modifiers", () => {
    expect(matchesShortcut(key("s"), "s")).toBe(true)
    expect(matchesShortcut(key("S", { shiftKey: true }), "s")).toBe(false)
    expect(matchesShortcut(key("s", { ctrlKey: true }), "s")).toBe(false)
  })

  it("lets Shift make symbols", () => {
    expect(matchesShortcut(key("?", { shiftKey: true }), "?")).toBe(true)
    expect(matchesShortcut(key("/", { shiftKey: true }), "?")).toBe(true)
    expect(matchesShortcut(key("/"), "/")).toBe(true)
  })
})
