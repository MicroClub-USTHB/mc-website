import Link from "next/link"
import { ArrowUpRightIcon } from "lucide-react"

import { McButton } from "@/components/ui/mc-button"
import type { ClubSection } from "@/const/club-sections"

/** Title, description and link of one section, shown while it is open in the carousel. */
export function ClubSectionDetails({ section }: { section: ClubSection }) {
  return (
    <>
      <h3 className="header-sm font-normal text-primary md:header-lg lg:header-xl short:header-xs compact:header-xs">
        {section.title}
      </h3>
      <p className="mt-2 paragraph-md font-medium text-muted-foreground md:mt-4 md:max-w-xl md:paragraph-lg short:mt-1 short:paragraph-sm compact:mt-1 compact:paragraph-sm">
        {section.description}
      </p>
      <McButton
        variant="link"
        size="xl"
        icon="trailing"
        iconDefinition={<ArrowUpRightIcon />}
        nativeButton={false}
        render={<Link href={section.href} />}
        className="mt-4 lg:mt-7 short:mt-2 compact:mt-2"
      >
        Meet our projects
      </McButton>
    </>
  )
}
