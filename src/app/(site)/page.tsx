import type { Metadata } from "next"

import { JsonLd } from "@/components/shared/json-ld"
import { SectionStack } from "@/components/shared/section-stack"
import { siteConfig } from "@/config/site"
import { CONTACT } from "@/const/contact"
import { PROFESSIONAL_LINKS, SOCIAL_TILES } from "@/const/site-footer"
import { About } from "@/sections/about"
import { ClubSections } from "@/sections/club-sections"
import { Community } from "@/sections/community"
import { Contact } from "@/sections/contact"
import { Departments } from "@/sections/departments"
import { FeaturedEvents } from "@/sections/featured-events"
import { FeaturedProjects } from "@/sections/featured-projects"
import { Hero } from "@/sections/hero"
import { Statistics } from "@/sections/statistics"
import { TrustedBy } from "@/sections/trusted-by"

export const metadata: Metadata = {
  alternates: { canonical: "/" },
}

/**
 * The site's identity for search engines and answer engines: the club (logo, founding year,
 * address, profiles) and the website it publishes. Section snippets refer to the same club.
 */
const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: siteConfig.name,
      alternateName: "MC",
      url: siteConfig.url,
      logo: `${siteConfig.url}/icon.svg`,
      description: siteConfig.description,
      foundingDate: siteConfig.foundingDate,
      email: CONTACT.email,
      address: { "@type": "PostalAddress", ...CONTACT.address },
      // Public profiles (the Discord invite is not one).
      sameAs: [
        ...SOCIAL_TILES.filter((tile) => tile.external && tile.id !== "discord"),
        ...PROFESSIONAL_LINKS,
      ].map((link) => link.href),
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      name: siteConfig.name,
      url: siteConfig.url,
      inLanguage: "en",
      publisher: { "@id": `${siteConfig.url}/#organization` },
    },
  ],
}

// Section order is intentional: keep it in sync with `homeSections` in src/config/site.ts.
// `SectionStack`: the next section scrolls over the previous one where the theme changes.
export default function HomePage() {
  return (
    <>
      <JsonLd data={SITE_JSON_LD} />
      <SectionStack>
        <Hero />
        <About />
      </SectionStack>
      <Statistics />
      <SectionStack>
        <ClubSections />
        <FeaturedProjects />
      </SectionStack>
      <SectionStack>
        <Departments />
        <SectionStack>
          <FeaturedEvents />
          {/* Sponsors alone is shorter than the screen: the rest of the page covers with it. */}
          <TrustedBy />
          <Community />
          <Contact />
        </SectionStack>
      </SectionStack>
    </>
  )
}
