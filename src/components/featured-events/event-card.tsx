import Image from "next/image"
import type { ComponentProps, CSSProperties } from "react"

import { McButton } from "@/components/ui/mc-button"
import type { EventSizedImage, FeaturedEvent } from "@/const/featured-events"
import { cn } from "@/lib/utils"

/**
 * Logos come in very different shapes (from 64×44 to 161×27). Each one is sized to the same area
 * as the Figma GHCTF logo (94×34, 1.75em tall), so square and wide logos carry the same visual
 * weight: a squarer logo gets taller, a wider one shorter.
 */
const LOGO_REFERENCE_RATIO = 94 / 34

function logoScale(logo: EventSizedImage) {
  return Math.sqrt(LOGO_REFERENCE_RATIO / (logo.width / logo.height))
}

/**
 * Reusable event card: cover photo on the left, event logo and short name on top of the text
 * panel, description and links (stacked) at the bottom. Logo, description and links are skipped
 * while the event does not have them yet: `null` logo, empty description, links with an empty
 * `href`. Everything comes from the `event` prop, so the same card serves every event. It
 * forwards props to the `<article>`, so it can be the `render` target of a dialog popup.
 *
 * Below `lg` it stacks (photo first, natural height). From `lg` it is a fixed-ratio card: two
 * cover-wide halves, so the whole photo shows without cropping, and it is never wider than what
 * fits in the viewport height (`100svh` minus the 8rem of vertical padding around it).
 * The text panel then scales with the card width (`cqw`), so text and image always show complete.
 */
export function EventCard({
  event,
  className,
  style,
  ...props
}: { event: FeaturedEvent } & ComponentProps<"article">) {
  const titleId = `event-${event.id}-title`
  const { cover } = event
  // Links without a URL yet are skipped.
  const links = event.link.filter((link) => link.href)

  return (
    <article
      {...props}
      aria-labelledby={titleId}
      style={
        {
          ...style,
          "--cover-ratio": cover.width / cover.height,
          "--card-ratio": (2 * cover.width) / cover.height,
        } as CSSProperties
      }
      className={cn(
        "@container mx-auto my-auto grid w-full max-w-site overflow-hidden border border-border bg-card text-card-foreground lg:aspect-(--card-ratio) lg:w-[min(65%,calc((100svh-8rem)*var(--card-ratio)))] lg:grid-cols-2",
        className,
      )}
    >
      <div className="relative aspect-(--cover-ratio) lg:aspect-auto">
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          sizes="(min-width: 1440px) 720px, (min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-col justify-between gap-12 p-6 sm:p-8 lg:gap-[1.5em] lg:p-[5cqw] lg:text-[length:clamp(0.75rem,1.8cqw,1.25rem)]">
        <div className="flex items-start justify-between gap-4">
          {event.logo ? (
            <Image
              src={event.logo.src}
              alt={event.logo.alt}
              width={event.logo.width}
              height={event.logo.height}
              style={{ "--logo-scale": logoScale(event.logo) } as CSSProperties}
              className="h-[calc(1.5rem*var(--logo-scale))] w-auto lg:h-[calc(1.75em*var(--logo-scale))]"
            />
          ) : (
            <span />
          )}
          <h3
            id={titleId}
            className="paragraph-xl font-normal text-muted-foreground lg:text-[1.43em] lg:leading-tight"
          >
            {event.name}
          </h3>
        </div>

        <div className="flex flex-col items-start gap-5 lg:gap-[1.2em]">
          {event.description && (
            <p className="paragraph-md text-muted-foreground lg:text-[1em] lg:leading-normal">
              {event.description}
            </p>
          )}
          {links.length > 0 && (
            <ul className="flex flex-col items-start gap-2 lg:gap-[0.6em]">
              {links.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <McButton
                    variant="link"
                    size="sm"
                    icon="leading"
                    nativeButton={false}
                    render={<a href={link.href} target="_blank" rel="noopener noreferrer" />}
                    className="lg:text-[1em] lg:[&_[data-slot=leading-icon]]:size-[1.15em]"
                  >
                    {link.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </McButton>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  )
}
