"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"

import { cn } from "@/lib/utils"
import pauseIcon from "@/assets/hero/voice/pause.svg"
import playIcon from "@/assets/hero/voice/play.svg"

const AUDIO_SRC = "/hero/micro.mp3"

/** Figma waveform: bar count and height range (px). */
const BAR_COUNT = 23
const BAR_MIN = 2
const BAR_MAX = 16

/** Figma bar heights, shown until the real audio is decoded. */
const FIGMA_BARS = [
  8, 14, 4, 16, 14, 10, 10, 10, 14, 10, 16, 10, 4, 10, 10, 10, 14, 10, 16, 10, 10, 4, 2,
]

/** Loudness peak of each slice of the sound, scaled to the bar height range. */
function waveform(buffer: AudioBuffer) {
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, i) =>
    buffer.getChannelData(i),
  )
  const slice = Math.floor(buffer.length / BAR_COUNT)
  const peaks = Array.from({ length: BAR_COUNT }, (_, bar) => {
    let peak = 0
    for (const data of channels) {
      for (let i = bar * slice; i < (bar + 1) * slice; i++) peak = Math.max(peak, Math.abs(data[i]))
    }
    return peak
  })
  const loudest = Math.max(...peaks) || 1
  return peaks.map((peak) => Math.round(BAR_MIN + (peak / loudest) * (BAR_MAX - BAR_MIN)))
}

function formatTime(seconds: number) {
  const total = Math.max(0, Math.ceil(seconds))
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
}

/**
 * Figma "Voice": a voice message player for the club audio. The waveform is computed from the
 * decoded sound itself and the timer from its real length: it counts down while playing, and the
 * played part of the waveform turns primary.
 */
export function VoiceNote() {
  const rootRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [bars, setBars] = useState(FIGMA_BARS)
  const [duration, setDuration] = useState<number | null>(null)
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(false)

  // Decode the file once to draw its real waveform, only when the note comes near the screen and
  // the browser is idle: an offline context needs no audio output nor a user gesture.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const controller = new AbortController()
    let idle = 0
    const decode = () => {
      fetch(AUDIO_SRC, { signal: controller.signal })
        .then((response) => response.arrayBuffer())
        .then((data) => new OfflineAudioContext(1, 1, 44100).decodeAudioData(data))
        .then((buffer) => {
          setBars(waveform(buffer))
          setDuration((known) => known ?? buffer.duration)
        })
        .catch(() => {}) // Keep the Figma bars.
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        // Safari has no requestIdleCallback: a short timeout instead.
        idle =
          typeof requestIdleCallback === "function"
            ? requestIdleCallback(decode, { timeout: 2000 })
            : window.setTimeout(decode, 200)
      },
      { rootMargin: "400px" },
    )
    observer.observe(root)
    return () => {
      observer.disconnect()
      if (typeof cancelIdleCallback === "function") cancelIdleCallback(idle)
      else window.clearTimeout(idle)
      controller.abort()
    }
  }, [])

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
  const active = playing || current > 0

  return (
    <div ref={rootRef} className="flex w-[249px] flex-col items-start gap-1.5">
      <div className="flex h-[49px] w-full items-center justify-center gap-2.5 overflow-clip rounded-lg border border-border bg-input p-2.5 shadow-[0_1px_2px_0_rgb(10_13_18/0.05)]">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause the voice note" : "Play the voice note"}
          className="size-[29px] shrink-0 cursor-pointer rounded-md outline-none focus-visible:ring-4 focus-visible:ring-secondary"
        >
          <Image
            src={playing ? pauseIcon : playIcon}
            alt=""
            unoptimized
            draggable={false}
            className="size-[29px] max-w-none"
          />
        </button>

        <div className="flex items-center gap-2">
          <div aria-hidden className="flex items-center gap-1">
            {bars.map((height, i) => (
              <span
                key={i}
                style={{ height }}
                className={cn(
                  "w-0.5 rounded-[1px] transition-[height,background-color,opacity] duration-300",
                  i < Math.round(progress * bars.length)
                    ? "bg-primary opacity-80"
                    : "bg-muted-foreground opacity-66",
                )}
              />
            ))}
          </div>
          <span
            className={cn(
              "paragraph-sm whitespace-nowrap tabular-nums",
              active ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <span className="sr-only">Time left: </span>
            {formatTime((duration ?? 0) - current)}
          </span>
        </div>

        <audio
          ref={audioRef}
          src={AUDIO_SRC}
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
      <p className="paragraph-md text-destructive">Warning it is loud!</p>
    </div>
  )
}
