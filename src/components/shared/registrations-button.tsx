import Link from "next/link"

import { McButton } from "@/components/ui/mc-button"
import { siteRoutes } from "@/config/site"
import { cn } from "@/lib/utils"
import type { RegistrationsPhase } from "@/lib/registrations/window"

/** `03D 12H 35M 28S`: the time left until `until`, from `now` (ms). */
function formatCountdown(until: number, now: number) {
  const seconds = Math.max(0, Math.floor((until - now) / 1000))
  const parts = [
    [Math.floor(seconds / 86400), "D"],
    [Math.floor(seconds / 3600) % 24, "H"],
    [Math.floor(seconds / 60) % 60, "M"],
    [seconds % 60, "S"],
  ] as const
  return parts.map(([value, unit]) => `${String(value).padStart(2, "0")}${unit}`).join(" ")
}

/** Figma arrow (11px box, its 12.3 × 12.67 glyph overflowing it), pointing right. */
function Arrow() {
  return (
    <span aria-hidden className="grid size-[19px] shrink-0 place-items-center">
      <svg
        width="12.298"
        height="12.67"
        viewBox="0 0 12.298 12.67"
        className="-rotate-90 overflow-visible"
      >
        <path
          fill="currentColor"
          d="M5.314.835V0h1.67v.835h-1.67m.835 0h.835v11h-1.67v-11zm.59 11.59a.835.835 0 0 1-1.18 0L.244 7.112a.835.835 0 0 1 1.18-1.181l4.724 4.723 4.723-4.723a.835.835 0 1 1 1.181 1.18z"
        />
      </svg>
    </span>
  )
}

type RegistrationsButtonProps = {
  /** An `upcoming` or `open` phase (nothing is drawn once closed). */
  phase: Exclude<RegistrationsPhase, { status: "closed" }>
  now: number
  className?: string
}

/**
 * Figma "Button" (REGISTER BUTTON / OPENING SOON BUTTON): the registrations call to action with
 * its countdown pinned on its top right corner, a white label outlined in primary. Open, "Register
 * now" links to the registrations page and counts down to the close (none when it has no end);
 * before the opening, a disabled "Opening soon" counts down to it.
 */
export function RegistrationsButton({ phase, now, className }: RegistrationsButtonProps) {
  const upcoming = phase.status === "upcoming"
  const countdown = phase.until === null ? null : formatCountdown(phase.until, now)
  const button =
    "absolute top-[16.28px] left-0 gap-2 px-5 py-3 leading-6 shadow-[0_1px_2px_0_rgb(10_13_18/0.05)]"

  return (
    <div
      className={cn(
        "relative",
        upcoming ? "h-[65px] w-[263px]" : "h-[64.275px] w-[259.176px]",
        className,
      )}
    >
      {upcoming ? (
        <McButton
          disabled
          size="xl"
          className={cn(
            button,
            "border-border disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100",
          )}
        >
          OPENING SOON
          <Arrow />
        </McButton>
      ) : (
        <McButton
          nativeButton={false}
          render={<Link href={siteRoutes.registrations} />}
          size="xl"
          className={cn(button, "border-primary")}
        >
          REGISTER NOW
          <Arrow />
        </McButton>
      )}
      {countdown && (
        <p
          role="timer"
          aria-label={`Registrations ${upcoming ? "open" : "close"} in ${countdown}`}
          className="pointer-events-none absolute top-0 left-[91.18px] text-[20.479px] leading-[31.855px] font-medium whitespace-nowrap text-primary-foreground [-webkit-text-stroke:13.66px_var(--color-primary)] [paint-order:stroke_fill]"
        >
          {countdown}
        </p>
      )}
    </div>
  )
}
