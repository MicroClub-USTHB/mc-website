import { readFileSync } from "node:fs"
import { join } from "node:path"

import type { DepartmentId } from "@/const/departments"

const ART_DIR = join(process.cwd(), "src/components/departments/art")

/**
 * A department's illustration, inlined so its shapes can move between the strip and the card
 * (see `scripts/department-art.mjs`, which generates `art/<id>.svg` from the Figma variants).
 * In the accordion, it opens the card under its header (`--hh`): its window shows the card art
 * down to the footer tab, the text follows. The closed bar's shapes sit on the window's top (see
 * `department-panels.tsx`), so the art keeps its place while the card unfolds below. From `lg`,
 * drawn over the whole panel in Figma card coordinates (the frame's 2px stroke sits outside the
 * panel), scaled with the row (`--k`).
 */
export function DepartmentArt({ id }: { id: DepartmentId }) {
  const svg = readFileSync(join(ART_DIR, `${id}.svg`), "utf8")

  return (
    <div className="order-first aspect-606/420 lg:order-none lg:aspect-auto">
      <div
        // The window ends at the tab (785 of the 832 frame, 5.65% from the bottom) and starts at
        // 785 - 420 × 610/606, 43.54% down the art: that line sits under the header. Clipped to the
        // header and the window: the text follows.
        className="absolute top-(--hh) left-0 -z-10 w-full -translate-y-[43.54%] [clip-path:inset(calc(43.54%-var(--hh))_0_5.65%_0)] motion-safe:transition-[top] motion-safe:duration-700 motion-safe:ease-out-expo lg:top-[calc(-0.125rem*var(--k))] lg:left-[calc(-0.125rem*var(--k))] lg:w-[calc(38.125rem*var(--k))] lg:translate-y-0 lg:[clip-path:none] [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  )
}
