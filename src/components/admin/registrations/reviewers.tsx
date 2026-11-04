import type { ReviewState } from "@/lib/registrations/status"
import type { decisions } from "@/lib/registrations/timeline"
import { cn } from "@/lib/utils"

/** Decision of a reviewer holding a place: its word and the color of its dot. */
const DECISIONS: Record<Exclude<ReviewState, "pending">, { label: string; dot: string }> = {
  accepted: { label: "Accepted", dot: "bg-success" },
  rejected: { label: "Rejected", dot: "bg-destructive" },
  interview: { label: "Interview", dot: "bg-info" },
}

/**
 * Who reviewed an application, in the registrations and recommendations tables: each HR member holding a place, their
 * latest decision first, with that decision (a colored dot and its word), so whom to talk to about
 * a conflict or a decision shows without opening the registration.
 */
export function Reviewers({ reviewers }: { reviewers: ReturnType<typeof decisions> }) {
  if (reviewers.length === 0) {
    return <span className="text-muted-foreground">Not reviewed yet</span>
  }

  return (
    <ul className="flex min-w-40 flex-col gap-1">
      {reviewers.map(({ name, state }) => {
        // `pending` frees the place, so a reviewer listed here has decided.
        const decision = DECISIONS[state as keyof typeof DECISIONS]
        return (
          <li key={name} className="flex items-center gap-2 whitespace-nowrap">
            <span aria-hidden className={cn("size-2 shrink-0 rounded-full", decision?.dot)} />
            <span className="font-medium text-foreground">{name}</span>
            <span className="text-muted-foreground">{decision?.label}</span>
          </li>
        )
      })}
    </ul>
  )
}
