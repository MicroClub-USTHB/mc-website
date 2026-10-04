"use client"

import { useEffect, useRef } from "react"
import { ReactLenis, type LenisRef } from "lenis/react"
import { cancelFrame, frame, MotionConfig } from "motion/react"

/**
 * Lenis smooth scroll driven by Motion's frame loop, so scroll and animations share one rAF.
 * `anchors` makes `/#section` links scroll smoothly. Motion respects the OS "reduce motion" setting.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null)

  useEffect(() => {
    function update({ timestamp }: { timestamp: number }) {
      lenisRef.current?.lenis?.raf(timestamp)
    }
    frame.update(update, true)
    return () => cancelFrame(update)
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <ReactLenis root ref={lenisRef} options={{ autoRaf: false, anchors: true }}>
        {children}
      </ReactLenis>
    </MotionConfig>
  )
}
