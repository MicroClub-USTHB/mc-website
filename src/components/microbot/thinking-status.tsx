"use client"

import { useEffect, useState } from "react"

import { LoadingDots } from "@/components/microbot/loading-dots"

/** "Thinking 49.0s" status shown while MicroBot answers: counts the elapsed seconds. */
export function ThinkingStatus() {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = performance.now()
    const id = setInterval(() => setElapsed((performance.now() - start) / 1000), 100)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center gap-2">
      <LoadingDots />
      <p className="paragraph-xs text-muted-foreground tabular-nums">
        Thinking {elapsed.toFixed(1)}s
      </p>
    </div>
  )
}
