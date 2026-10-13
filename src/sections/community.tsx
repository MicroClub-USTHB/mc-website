import { ActivityList } from "@/components/community/activity-list"
import { DiscordIcon } from "@/components/site-footer/brand-icons"
import { SectionContainer } from "@/components/shared/section-container"
import { McButton } from "@/components/ui/mc-button"
import { COMMUNITY, COMMUNITY_ACTIVITIES } from "@/const/community"

/**
 * MC Community (Figma): intro with the Discord invite, then the numbered list of community
 * activities, one open at a time. Server Component: the texts are in the server-rendered HTML;
 * only the open row and its animation are a client island.
 */
export function Community() {
  return (
    <SectionContainer id="community" aria-labelledby="community-title" bleed>
      <div className="mx-auto max-w-site px-4 pt-24 pb-20 sm:px-6 lg:px-20 lg:pb-32">
        <header className="flex flex-col items-start">
          <h2
            id="community-title"
            className="header-md text-primary uppercase sm:header-lg lg:header-xl"
          >
            {COMMUNITY.title}
          </h2>
          <p className="mt-2 max-w-296 paragraph-lg text-muted-foreground lg:header-xs">
            {COMMUNITY.intro}
          </p>
          <McButton
            size="xl"
            icon="leading"
            iconDefinition={<DiscordIcon />}
            nativeButton={false}
            render={<a href={COMMUNITY.cta.href} target="_blank" rel="noopener noreferrer" />}
            className="mt-5"
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
