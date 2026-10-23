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

/** No clock on the server: the countdown is drawn once hydrated. */
function getServerSnapshot() {
  return null
}

/**
 * The registrations phase and the current time (ms), updated every second; `null` while the page
 * hydrates, since the server cannot know the visitor's time.
 */
export function useRegistrationsPhase(): { phase: RegistrationsPhase; now: number } | null {
  const time = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return time === null ? null : { phase: registrationsPhase(time), now: time }
}
