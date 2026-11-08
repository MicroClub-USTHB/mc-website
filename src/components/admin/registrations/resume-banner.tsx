import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ArrowRightIcon, BookmarkIcon } from "lucide-react"

import { StatusBadge } from "@/components/admin/registrations/status-badge"
import { McButton } from "@/components/ui/mc-button"
import { registrationRoute } from "@/config/admin"
import { getReviewPlace } from "@/lib/registrations/place-store"
import { PLACE_SOURCE_LABELS } from "@/lib/registrations/place"

/** "Continue where you stopped": the member's place (see `place.ts`), above the list. */
export async function ResumeBanner({ userId }: { userId: string }) {
  const place = await getReviewPlace(userId)
  if (!place) return null

  return (
    <section
      aria-label="Continue where you stopped"
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
          <BookmarkIcon className="size-5" aria-hidden />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="paragraph-sm text-muted-foreground">Continue where you stopped</p>
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <span className="min-w-0 truncate paragraph-md font-medium text-foreground">
              {place.name}
            </span>
            <StatusBadge status={place.ownState ?? place.status} />
          </div>
          <p className="paragraph-sm text-muted-foreground">
            {PLACE_SOURCE_LABELS[place.source]} it{" "}
            {formatDistanceToNow(place.at, { addSuffix: true })}
          </p>
        </div>
      </div>
      <McButton
        icon="trailing"
        iconDefinition={<ArrowRightIcon className="size-4" />}
        nativeButton={false}
        render={<Link href={registrationRoute(place.registrationId, place.listQuery)} />}
        className="shrink-0"
      >
        Continue
      </McButton>
    </section>
  )
}
