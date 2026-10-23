import { Children } from "react"

import { StickyUnder } from "@/components/shared/sticky-under"

/**
 * Section-to-section transition, for a change of theme (light to dark or back): the first
 * section stays put once its end reaches the bottom of the screen, and the next one scrolls up
 * over it, like a card laid on top. The first child is the section left behind, the rest scroll
 * over it (stacks can nest: a section covered here can cover the next in its own stack). The
 * covering sections must be at least a screen tall together, or the covered one shows above them
 * once they have passed: add the following sections to the stack when they are not.
 * Pure CSS (`position: sticky`); only the covered section's height is measured, to stick at its end.
 */
export function SectionStack({ children }: { children: React.ReactNode }) {
  const [under, ...over] = Children.toArray(children)
  return (
    <div>
      <StickyUnder>{under}</StickyUnder>
      <div className="relative z-10">
        {/* Its top edge: once above the screen, the covered section is hidden (`StickyUnder`). */}
        <div
          data-stack-edge
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
        />
        {over}
      </div>
    </div>
  )
}
