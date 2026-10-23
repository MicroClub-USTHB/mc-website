import { DepartmentArtLayers } from "@/components/departments/department-art-layers"
import type { DepartmentId } from "@/const/departments"
import { departmentArtSize } from "@/lib/departments/art"

/**
 * A department's illustration, inlined so its shapes can move between the strip and the card
 * (see `scripts/department-art.mjs`, which generates `art/<id>.svg` from the Figma variants).
 * Its markup (the largest part of the page, decorative) is not in the page's HTML: it is fetched
 * as the section comes near (`DepartmentArtLayers`, from `/art/departments/<id>`).
 * Each group of shapes moving together is its own `<svg>` (one shared `<defs>`), moved with a CSS
 * transform on that element: the browser composites it on the GPU, where a transform inside a
 * single SVG would repaint the whole art, filters and blurs included, every frame.
 * The layers are drawn at the art's size in px (one px per viewBox unit, so the transforms keep
 * the art's units), scaled to the panel (`--s`).
 * In the accordion, it opens the card under its header (`--hh`): its window shows the card art
 * down to the footer tab, the text follows. The closed bar's shapes sit on the window's top (see
 * `department-panels.tsx`), so the art keeps its place while the card unfolds below. From `lg`,
 * drawn over the whole panel in Figma card coordinates (the frame's 2px stroke sits outside the
 * panel), scaled with the row (`--k`).
 */
export function DepartmentArt({ id }: { id: DepartmentId }) {
  const { width, height } = departmentArtSize(id)

  return (
    <div className="order-first aspect-606/420 lg:order-none lg:aspect-auto">
      <div
        // The window ends at the tab (785 of the 832 frame, 5.65% from the bottom) and starts at
        // 785 - 420 × 610/606, 43.54% down the art: that line sits under the header. Clipped to the
        // header and the window: the text follows. Moved down under the header (`--hh`) with a
        // `translate`, not `top`: animated as the header shrinks, without laying the page out again.
        style={{ aspectRatio: `${width} / ${height}` }}
        className="absolute top-0 left-0 -z-10 w-full [translate:0_calc(var(--hh)-43.54%)] [clip-path:inset(calc(43.54%-var(--hh))_0_5.65%_0)] motion-safe:transition-[translate] motion-safe:duration-700 motion-safe:ease-out-expo lg:top-[calc(-0.125rem*var(--k))] lg:left-[calc(-0.125rem*var(--k))] lg:w-[calc(38.125rem*var(--k))] lg:[translate:none] lg:[clip-path:none]"
      >
        <DepartmentArtLayers id={id} width={width} height={height} />
      </div>
    </div>
  )
}
