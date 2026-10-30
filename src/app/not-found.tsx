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

/** Terminal boot of a block (`globals.css`): typed in `--n` steps over `--t`, from `--d`. */
const BOOT =
  "motion-safe:animate-[nf-type_var(--t)_steps(var(--n))_var(--d)_both,nf-flicker_var(--t)_linear_var(--d)_both]"

/** Boot timing of a block `length` characters wide, the `order`-th to appear. */
function boot(length: number, order: number, start = 150) {
  const n = Math.min(40, Math.max(4, length))
  return {
    "--n": n,
    "--t": `${Math.min(700, Math.max(250, n * 22))}ms`,
    "--d": `${start + order * 45}ms`,
  } as React.CSSProperties
}

const longest = (lines: string[]) => Math.max(...lines.map((line) => line.trim().length))

/** The lines in the order they boot: top to bottom, then left to right. */
const ORDER = new Map(
  [...NOT_FOUND_LINES].sort((a, b) => a.y - b.y || a.x - b.x).map((line, i) => [line, i]),
)

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
        {NOT_FOUND_LINES.map((line) => (
          <div
            key={`${line.x}-${line.y}`}
            className={cn(
              "absolute",
              BOOT,
              line.align === "right" && "-translate-x-full text-right",
              line.cyan && "text-cyan-500",
            )}
            style={{
              left: `${(line.x / 1440) * 100}%`,
              top: `${(line.y / 1024) * 100}%`,
              ...boot(longest(line.lines), ORDER.get(line)!),
            }}
          >
            <Lines lines={line.lines} />
          </div>
        ))}
        <Image
          src={barcode}
          alt=""
          unoptimized
          // In the first view, often the largest paint of the page: not lazy.
          loading="eager"
          className={cn("absolute h-auto", BOOT)}
          style={{
            left: `${(1001 / 1440) * 100}%`,
            top: `${(772 / 1024) * 100}%`,
            width: "calc(422 * var(--u))",
            ...boot(20, 22),
          }}
        />
      </div>

      <div aria-hidden className="text-[13px] leading-5 sm:text-sm lg:hidden">
        {NOT_FOUND_LINES.filter((line) => line.corner).map(({ lines, corner }, i) => (
          <div
            key={corner}
            className={cn("absolute", BOOT, CORNERS[corner!])}
            style={boot(longest(lines), i * 3)}
          >
            <Lines lines={lines} />
          </div>
        ))}
      </div>

      <div className="relative flex flex-col items-center">
        {/* Figma "Expressions": Micro Bot's face (the launcher's frames, then `×_×`), 120px wide. */}
        <span
          aria-hidden
          className="relative block h-[calc(59.618*var(--u))] w-[calc(120*var(--u))] overflow-hidden border-[calc(1.529*var(--u))] border-primary-foreground/12 backdrop-blur-[16px] motion-safe:animate-[nf-flicker_400ms_linear_both]"
        >
          <MicroBotFaceFrames unit={`calc(var(--u) * ${120 / 54})`} dead />
        </span>
        <h1
          style={boot(11, 0, 250)}
          className={cn(
            vt323.className,
            BOOT,
            "mt-[calc(23.4*var(--u))] text-[calc(185.56*var(--u))] leading-[calc(143*var(--u))] whitespace-nowrap",
          )}
        >
          (ERROR 404)<span className="sr-only"> Page not found</span>
        </h1>
        <p style={boot(18, 0, 600)} className={cn("mt-4 text-sm text-cyan-500 lg:hidden", BOOT)}>
          ( PAGE NOT FOUND )
        </p>
        {/* Figma "Buttons": white with the primary label, cyan with a white label on hover. */}
        <Link
          href="/"
          style={{ animationDelay: "750ms" }}
          className="mt-[max(1.5rem,calc(34*var(--u)))] flex h-10 w-41.25 items-center justify-center border border-border bg-primary-foreground text-sm leading-5 font-medium text-primary transition-colors duration-200 outline-none hover:bg-cyan-500 hover:text-primary-foreground focus-visible:ring-4 focus-visible:ring-ring motion-safe:animate-[nf-flicker_400ms_linear_both]"
        >
          GO HOME
        </Link>
      </div>
    </main>
  )
}
