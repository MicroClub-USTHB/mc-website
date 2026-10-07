import { PhotoSpiral, spiralClearSide } from "@/components/about/photo-spiral"
import { RevealText } from "@/components/about/reveal-text"
import { SectionContainer } from "@/components/shared/section-container"
import { ABOUT_PARAGRAPHS } from "@/const/about"
import { cn } from "@/lib/utils"

const LEFT = "left-4 sm:left-6 lg:left-28"
const RIGHT = "right-4 text-right sm:right-6 lg:right-28"

/**
 * Placement of each paragraph in the spiral's clear sides (Figma: left, right, left with 112px
 * side margins and these widths). Narrower screens give each one half the width.
 */
const PARAGRAPH_LAYOUT = [
  { top: spiralClearSide("left", 0), className: cn(LEFT, "lg:max-w-90") },
  { top: spiralClearSide("right", 0), className: cn(RIGHT, "lg:max-w-86") },
  { top: spiralClearSide("left", 1), className: cn(LEFT, "lg:max-w-125") },
]

/**
 * About Us (Figma): a 3D spiral of club photos that rotates with the scroll, with the club story
 * typed in on alternating sides. Server Component: the text is in the server-rendered HTML.
 */
export function About() {
  return (
    <SectionContainer id="about" aria-labelledby="about-title" bleed className="overflow-hidden">
      <h2 id="about-title" className="sr-only">
        About Us
      </h2>

      {/*
        `--u`: one horizontal Figma px, scaled down when the spiral (~740px wide) would not fit.
        The padding leaves room for the nearest panels, which bulge past the spiral in perspective,
        and the mask fades them out at the section edges.
      */}
      <div className="mx-auto max-w-site mask-[linear-gradient(to_bottom,transparent,black_8rem,black_calc(100%-8rem),transparent)] py-20 [--u:min(1px,calc(100vw/780))]">
        <div className="relative">
          <PhotoSpiral />

          {ABOUT_PARAGRAPHS.map((paragraph, i) => (
            <RevealText
              key={paragraph}
              text={paragraph}
              className={cn(
                "absolute w-[calc(50%-1.5rem)] -translate-y-1/2 paragraph-sm text-foreground sm:paragraph-md",
                PARAGRAPH_LAYOUT[i].className,
              )}
              style={{ top: PARAGRAPH_LAYOUT[i].top }}
            />
          ))}
        </div>
      </div>
    </SectionContainer>
  )
}
