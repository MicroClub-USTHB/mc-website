import { LogoCell } from "@/components/trusted-by/logo-cell"
import { LogoMarquee } from "@/components/trusted-by/logo-marquee"
import { SectionContainer } from "@/components/shared/section-container"
import { TRUSTED_BY_ROWS, type Partner } from "@/const/trusted-by"

/** Minimum tiles in one copy of the loop, so a copy is wider than ultra-wide screens. */
const LOOP_MIN_ITEMS = 16
/** Seconds for one tile to scroll by in the loop. */
const SECONDS_PER_ITEM = 5

function fillLoop(partners: Partner[]) {
  return Array.from({ length: Math.ceil(LOOP_MIN_ITEMS / partners.length) }, () => partners).flat()
}

/**
 * Trusted By (Figma): partner logos in three rows of tiles, the top and bottom ones fixed and
 * centered, the middle one full width and moving in an endless loop.
 *
 * Tiles share one width, `--logo-cell` (a registered length, see globals.css), computed from the
 * content width: two per row on phones (capped at 12rem), five per row from `md` (capped at the
 * Figma 14rem = 224px). Fixed rows wrap and stay centered, so they fit every screen.
 */
export function TrustedBy() {
  return (
    <SectionContainer
      id="trusted-by"
      aria-labelledby="trusted-by-title"
      bleed
      className="overflow-hidden"
    >
      <div className="@container mx-auto max-w-site px-4 pt-24 pb-20 sm:px-6 lg:px-20">
        <h2 id="trusted-by-title" className="header-lg text-primary uppercase lg:header-xl">
          Trusted By
        </h2>

        <div className="mt-8 flex flex-col gap-(--logo-gap) [--logo-cell:min(12rem,calc((100cqw-var(--logo-gap))/2))] [--logo-gap:0.75rem] md:[--logo-cell:min(14rem,calc((100cqw-4*var(--logo-gap))/5))] lg:mt-10">
          {TRUSTED_BY_ROWS.map((row) => {
            if (row.motion === "static") {
              return (
                <ul key={row.id} className="flex flex-wrap justify-center gap-(--logo-gap)">
                  {row.partners.map((partner) => (
                    <LogoCell key={partner.id} partner={partner} />
                  ))}
                </ul>
              )
            }

            const tiles = fillLoop(row.partners)
            return (
              <LogoMarquee
                key={row.id}
                itemCount={tiles.length}
                secondsPerItem={SECONDS_PER_ITEM}
                // Out of the padding, up to the 1440px site width (edge to edge on smaller screens).
                className="-mx-4 sm:-mx-6 lg:-mx-20"
              >
                {tiles.map((partner, index) => (
                  <LogoCell
                    key={`${partner.id}-${index}`}
                    partner={partner}
                    decorative={index >= row.partners.length}
                    trackedHover
                  />
                ))}
              </LogoMarquee>
            )
          })}
        </div>
      </div>
    </SectionContainer>
  )
}
