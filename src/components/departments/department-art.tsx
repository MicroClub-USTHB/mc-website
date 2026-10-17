import { readFileSync } from "node:fs"
import { join } from "node:path"

import type { DepartmentId } from "@/const/departments"

const ART_DIR = join(process.cwd(), "src/components/departments/art")

/**
 * A department's illustration, inlined so its shapes can move between the strip and the card
 * (see `scripts/department-art.mjs`, which generates `art/<id>.svg` from the Figma variants).
 * In the accordion, the card art under the text, cropped above the footer tab. From `lg`, drawn
 * over the whole panel in Figma card coordinates (the frame's 2px stroke sits outside the panel).
 */
export function DepartmentArt({ id }: { id: DepartmentId }) {
  const svg = readFileSync(join(ART_DIR, `${id}.svg`), "utf8")

  return (
    <div className="relative aspect-606/420 overflow-hidden lg:static lg:aspect-auto lg:overflow-visible">
      <div
        // The art stops at the tab (785 of the 832px frame): its last 5.65% hangs below the crop.
        className="absolute bottom-0 left-0 w-full translate-y-[5.65%] lg:-top-0.5 lg:bottom-auto lg:-left-0.5 lg:-z-10 lg:w-152.5 lg:translate-y-0 [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  )
}
