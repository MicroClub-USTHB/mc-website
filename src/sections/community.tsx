import { ActivityList } from "@/components/community/activity-list"
import { DiscordIcon } from "@/components/site-footer/brand-icons"
import { JsonLd } from "@/components/shared/json-ld"
import { SectionContainer } from "@/components/shared/section-container"
import { McButton } from "@/components/ui/mc-button"
import { siteConfig } from "@/config/site"
import { COMMUNITY, COMMUNITY_ACTIVITIES } from "@/const/community"

/** schema.org ItemList of the community activities, with the Discord server as MicroClub's page. */
const COMMUNITY_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: `${siteConfig.name} Community activities`,
  description: COMMUNITY.intro,
  numberOfItems: COMMUNITY_ACTIVITIES.length,
  itemListElement: COMMUNITY_ACTIVITIES.map((activity, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: activity.title,
    description: activity.description,
  })),
  author: {
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    sameAs: [COMMUNITY.cta.href],
  },
}

/**
 * MC Community (Figma): intro with the Discord invite, then the numbered list of community
 * activities, at most one open at a time. Server Component: the texts are in the server-rendered HTML;
 * only the open row and its animation are a client island.
 */
export function Community() {
  return (
    <SectionContainer id="community" aria-labelledby="community-title" bleed>
      <JsonLd data={COMMUNITY_JSON_LD} />
      <div className="mx-auto max-w-site px-4 pt-24 pb-20 sm:px-6 lg:px-20 lg:pb-52">
        <header className="flex flex-col items-start">
          <h2
            id="community-title"
            className="header-md font-medium whitespace-pre text-primary uppercase sm:header-lg lg:header-xl"
          >
            {COMMUNITY.title}
          </h2>
          <p className="mt-2.5 max-w-296 paragraph-lg font-medium text-muted-foreground lg:max-w-none lg:header-xs">
            {COMMUNITY.intro}
          </p>
          <McButton
            size="xl"
            icon="leading"
            iconDefinition={<DiscordIcon />}
            nativeButton={false}
            render={<a href={COMMUNITY.cta.href} target="_blank" rel="noopener noreferrer" />}
            className="mt-6 font-bold lg:py-[11px] [&_[data-slot=leading-icon]]:size-5"
          >
            {COMMUNITY.cta.label}
            <span className="sr-only"> (opens in a new tab)</span>
          </McButton>
        </header>

        <ActivityList activities={COMMUNITY_ACTIVITIES} />
      </div>
    </SectionContainer>
  )
}
