import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { VT323 } from "next/font/google"

import { McButton } from "@/components/ui/mc-button"
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
        <span
          aria-hidden
          className="relative h-[calc(59.618*var(--u))] w-[calc(120*var(--u))] border-[calc(1.529*var(--u))] border-white/12 backdrop-blur-[16px]"
        >
          <span className="absolute top-[calc(-12.99*var(--u))] left-[calc(14.42*var(--u))] font-heading text-[calc(53.809*var(--u))] leading-[calc(71.745*var(--u))] font-medium">
            {">"}
          </span>
          <span className="absolute top-[calc(41.19*var(--u))] left-[calc(45.31*var(--u))] h-[calc(4.12*var(--u))] w-[calc(30.573*var(--u))] bg-current" />
          <span className="absolute top-[calc(-12.99*var(--u))] left-[calc(72.77*var(--u))] -scale-x-100 font-heading text-[calc(53.809*var(--u))] leading-[calc(71.745*var(--u))] font-medium">
            {">"}
          </span>
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
        <McButton
          nativeButton={false}
          render={<Link href="/" />}
          className="mt-[max(1.5rem,calc(34*var(--u)))] h-10 w-41.25 rounded-none border border-border bg-primary-foreground text-sm leading-5 font-medium text-primary shadow-none hover:bg-secondary"
        >
          GO HOME
        </McButton>
      </div>
    </main>
  )
}
