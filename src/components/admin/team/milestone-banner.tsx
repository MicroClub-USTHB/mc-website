"use client"

import { PartyPopperIcon, XIcon } from "lucide-react"
import { useSyncExternalStore } from "react"

/** Browser storage key: the highest milestone this browser already celebrated. */
const STORAGE_KEY = "mc-review-milestone"
const listeners = new Set<() => void>()

function seenMilestone() {
  try {
    return Number(window.localStorage.getItem(STORAGE_KEY) ?? 0)
  } catch {
    return 0
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const MESSAGES: Record<number, string> = {
  25: "A quarter of the reviews are done. Great start, team!",
  50: "Halfway there! Half of the reviews are done.",
  75: "Three quarters done. The finish line is in sight!",
  100: "Every registration is reviewed. Amazing work, team!",
}

/** Celebrates each team milestone once per browser, until dismissed. */
export function MilestoneBanner({ milestone }: { milestone: number | null }) {
  // On the server and before hydration nothing is celebrated yet.
  const seen = useSyncExternalStore(subscribe, seenMilestone, () => Infinity)
  if (milestone === null || milestone <= seen) return null

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(milestone))
    } catch {
      // Without storage it shows again on the next visit.
    }
    for (const listener of listeners) listener()
  }

  return (
    <section
      aria-live="polite"
      className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:px-6"
    >
      <PartyPopperIcon className="size-6 shrink-0 text-primary" aria-hidden />
      <p className="min-w-0 flex-1 paragraph-md font-medium text-foreground">
        {MESSAGES[milestone]}
      </p>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={dismiss}
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-secondary hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring"
      >
        <XIcon className="size-4" />
      </button>
    </section>
  )
}
