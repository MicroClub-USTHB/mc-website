import { format } from "date-fns"

import { recommendationTargetName } from "@/lib/registrations/recommendations"
import type { ReviewState } from "@/lib/registrations/status"
import { currentRecommendation, type TimelineEntry } from "@/lib/registrations/timeline"

const REVIEW_ACTIONS: Record<ReviewState, string> = {
  accepted: "accepted",
  rejected: "rejected",
  interview: "moved to interview",
  pending: "moved back to pending",
}

/** The action of an entry, e.g. `accepted with reason "..."`, after the person's name. */
function describe(entry: TimelineEntry, previous: TimelineEntry[]) {
  if (entry.kind === "review") {
    const action = REVIEW_ACTIONS[entry.state]
    return entry.reason ? `${action} with reason "${entry.reason}"` : action
  }
  if (entry.kind === "recommendation-removed") return "removed their recommendation"

  const changed = currentRecommendation(previous, entry.actorId) !== undefined
  const action = `${changed ? "changed their recommendation to" : "recommended to"} "${recommendationTargetName(entry.target)}"`
  return entry.note ? `${action} with note "${entry.note}"` : action
}

/** Every review and recommendation of a registration, oldest first. */
export function RegistrationTimeline({ timeline }: { timeline: TimelineEntry[] }) {
  if (timeline.length === 0) {
    return <p className="paragraph-sm text-muted-foreground">No reviews or recommendations yet.</p>
  }

  return (
    <ol className="flex flex-col gap-3">
      {timeline.map((entry, index) => (
        <li key={index} className="flex flex-col gap-0.5">
          <p className="paragraph-md break-words whitespace-pre-line text-foreground">
            <span className="font-medium">{entry.actorName}</span>{" "}
            {describe(entry, timeline.slice(0, index))}
          </p>
          <time dateTime={entry.at.toISOString()} className="paragraph-sm text-muted-foreground">
            {format(entry.at, "d MMMM yyyy 'at' HH:mm")}
          </time>
        </li>
      ))}
    </ol>
  )
}
