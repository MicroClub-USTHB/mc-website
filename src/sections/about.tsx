import { PhotoSpiral, spiralClearSide } from "@/components/about/photo-spiral"
import { RevealText } from "@/components/about/reveal-text"
import { SectionContainer } from "@/components/shared/section-container"
import { ABOUT_PARAGRAPHS } from "@/const/about"
import { cn } from "@/lib/utils"

/**
 * Placement of each paragraph in the spiral's clear sides (Figma: left, right, left with 112px
 * side margins). Below `lg` they stack full width over the spiral on a blurred backdrop.
 */
const PARAGRAPH_LAYOUT = [
  { top: spiralClearSide("left", 0), className: "lg:left-[calc(var(--u)*112)] lg:max-w-90" },
  {
    top: spiralClearSide("right", 0),
    className: "lg:right-[calc(var(--u)*112)] lg:left-auto lg:max-w-86 lg:text-right",
  },
  { top: spiralClearSide("left", 1), className: "lg:left-[calc(var(--u)*112)] lg:max-w-125" },
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

      {/* `--u`: one Figma px, scaled down with the viewport below the 1440px frame. */}
      <div className="relative mx-auto max-w-site [--u:clamp(0.5px,calc(100vw/1440),1px)]">
        <PhotoSpiral />

        {ABOUT_PARAGRAPHS.map((paragraph, i) => (
          <RevealText
            key={paragraph}
            text={paragraph}
            className={cn(
              "absolute inset-x-4 -translate-y-1/2 rounded-lg bg-background/80 p-4 paragraph-md text-foreground backdrop-blur-sm sm:inset-x-6",
              "lg:right-auto lg:rounded-none lg:bg-transparent lg:p-0 lg:backdrop-blur-none",
              PARAGRAPH_LAYOUT[i].className,
            )}
            style={{ top: PARAGRAPH_LAYOUT[i].top }}
          />
        ))}
      </div>
    </SectionContainer>
  )
}
