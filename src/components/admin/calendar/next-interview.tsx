import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ArrowRightIcon, CalendarClockIcon } from "lucide-react"

import { registrationRoute } from "@/config/admin"
import { formatClubTime } from "@/lib/dates"
import type { CalendarInterview } from "@/lib/registrations/interview-store"
import { interviewEnd } from "@/lib/registrations/interview"

/**
 * The signed-in member's next interview: the earliest one they host that has not ended yet, or
 * nothing when they host none.
 */
export function NextInterview({
  items,
  userId,
  now,
}: {
  items: CalendarInterview[]
  userId: string
  now: Date
}) {
  const next = items
    .filter(
      (item) => item.at && item.interviewerId === userId && interviewEnd(item.at, item.endAt) > now,
    )
    .sort((a, b) => new Date(a.at!).getTime() - new Date(b.at!).getTime())[0]
  if (!next?.at) return null

  const started = new Date(next.at) <= now
  return (
    <section
      aria-label="Your next interview"
      className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <CalendarClockIcon className="size-5" aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="paragraph-sm font-medium text-primary">
          {started ? "Your interview is happening now" : "Your next interview"}
        </p>
        <p className="truncate header-xs font-heading text-foreground">{next.name}</p>
        <p className="paragraph-sm text-muted-foreground">
          <time dateTime={next.at}>
            {formatClubTime(next.at, "EEEE d MMMM, HH:mm")} –{" "}
            {formatClubTime(interviewEnd(next.at, next.endAt), "HH:mm")}
          </time>
          {!started && ` · ${formatDistanceToNow(new Date(next.at), { addSuffix: true })}`}
        </p>
      </div>
      <Link
        href={registrationRoute(next.registrationId)}
        className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-primary px-4 py-2 paragraph-sm font-medium text-primary-foreground outline-none hover:bg-primary/90 focus-visible:ring-4 focus-visible:ring-ring"
      >
        Open application
        <ArrowRightIcon className="size-4" aria-hidden />
      </Link>
    </section>
  )
}
