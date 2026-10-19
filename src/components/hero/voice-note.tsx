"use client"

import { useEffect, useRef, useState } from "react"
import { PauseIcon, PlayIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/** Waveform bar heights (px), drawn once like a recorded message. */
const BARS = [
  8, 14, 22, 12, 28, 18, 10, 24, 30, 16, 9, 20, 26, 14, 8, 18, 28, 22, 12, 16, 24, 10, 20, 14, 8,
]

/** Shown before the audio metadata loads (the Figma timer). */
const FALLBACK_DURATION = 30

function formatTime(seconds: number) {
  const total = Math.max(0, Math.ceil(seconds))
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
}

/**
 * Figma "Voice note": a message player. Play / pause the club audio; the waveform fills with the
 * progress and the timer counts down the time left.
 */
export function VoiceNote() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(FALLBACK_DURATION)
  const [current, setCurrent] = useState(0)

  // Smooth progress while playing (`timeupdate` only fires a few times per second).
  useEffect(() => {
    if (!playing) return
    let frame = 0
    const tick = () => {
      setCurrent(audioRef.current?.currentTime ?? 0)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing])

  function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) void audio.play()
    else audio.pause()
  }

  const progress = duration ? current / duration : 0

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex h-19.75 w-62.25 items-center gap-3 rounded-full bg-background px-4 shadow-[0_0.5rem_1.5rem_rgb(0_0_0/0.12)]">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause the voice note" : "Play the voice note"}
          className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-primary text-primary-foreground transition-transform outline-none hover:scale-105 focus-visible:ring-4 focus-visible:ring-secondary"
        >
          {playing ? (
            <PauseIcon aria-hidden className="size-5 fill-current" />
          ) : (
            <PlayIcon aria-hidden className="size-5 translate-x-px fill-current" />
          )}
        </button>

        <div aria-hidden className="flex h-8 flex-1 items-center gap-0.5">
          {BARS.map((height, i) => (
            <span
              key={i}
              style={{ height }}
              className={cn(
                "w-0.75 rounded-full transition-colors",
                (i + 0.5) / BARS.length <= progress ? "bg-primary" : "bg-border",
              )}
            />
          ))}
        </div>

        <span className="w-9 shrink-0 paragraph-xs text-muted-foreground tabular-nums">
          {formatTime(duration - current)}
        </span>

        <audio
          ref={audioRef}
          src="/hero/micro.mp3"
          preload="metadata"
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={(event) => {
            event.currentTarget.currentTime = 0
            setCurrent(0)
          }}
        />
      </div>
      <p className="ps-4 paragraph-sm font-medium text-destructive">Warning its is loud!</p>
    </div>
  )
}
