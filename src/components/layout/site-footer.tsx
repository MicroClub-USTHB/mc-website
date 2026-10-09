import { JsonLd } from "@/components/shared/json-ld"
import { ContactTile } from "@/components/site-footer/contact-tile"
import { FallingTiles } from "@/components/site-footer/falling-tiles"
import { footerLinks, siteConfig } from "@/config/site"
import {
  CONTACT_EMAIL,
  CONTACT_TILES,
  FOUNDING_YEAR,
  PROFESSIONAL_LINKS,
  SOCIAL_TILES,
} from "@/const/site-footer"

/** schema.org Organization contact facts and profiles from the footer. */
const FOOTER_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  email: CONTACT_EMAIL,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Faculty of Computer Science, USTHB, BP 32 El Alia",
    addressLocality: "Bab Ezzouar",
    addressRegion: "Algiers",
    addressCountry: "DZ",
  },
  sameAs: [...SOCIAL_TILES, ...PROFESSIONAL_LINKS].map((link) => link.href),
}

const linkClassName =
  "paragraph-lg text-primary underline-offset-4 outline-none hover:underline focus-visible:underline"

/**
 * Footer (Figma): contact tiles on the left, laid out as the Figma pile but raised, that fall into
 * that pile with physics when the end of the page comes into view (see `FallingTiles`), and link
 * columns with the copyright on the right, split by a vertical line. Stacked on smaller screens,
 * the pile last.
 *
 * Figma spacing (1440px frame): the line is 540px tall, 108px from the top and 59px from the
 * bottom; the right column is inset 80px from it with 36px of padding top and bottom.
 *
 * Server Component: links and text are in the server-rendered HTML; only the physics is client.
 */
export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="overflow-hidden bg-background text-foreground">
      <JsonLd data={FOOTER_JSON_LD} />
      <div className="mx-auto flex max-w-site flex-col lg:flex-row">
        {/*
          `--u`: one Figma px at 70% (tiles half the Figma area), scaled down further when the pile
          (455px wide with its margins) would not fit.
          `--pile-top`: where the pile hangs before it falls (lined up with "Navigation" on desktop).
        */}
        <FallingTiles className="@container h-90 [--pile-top:2.5rem] [--u:min(0.7px,calc(100cqw/650))] max-lg:order-last sm:h-100 sm:[--pile-top:3rem] lg:h-auto lg:w-1/2 lg:[--pile-top:9rem]">
          <ul aria-label="Social media">
            {SOCIAL_TILES.map((tile) => (
              <li key={tile.id}>
                <ContactTile tile={tile} />
              </li>
            ))}
          </ul>
          <ul aria-label="Contact">
            {CONTACT_TILES.map((tile) => (
              <li key={tile.id}>
                <ContactTile tile={tile} />
              </li>
            ))}
          </ul>
        </FallingTiles>

        <div className="px-4 pt-16 sm:px-6 lg:w-1/2 lg:px-0 lg:pt-27 lg:pb-[59px]">
          <div className="flex h-full flex-col border-muted-foreground/30 lg:min-h-135 lg:border-l-2 lg:py-9 lg:pr-20 lg:pl-20">
            <div className="flex flex-wrap gap-x-12 gap-y-10 lg:gap-x-0">
              <nav aria-labelledby="footer-navigation-title" className="lg:w-63">
                <h2 id="footer-navigation-title" className="header-xs text-foreground">
                  Navigation
                </h2>
                <ul className="mt-3.5 flex flex-col gap-1.5">
                  {footerLinks.map((link) => (
                    <li key={link.id}>
                      <a href={`/#${link.id}`} className={linkClassName}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <div>
                <h2 id="footer-professional-title" className="header-xs text-foreground">
                  Professional Links
                </h2>
                <ul
                  aria-labelledby="footer-professional-title"
                  className="mt-3.5 flex flex-col gap-1.5"
                >
                  {PROFESSIONAL_LINKS.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClassName}
                      >
                        {link.label}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="mt-12 paragraph-md text-muted-foreground lg:mt-auto lg:pt-12">
              © {year} Micro Club | Since {FOUNDING_YEAR} • {year - FOUNDING_YEAR} years of progress
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
