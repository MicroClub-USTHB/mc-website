import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { VT323 } from "next/font/google"

import { MicroBotFaceFrames } from "@/components/microbot/microbot-face"
import { NOT_FOUND_LINES, type NotFoundLine } from "@/const/not-found"
import { cn } from "@/lib/utils"
import barcode from "@/assets/not-found/barcode.svg"

export const metadata: Metadata = { title: "Page not found" }

/** Figma "(ERROR 404)" pixel font, only loaded on this page. */
const vt323 = VT323({ weight: "400", subsets: ["latin"] })

const CORNERS = {
  "top-left": "top-4 left-4",
  "top-right": "top-4 right-4 text-right",
  "bottom-left": "bottom-4 left-4",
  // Narrow phones: above the bottom-left lines, which would run into it.
  "bottom-right": "bottom-4 right-4 text-right max-[399px]:bottom-16",
} as const

function Lines({ lines }: Pick<NotFoundLine, "lines">) {
  return lines.map((line, i) => (
    <span key={i} className="block whitespace-pre">
      {line}
    </span>
  ))
}

/**
 * 404 (Figma "404 PAGE"): "(ERROR 404)" over the primary blue, among terminal-like lines.
 * `--u` is one Figma px (the 1440×1024 frame fitted in the screen): from `lg` the lines sit at
 * their Figma place and size. Smaller screens keep the four corner lines and the centre.
 */
export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-svh flex-1 items-center justify-center overflow-hidden bg-primary font-sans text-primary-foreground uppercase [--u:min(100vw/880,100svh/700,1px)] lg:[--u:min(100vw/1440,100svh/1024)]">
      <div aria-hidden className="hidden text-[calc(20*var(--u))] leading-[1.3] lg:block">
        {NOT_FOUND_LINES.map(({ lines, x, y, align, cyan }) => (
          <div
            key={`${x}-${y}`}
            className={cn(
              "absolute",
              align === "right" && "-translate-x-full text-right",
              cyan && "text-cyan-500",
            )}
            style={{ left: `${(x / 1440) * 100}%`, top: `${(y / 1024) * 100}%` }}
          >
            <Lines lines={lines} />
          </div>
        ))}
        <Image
          src={barcode}
          alt=""
          unoptimized
          className="absolute h-auto"
          style={{
            left: `${(1001 / 1440) * 100}%`,
            top: `${(772 / 1024) * 100}%`,
            width: "calc(422 * var(--u))",
          }}
        />
      </div>

      <div aria-hidden className="text-[13px] leading-5 sm:text-sm lg:hidden">
        {NOT_FOUND_LINES.filter((line) => line.corner).map(({ lines, corner }) => (
          <div key={corner} className={cn("absolute", CORNERS[corner!])}>
            <Lines lines={lines} />
          </div>
        ))}
      </div>

      <div className="relative flex flex-col items-center">
        {/* Figma "Expressions" (`>_<`): Micro Bot's glassy screen. */}
        {/* Figma "Expressions": Micro Bot's face, the same frames as the launcher (120px wide). */}
        <span
          aria-hidden
          className="relative block h-[calc(59.618*var(--u))] w-[calc(120*var(--u))] overflow-hidden border-[calc(1.529*var(--u))] border-primary-foreground/12 backdrop-blur-[16px]"
        >
          <MicroBotFaceFrames unit={`calc(var(--u) * ${120 / 54})`} />
        </span>
        <h1
          className={cn(
            vt323.className,
            "mt-[calc(23.4*var(--u))] text-[calc(185.56*var(--u))] leading-[calc(143*var(--u))] whitespace-nowrap",
          )}
        >
          (ERROR 404)<span className="sr-only"> Page not found</span>
        </h1>
        <p className="mt-4 text-sm text-cyan-500 lg:hidden">( PAGE NOT FOUND )</p>
        {/* Figma "Buttons": white with the primary label, cyan with a white label on hover. */}
        <Link
          href="/"
          className="mt-[max(1.5rem,calc(34*var(--u)))] flex h-10 w-41.25 items-center justify-center border border-border bg-primary-foreground text-sm leading-5 font-medium text-primary transition-colors duration-200 outline-none hover:bg-cyan-500 hover:text-primary-foreground focus-visible:ring-4 focus-visible:ring-ring"
        >
          GO HOME
        </Link>
      </div>
    </main>
  )
}
