import { formatDistanceToNow } from "date-fns"
import {
  CalendarClockIcon,
  CheckIcon,
  RotateCcwIcon,
  StarIcon,
  StarOffIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react"

import { McBadge } from "@/components/ui/mc-badge"
import { formatClubTime } from "@/lib/dates"
import { recommendationTargetName } from "@/lib/registrations/recommendations"
import type { ReviewState } from "@/lib/registrations/status"
import { currentRecommendation, type TimelineEntry } from "@/lib/registrations/timeline"
import { cn } from "@/lib/utils"

type Tone = "secondary" | "info" | "success" | "destructive" | "default"

/** Marker color of each tone: the badge's colors, as a dot on the line. */
const MARKERS: Record<Tone, string> = {
  secondary: "bg-secondary text-secondary-foreground",
  info: "bg-info-foreground text-info dark:bg-info/15 dark:text-[color-mix(in_srgb,var(--color-info)_55%,white)]",
  success:
    "bg-success-foreground text-success dark:bg-success/15 dark:text-[color-mix(in_srgb,var(--color-success)_70%,white)]",
  destructive:
    "bg-destructive/10 text-destructive dark:bg-destructive/15 dark:text-[color-mix(in_srgb,var(--color-destructive)_55%,white)]",
  default: "bg-primary-foreground text-primary dark:bg-primary/10",
}

const REVIEWS: Record<ReviewState, { label: string; tone: Tone; icon: LucideIcon }> = {
  accepted: { label: "Accepted", tone: "success", icon: CheckIcon },
  rejected: { label: "Rejected", tone: "destructive", icon: XIcon },
  interview: { label: "Interview", tone: "info", icon: CalendarClockIcon },
  pending: { label: "Back to pending", tone: "secondary", icon: RotateCcwIcon },
}

/** What an entry shows: its verb, badge, marker and the text its author wrote with it. */
function describe(entry: TimelineEntry, previous: TimelineEntry[]) {
  if (entry.kind === "review") {
    const { label, tone, icon } = REVIEWS[entry.state]
    return { verb: "reviewed", badge: label, tone, icon, text: entry.reason }
  }
  if (entry.kind === "recommendation-removed") {
    return { verb: "removed the recommendation", tone: "secondary" as const, icon: StarOffIcon }
  }
  // One recommendation per application: a new one changes or replaces the one before it.
  const before = currentRecommendation(previous)
  const verb = !before
    ? "recommended to"
    : before.actorId === entry.actorId
      ? "changed their recommendation to"
      : `replaced ${before.actorName}'s recommendation with`
  return {
    verb,
    badge: recommendationTargetName(entry.target),
    tone: "default" as const,
    icon: StarIcon,
    text: entry.note,
  }
}

/**
 * Every review and recommendation of a registration, newest first: a marker per entry on a
 * vertical line (its icon and color tell the action at a glance), the person and the action, the
 * reason or note they gave quoted under it, and how long ago (the exact date on hover).
 */
export function RegistrationTimeline({ timeline }: { timeline: TimelineEntry[] }) {
  if (timeline.length === 0) {
    return <p className="paragraph-sm text-muted-foreground">No reviews or recommendations yet.</p>
  }

  // Described in the order they happened (a recommendation reads the earlier ones), shown newest first.
  const entries = timeline
    .map((entry, index) => ({ entry, ...describe(entry, timeline.slice(0, index)) }))
    .reverse()

  return (
    <ol className="flex flex-col">
      {entries.map(({ entry, verb, badge, tone, icon: Icon, text }, index) => (
        <li key={entries.length - index} className="relative flex gap-3 pb-5 last:pb-0">
          {/* The line down to the next (older) entry. */}
          {index < entries.length - 1 && (
            <span aria-hidden className="absolute top-8 bottom-0 left-3.75 w-px bg-border" />
          )}
          <span
            aria-hidden
            className={cn(
              "relative grid size-8 shrink-0 place-items-center rounded-full border border-border",
              MARKERS[tone],
            )}
          >
            <Icon className="size-4" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="paragraph-md font-medium text-foreground">{entry.actorName}</span>
              <span className="paragraph-sm text-muted-foreground">{verb}</span>
              {badge && <McBadge variant={tone}>{badge}</McBadge>}
              <time
                dateTime={entry.at.toISOString()}
                title={formatClubTime(entry.at, "d MMMM yyyy 'at' HH:mm")}
                className="paragraph-sm text-muted-foreground sm:ml-auto"
              >
                {formatDistanceToNow(entry.at, { addSuffix: true })}
              </time>
            </div>
            {text && (
              <blockquote className="rounded-lg border border-border bg-muted/50 px-3 py-2 paragraph-sm break-words whitespace-pre-line text-foreground">
                {text}
              </blockquote>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
