import { cn } from "@/lib/utils"

/** Shared stroke styling, matching lucide icons (24 px grid, 2 px round strokes). */
const LINE =
  "origin-center transition-[translate,rotate,scale,opacity] duration-500 ease-in-out-quart [transform-box:fill-box]"

/**
 * Hamburger that morphs into a close cross: the outer lines slide to the center and rotate,
 * the middle one collapses. Driven by `data-open` on a parent `group`.
 */
export function MenuToggleIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className={cn("overflow-visible", className)}
    >
      <line
        x1="4"
        y1="6"
        x2="20"
        y2="6"
        className={cn(LINE, "group-data-open:translate-y-1.5 group-data-open:rotate-45")}
      />
      <line
        x1="4"
        y1="12"
        x2="20"
        y2="12"
        className={cn(LINE, "group-data-open:scale-x-0 group-data-open:opacity-0")}
      />
      <line
        x1="4"
        y1="18"
        x2="20"
        y2="18"
        className={cn(LINE, "group-data-open:-translate-y-1.5 group-data-open:-rotate-45")}
      />
    </svg>
  )
}
