"use client"

import { useSyncExternalStore } from "react"

import { registrationsPhase, type RegistrationsPhase } from "@/lib/registrations/window"

/**
 * One clock for every registrations countdown on the page: a timeout per second, aligned on the
 * second so they all tick together, running only while a component listens.
 */
let now = 0
let timer = 0
const listeners = new Set<() => void>()

function tick() {
  now = Date.now()
  listeners.forEach((listener) => listener())
  timer = window.setTimeout(tick, 1000 - (now % 1000))
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (listeners.size === 1) {
    now = Date.now()
    timer = window.setTimeout(tick, 1000 - (now % 1000))
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) window.clearTimeout(timer)
  }
}

function getSnapshot() {
  if (!now) now = Date.now()
  return now
}

/**
 * The registrations phase and the current time (ms), updated every second. `renderedAt` is the
 * time the server rendered the page at: the page hydrates with it (the same HTML as the server's),
 * then switches to the visitor's clock. Without it, `null` while the page hydrates.
 */
export function useRegistrationsPhase(
  renderedAt?: number,
): { phase: RegistrationsPhase; now: number } | null {
  const time = useSyncExternalStore(subscribe, getSnapshot, () => renderedAt ?? null)
  return time === null ? null : { phase: registrationsPhase(time), now: time }
}
