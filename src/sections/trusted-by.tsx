import {
  HoveredPartnerName,
  HoveredPartnerProvider,
  PartnerHoverArea,
} from "@/components/trusted-by/hovered-partner"
import { LogoCell } from "@/components/trusted-by/logo-cell"
import { LogoMarquee } from "@/components/trusted-by/logo-marquee"
import { JsonLd } from "@/components/shared/json-ld"
import { SectionContainer } from "@/components/shared/section-container"
import { siteConfig } from "@/config/site"
import { TRUSTED_BY_ROWS, type Partner } from "@/const/trusted-by"

/** schema.org Organization listing every partner as a sponsor of Micro Club. */
const TRUSTED_BY_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  sponsor: TRUSTED_BY_ROWS.flatMap((row) => row.partners).map((partner) => ({
    "@type": "Organization",
    name: partner.name,
    logo: new URL(partner.logo, siteConfig.url).href,
  })),
}

/** Minimum tiles in one copy of the loop, so a copy is wider than ultra-wide screens. */
const LOOP_MIN_ITEMS = 16
/** Seconds for one tile to scroll by in the loop. */
const SECONDS_PER_ITEM = 5

function fillLoop(partners: Partner[]) {
  return Array.from({ length: Math.ceil(LOOP_MIN_ITEMS / partners.length) }, () => partners).flat()
}

/**
 * Trusted By (Figma): partner logos in three rows of tiles, the top and bottom ones fixed and
 * centered, the middle one full width and moving in an endless loop. Hovering a tile names its
 * partner in the title ("TRUSTED BY : DJEEZY"), back to "TRUSTED BY" otherwise.
 *
 * Figma spacing: tiles 13px apart, rows 11px apart.
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
      <JsonLd data={TRUSTED_BY_JSON_LD} />
      <HoveredPartnerProvider>
        <div className="@container mx-auto max-w-site px-4 pt-24 pb-24 sm:px-6 lg:px-20">
          <h2
            id="trusted-by-title"
            className="flex min-w-0 items-center header-md whitespace-nowrap text-primary uppercase sm:header-lg lg:header-xl short:header-md"
          >
            Trusted By
            <HoveredPartnerName nameClassName="header-md font-medium text-accent-foreground lg:header-lg" />
          </h2>

          <PartnerHoverArea className="mt-8 flex flex-col gap-2.75 [--logo-cell:min(12rem,calc((100cqw-var(--logo-gap))/2))] [--logo-gap:0.8125rem] md:[--logo-cell:min(14rem,calc((100cqw-4*var(--logo-gap))/5))] lg:mt-9">
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
          </PartnerHoverArea>
        </div>
      </HoveredPartnerProvider>
    </SectionContainer>
  )
}
