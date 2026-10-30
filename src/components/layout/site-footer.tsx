import { JsonLd } from "@/components/shared/json-ld"
import { ContactTile, PILE_HEIGHT } from "@/components/site-footer/contact-tile"
import { FallingTiles } from "@/components/site-footer/falling-tiles"
import { footerLinks, siteConfig } from "@/config/site"
import { CONTACT } from "@/const/contact"
import { CONTACT_TILES, FOUNDING_YEAR, PROFESSIONAL_LINKS, SOCIAL_TILES } from "@/const/site-footer"

/** schema.org Organization contact facts and profiles from the footer. */
const FOOTER_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  foundingDate: String(FOUNDING_YEAR),
  email: CONTACT.email,
  address: { "@type": "PostalAddress", ...CONTACT.address },
  sameAs: [...SOCIAL_TILES, ...PROFESSIONAL_LINKS].map((link) => link.href),
}

/**
 * Underline drawn as a 1px background that grows from the left on hover / focus and shrinks to
 * the right when it ends (the anchor point flips with the state), so it can animate.
 */
const linkClassName =
  "paragraph-lg text-accent-foreground outline-none bg-linear-to-r from-current to-current bg-size-[0%_1px] bg-right-bottom bg-no-repeat transition-[background-size] duration-300 ease-out-quart hover:bg-size-[100%_1px] hover:bg-left-bottom focus-visible:bg-size-[100%_1px] focus-visible:bg-left-bottom motion-reduce:transition-none"

/**
 * Footer (Figma): the contact, social and professional tiles piled up at the bottom left, a
 * vertical line, and the navigation links with the copyright on the right. The tiles are laid out
 * in four tidy rows (social icons, professional icons, email, address) that fall into the pile of
 * the design when the page hits its bottom, then can be dragged and thrown (see `FallingTiles`).
 *
 * Figma only draws the 1440px frame, so the rest is ours. Units: `--u` is one Figma px of the
 * pile, `--f` one Figma px of the frame's vertical spacing. The design is shown smaller than drawn
 * (pile at 70%, spacing at 80%, so the footer stays 20% shorter) and never grows past that.
 * - From `md` (tablets, laptops, desktops): the frame's two columns. The left one is 58.33% wide
 *   plus 26px, as in Figma, and the pile shrinks to fit it; the right one keeps the text at its
 *   design size, down to 768px wide. Landscape phones and tablets fall in here by their width.
 * - Below `md` (phones): one column, the links first and the pile last, scaled to fit between the
 *   page gutters.
 * The footer is the size container `--u` is measured against.
 *
 * Server Component: links and text are in the server-rendered HTML; only the physics is client.
 */
export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="@container overflow-hidden bg-background text-foreground">
      <JsonLd data={FOOTER_JSON_LD} />
      <div className="mx-auto flex max-w-site flex-col [--pad:1rem] [--u:min(0.7px,calc((100cqw-2*var(--pad))/745))] sm:[--pad:1.5rem] md:flex-row md:[--f:0.8px] md:[--pad:calc(8*var(--u))] md:[--u:min(0.7px,calc((58.333cqw+2px)/753))]">
        <FallingTiles
          pileHeight={PILE_HEIGHT}
          className="mt-12 flex flex-col items-start gap-[calc(12*var(--u))] pt-(--hang) pl-(--pad) [--hang:calc(100*var(--u))] max-md:order-last md:mt-0 md:h-auto md:w-[calc(58.333%+26px)] md:shrink-0 md:[--hang:calc(162*var(--f))]"
        >
          <ul aria-label="Social media" className="flex gap-[calc(12*var(--u))]">
            {SOCIAL_TILES.map((tile) => (
              <li key={tile.id}>
                <ContactTile tile={tile} />
              </li>
            ))}
          </ul>
          <ul aria-label="Professional profiles" className="flex gap-[calc(12*var(--u))]">
            {PROFESSIONAL_LINKS.map((tile) => (
              <li key={tile.id}>
                <ContactTile tile={tile} />
              </li>
            ))}
          </ul>
          <ul aria-label="Contact" className="flex flex-col items-start gap-[calc(12*var(--u))]">
            {CONTACT_TILES.map((tile) => (
              <li key={tile.id}>
                <ContactTile tile={tile} />
              </li>
            ))}
          </ul>
        </FallingTiles>

        {/* Figma: the line is 138px from the top, 528px tall, with the links 24px below its top. */}
        <div className="flex flex-col gap-12 px-4 pt-16 sm:px-6 md:mt-[calc(138*var(--f))] md:mb-[calc(41*var(--f))] md:min-h-[calc(528*var(--f))] md:flex-1 md:justify-between md:gap-8 md:border-l md:border-ring md:pt-[calc(24*var(--f))] md:pr-6 md:pb-[calc(33*var(--f))] md:pl-10 lg:pl-[67px]">
          <nav aria-labelledby="footer-navigation-title">
            <h2 id="footer-navigation-title" className="header-xs text-foreground">
              Navigation
            </h2>
            <ul className="mt-4 flex flex-col gap-1.5">
              {footerLinks.map((link) => (
                <li key={link.id}>
                  <a href={`/#${link.id}`} className={linkClassName}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <p className="paragraph-md text-muted-foreground">
            © {year} Micro Club | Since {FOUNDING_YEAR}
          </p>
        </div>
      </div>
    </footer>
  )
}
