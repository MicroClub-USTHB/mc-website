import Link from "next/link"
import { formatDistanceToNowStrict } from "date-fns"
import {
  ArrowRightIcon,
  CalendarClockIcon,
  TrendingUpIcon,
  TriangleAlertIcon,
  UserCheckIcon,
} from "lucide-react"

import { adminRoutes } from "@/config/admin"
import { formatClubTime } from "@/lib/dates"
import type { getReviewProgress } from "@/lib/registrations/review-progress-store"
import { cn } from "@/lib/utils"

type Progress = Awaited<ReturnType<typeof getReviewProgress>>

function ProgressBar({ percent, label }: { percent: number; label: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-2.5 w-full overflow-hidden rounded-full bg-secondary"
    >
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out-expo"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="paragraph-sm text-muted-foreground">{label}</dt>
      <dd className="header-xs font-heading text-foreground tabular-nums">{value}</dd>
      {hint && <dd className="paragraph-sm text-muted-foreground">{hint}</dd>}
    </div>
  )
}

function perDay(value: number) {
  return value >= 10 ? Math.round(value) : Math.round(value * 10) / 10
}

type Tone = "done" | "on-track" | "push" | "behind" | "idle"

const TONES: Record<Tone, { label: string; className: string }> = {
  done: { label: "Done", className: "border-success/40 text-success" },
  "on-track": { label: "On track", className: "border-success/40 text-success" },
  push: { label: "A little behind", className: "border-warning/40 text-warning" },
  behind: { label: "Well behind", className: "border-destructive/40 text-destructive" },
  idle: { label: "No deadline", className: "border-border text-muted-foreground" },
}

/** How a step stands against its deadline. */
function toneOf(remaining: number, pace: number, needed: number | null): Tone {
  if (remaining === 0) return "done"
  if (needed === null) return "idle"
  if (pace >= needed) return "on-track"
  return pace * 2 >= needed ? "push" : "behind"
}

const PILL =
  "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 paragraph-sm font-medium"

/**
 * One step toward the finish line, the same layout for each so they line up side by side: title,
 * deadline and standing; progress; the pace now, the pace the deadline needs and when it ends at
 * the current pace; then a footer of what to do next.
 */
function StepCard({
  icon,
  title,
  description,
  unit,
  done,
  total,
  pace,
  needed,
  finishAt,
  deadline,
  now,
  footer,
}: {
  icon: React.ReactNode
  title: string
  description: string
  /** Plural noun of the work, e.g. "reviews". */
  unit: string
  done: number
  total: number
  pace: number
  needed: number | null
  finishAt: Date | null
  deadline: string | null
  now: Date
  footer: React.ReactNode
}) {
  const remaining = total - done
  const percent = total > 0 ? Math.floor((done / total) * 100) : 100
  const tone = TONES[toneOf(remaining, pace, needed)]
  const deadlineDate = deadline ? new Date(deadline) : null
  const passed = deadlineDate !== null && deadlineDate < now

  return (
    <section className="flex h-full flex-col gap-6 rounded-xl border border-border bg-card p-5 sm:p-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
              {icon}
            </span>
            <div className="flex min-w-0 flex-col">
              <h2 className="header-xs font-heading text-foreground">{title}</h2>
              <p className="paragraph-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          <p className="header-sm font-heading text-foreground tabular-nums">{percent}%</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {deadlineDate && (
            <span
              className={cn(
                PILL,
                passed
                  ? "border-destructive/40 text-destructive"
                  : "border-border text-muted-foreground",
              )}
            >
              <CalendarClockIcon className="size-3.5" aria-hidden />
              Due {formatClubTime(deadlineDate, "EEE d MMM")} ·{" "}
              {passed ? "passed" : formatDistanceToNowStrict(deadlineDate, { addSuffix: true })}
            </span>
          )}
          <span className={cn(PILL, tone.className)}>{tone.label}</span>
        </div>
      </header>

      <div className="flex flex-col gap-2">
        <ProgressBar percent={percent} label={`${title}: ${percent}%`} />
        <p className="flex justify-between gap-2 paragraph-sm text-muted-foreground tabular-nums">
          <span>
            {done} of {total} {unit}
          </span>
          <span>{remaining} to go</span>
        </p>
      </div>

      <dl className="grid grid-cols-3 gap-3 border-y border-border py-4">
        <Stat label="Pace now" value={perDay(pace)} hint="a day, last 3 days" />
        <Stat
          label="Needed"
          value={needed === null ? "–" : remaining === 0 ? 0 : needed}
          hint={needed === null ? "no deadline" : "a day, to meet it"}
        />
        <Stat
          label="At this pace"
          value={remaining === 0 ? "Done" : finishAt ? formatDistanceToNowStrict(finishAt) : "–"}
          hint={
            remaining === 0
              ? "nothing left"
              : finishAt
                ? `around ${formatClubTime(finishAt, "d MMM")}`
                : "no pace yet"
          }
        />
      </dl>

      <div className="mt-auto flex min-h-6 flex-wrap items-center gap-x-4 gap-y-2 paragraph-sm text-muted-foreground">
        {footer}
      </div>
    </section>
  )
}

const FOOTER_LINK =
  "inline-flex items-center gap-1 rounded-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-4 focus-visible:ring-ring"

/** Step 1: two reviews on every registration. */
export function TeamProgressCard({ progress, now }: { progress: Progress; now: Date }) {
  const { team, deadlines } = progress
  return (
    <StepCard
      icon={<TrendingUpIcon className="size-5" aria-hidden />}
      title="1. Reviews"
      description="Two reviews on every registration."
      unit="reviews"
      done={team.done}
      total={team.total}
      pace={team.pace}
      needed={team.neededPace}
      finishAt={team.finishAt}
      deadline={deadlines.reviews}
      now={now}
      footer={
        team.needYou > 0 ? (
          <Link href={`${adminRoutes.registrations}?status=second-review`} className={FOOTER_LINK}>
            {team.needYou} need only one more review
            <ArrowRightIcon className="size-3.5" aria-hidden />
          </Link>
        ) : (
          <span>Every registration has a second reviewer.</span>
        )
      }
    />
  )
}

/** Step 2: interviews done and every registration accepted or rejected. */
export function DecisionsProgressCard({ progress, now }: { progress: Progress; now: Date }) {
  const { decisions, interviews, deadlines } = progress
  return (
    <StepCard
      icon={<UserCheckIcon className="size-5" aria-hidden />}
      title="2. Final answers"
      description="Interviews done, everyone accepted or rejected."
      unit="answered"
      done={decisions.done}
      total={decisions.total}
      pace={decisions.pace}
      needed={decisions.neededPace}
      finishAt={decisions.finishAt}
      deadline={deadlines.decisions}
      now={now}
      footer={
        <>
          <span className="tabular-nums">
            {interviews.scheduled} scheduled · {interviews.waiting} waiting for a date
          </span>
          {interviews.late > 0 && (
            <span className="inline-flex items-center gap-1 text-warning">
              <TriangleAlertIcon className="size-3.5" aria-hidden />
              {interviews.late} after the deadline
            </span>
          )}
          <Link href={adminRoutes.calendar} className={FOOTER_LINK}>
            Calendar
            <ArrowRightIcon className="size-3.5" aria-hidden />
          </Link>
        </>
      }
    />
  )
}
