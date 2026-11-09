"use client"

import { addDays, addMonths, format, isSameMonth } from "date-fns"
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  GripVerticalIcon,
  UserIcon,
} from "lucide-react"
import {
  useEffect,
  useEffectEvent,
  useOptimistic,
  useState,
  useTransition,
  type DragEvent,
} from "react"

import { scheduleInterview } from "@/actions/admin/review-registration"
import {
  InterviewDialog,
  type InterviewDialogTarget,
} from "@/components/admin/calendar/interview-dialog"
import type { Interviewer } from "@/components/admin/registrations/interview-schedule-fields"
import { McButton } from "@/components/ui/mc-button"
import { useFeedbackModal } from "@/providers/feedback-modal-provider"
import { formatClubTime } from "@/lib/dates"
import type { CalendarInterview } from "@/lib/registrations/interview-store"
import {
  INTERVIEW_MINUTES,
  clubDate,
  dayKey,
  dayLanes,
  fromDateTimeInput,
  interviewEnd,
  minutesOfDay,
  monthWeeks,
  toDateTimeInput,
  weekDays,
} from "@/lib/registrations/interview"
import { cn } from "@/lib/utils"

type View = "week" | "month" | "agenda"

const VIEWS: { value: View; label: string; key: string }[] = [
  { value: "week", label: "Week", key: "w" },
  { value: "month", label: "Month", key: "m" },
  { value: "agenda", label: "Agenda", key: "a" },
]

/** Height of one hour in the week view, in px. */
const HOUR_HEIGHT = 56
/** Hours shown by default; widened to fit any interview outside them. */
const DEFAULT_HOURS = { start: 8, end: 20 }
/** Dropping or clicking in the week view snaps to this many minutes. */
const SNAP_MINUTES = 15
const DRAG_TYPE = "application/x-mc-registration"

/** Colors of an interview: yours, someone else's, or nobody's yet. */
function tone(item: CalendarInterview, userId: string) {
  if (item.interviewerId === userId) return "bg-primary text-primary-foreground border-primary"
  if (item.interviewerId)
    return "bg-info-foreground text-info border-info/40 dark:bg-info/15 dark:text-[color-mix(in_srgb,var(--color-info)_55%,white)]"
  return "bg-secondary text-secondary-foreground border-dashed border-muted-foreground/50"
}

/** Solid color of an interview's dot (phones' month view). */
function dotTone(item: CalendarInterview, userId: string) {
  if (item.interviewerId === userId) return "bg-primary"
  return item.interviewerId ? "bg-info" : "bg-muted-foreground"
}

function interviewerLabel(item: CalendarInterview, userId: string) {
  if (item.interviewerId === userId) return "You"
  return item.interviewerName ?? "Nobody assigned"
}

/**
 * The interviews calendar: week, month and agenda views in club time, a list of applicants still
 * waiting for a date, and drag and drop (from that list or between slots) to set or move one.
 */
export function InterviewCalendar({
  items,
  interviewers,
  userId,
  now,
}: {
  items: CalendarInterview[]
  interviewers: Interviewer[]
  userId: string
  /** The server's time, the same on both renders. */
  now: string
}) {
  const [view, setView] = useState<View>("week")
  const [anchor, setAnchor] = useState(() => clubDate(now))
  const [mineOnly, setMineOnly] = useState(false)
  const [dialog, setDialog] = useState<InterviewDialogTarget | null>(null)
  const [, startTransition] = useTransition()
  const { showError } = useFeedbackModal()

  // Moves shown at once, before the server confirms them.
  const [shownItems, moveItem] = useOptimistic(
    items,
    (current, move: { registrationId: string; at: string }) =>
      current.map((item) =>
        item.registrationId === move.registrationId ? { ...item, at: move.at } : item,
      ),
  )

  const visible = shownItems.filter((item) => !mineOnly || item.interviewerId === userId)
  const scheduled = visible.filter((item) => item.at)
  const unscheduled = shownItems.filter((item) => !item.at)

  function move(registrationId: string, at: Date) {
    const item = shownItems.find((entry) => entry.registrationId === registrationId)
    if (!item) return
    startTransition(async () => {
      moveItem({ registrationId, at: at.toISOString() })
      const result = await scheduleInterview(registrationId, {
        at: toDateTimeInput(at),
        interviewerId: item.interviewerId ?? "",
      })
      if (result.status === "error") showError({ title: "Not moved", description: result.message })
    })
  }

  function step(direction: 1 | -1) {
    setAnchor((current) =>
      view === "month" ? addMonths(current, direction) : addDays(current, 7 * direction),
    )
  }

  // Keyboard shortcuts, as in calendar apps: T today, W M A views, arrows or J K to move.
  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    const target = event.target as HTMLElement
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      target.closest("input, textarea, select, [contenteditable], [role=dialog], [role=listbox]")
    ) {
      return
    }
    const key = event.key.toLowerCase()
    if (key === "t") setAnchor(clubDate(now))
    else if (key === "arrowleft" || key === "k") step(-1)
    else if (key === "arrowright" || key === "j") step(1)
    else {
      const next = VIEWS.find((entry) => entry.key === key)
      if (!next) return
      setView(next.value)
    }
    event.preventDefault()
  })
  useEffect(() => {
    const listener = (event: KeyboardEvent) => onKeyDown(event)
    window.addEventListener("keydown", listener)
    return () => window.removeEventListener("keydown", listener)
  }, [])

  const days = weekDays(anchor)
  const title =
    view === "week"
      ? isSameMonth(days[0], days[6])
        ? format(days[0], "MMMM yyyy")
        : `${format(days[0], "MMM")} – ${format(days[6], "MMM yyyy")}`
      : view === "month"
        ? format(anchor, "MMMM yyyy")
        : "Upcoming interviews"

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-3 sm:p-4">
          <McButton variant="secondary" size="sm" onClick={() => setAnchor(clubDate(now))}>
            Today
          </McButton>
          {view !== "agenda" && (
            <div className="flex items-center">
              <IconButton label="Previous" onClick={() => step(-1)}>
                <ChevronLeftIcon className="size-5" />
              </IconButton>
              <IconButton label="Next" onClick={() => step(1)}>
                <ChevronRightIcon className="size-5" />
              </IconButton>
            </div>
          )}
          <h2 className="mr-auto header-xs font-heading text-foreground" aria-live="polite">
            {title}
          </h2>
          <label className="flex cursor-pointer items-center gap-2 paragraph-sm text-muted-foreground select-none">
            <input
              type="checkbox"
              checked={mineOnly}
              onChange={(event) => setMineOnly(event.target.checked)}
              className="size-4 accent-primary"
            />
            Only mine
          </label>
          <div
            role="tablist"
            aria-label="Calendar view"
            className="flex rounded-lg border border-border bg-secondary/50 p-0.5"
          >
            {VIEWS.map((entry) => (
              <button
                key={entry.value}
                type="button"
                role="tab"
                aria-selected={view === entry.value}
                title={`${entry.label} (${entry.key.toUpperCase()})`}
                onClick={() => setView(entry.value)}
                className={cn(
                  "rounded-md px-3 py-1 paragraph-sm font-medium transition-colors outline-none focus-visible:ring-4 focus-visible:ring-ring",
                  view === entry.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </div>

        {view === "week" && (
          <WeekView
            days={days}
            items={scheduled}
            userId={userId}
            now={now}
            onOpen={(item) => setDialog({ kind: "interview", item })}
            onSlot={(at) => setDialog({ kind: "slot", at })}
            onMove={move}
          />
        )}
        {view === "month" && (
          <MonthView
            anchor={anchor}
            items={scheduled}
            userId={userId}
            now={now}
            onOpen={(item) => setDialog({ kind: "interview", item })}
            onDay={(day) => {
              setAnchor(clubDate(day))
              setView("week")
            }}
          />
        )}
        {view === "agenda" && (
          <AgendaView
            items={scheduled}
            userId={userId}
            now={now}
            onOpen={(item) => setDialog({ kind: "interview", item })}
          />
        )}
      </div>

      <aside className="flex w-full shrink-0 flex-col gap-4 lg:sticky lg:top-4 lg:w-72">
        <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="paragraph-md font-medium text-foreground">Waiting for a date</h2>
            <span className="rounded-full bg-secondary px-2 paragraph-sm text-secondary-foreground tabular-nums">
              {unscheduled.length}
            </span>
          </div>
          {unscheduled.length > 0 ? (
            <>
              <p className="paragraph-sm text-muted-foreground">
                Drag one onto the week, or open it to pick a date.
              </p>
              <ul
                className="flex max-h-80 flex-col gap-1.5 overflow-y-auto lg:max-h-[calc(100dvh-16rem)]"
                data-lenis-prevent
              >
                {unscheduled.map((item) => (
                  <li key={item.registrationId}>
                    <button
                      type="button"
                      draggable
                      onDragStart={(event) =>
                        event.dataTransfer.setData(DRAG_TYPE, item.registrationId)
                      }
                      onClick={() => setDialog({ kind: "interview", item })}
                      className={cn(
                        "flex w-full cursor-grab items-center gap-2 rounded-lg border px-2 py-1.5 text-left paragraph-sm outline-none focus-visible:ring-4 focus-visible:ring-ring active:cursor-grabbing",
                        tone(item, userId),
                      )}
                    >
                      <GripVerticalIcon className="size-4 shrink-0 opacity-60" aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{item.name}</span>
                        <span className="block truncate opacity-80">
                          {interviewerLabel(item, userId)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="paragraph-sm text-muted-foreground">
              Every applicant in interview has a date.
            </p>
          )}
        </section>

        <section className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 paragraph-sm text-muted-foreground">
          <h2 className="paragraph-md font-medium text-foreground">Legend</h2>
          <Legend className={tone({ interviewerId: userId } as CalendarInterview, userId)}>
            You interview
          </Legend>
          <Legend className={tone({ interviewerId: "x" } as CalendarInterview, userId)}>
            Another HR member
          </Legend>
          <Legend className={tone({ interviewerId: null } as CalendarInterview, userId)}>
            Nobody assigned yet
          </Legend>
          <p className="pt-1">Times are Algiers time. Shortcuts: T today, W M A views, ← → move.</p>
        </section>
      </aside>

      <InterviewDialog
        target={dialog}
        onClose={() => setDialog(null)}
        interviewers={interviewers}
        unscheduled={unscheduled}
      />
    </div>
  )
}

function Legend({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      <span className={cn("size-3.5 rounded border", className)} aria-hidden />
      {children}
    </span>
  )
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex size-9 items-center justify-center rounded-full text-foreground transition-colors outline-none hover:bg-secondary focus-visible:ring-4 focus-visible:ring-ring"
    >
      {children}
    </button>
  )
}

/** One interview in the week grid, placed by its time and lane. */
function WeekEvent({
  item,
  userId,
  top,
  lane,
  lanes,
  onOpen,
}: {
  item: CalendarInterview
  userId: string
  top: number
  lane: number
  lanes: number
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      draggable
      onDragStart={(event) => event.dataTransfer.setData(DRAG_TYPE, item.registrationId)}
      onClick={(event) => {
        event.stopPropagation()
        onOpen()
      }}
      title={`${item.name} · ${formatClubTime(item.at!, "HH:mm")} · ${interviewerLabel(item, userId)}`}
      style={{
        top,
        height: Math.max((INTERVIEW_MINUTES / 60) * HOUR_HEIGHT - 2, 22),
        left: `calc(${(lane / lanes) * 100}% + 2px)`,
        width: `calc(${100 / lanes}% - 4px)`,
      }}
      className={cn(
        "absolute z-10 flex cursor-grab flex-col overflow-hidden rounded-md border-l-4 px-1.5 py-0.5 text-left text-xs leading-tight shadow-sm transition-shadow outline-none hover:shadow-md focus-visible:ring-4 focus-visible:ring-ring active:cursor-grabbing",
        tone(item, userId),
      )}
    >
      <span className="truncate font-semibold">{item.name}</span>
      <span className="truncate opacity-80">
        {formatClubTime(item.at!, "HH:mm")} · {interviewerLabel(item, userId)}
      </span>
    </button>
  )
}

function WeekView({
  days,
  items,
  userId,
  now,
  onOpen,
  onSlot,
  onMove,
}: {
  days: Date[]
  items: CalendarInterview[]
  userId: string
  now: string
  onOpen: (item: CalendarInterview) => void
  onSlot: (at: Date) => void
  onMove: (registrationId: string, at: Date) => void
}) {
  const [dropTarget, setDropTarget] = useState<{ day: string; minutes: number } | null>(null)
  const byDay = new Map<string, CalendarInterview[]>()
  for (const item of items) {
    const key = dayKey(item.at!)
    byDay.set(key, [...(byDay.get(key) ?? []), item])
  }

  // Widen the hours to fit this week's interviews.
  const weekKeys = new Set(days.map((day) => dayKey(day)))
  let start = DEFAULT_HOURS.start
  let end = DEFAULT_HOURS.end
  for (const item of items) {
    if (!weekKeys.has(dayKey(item.at!))) continue
    const minutes = minutesOfDay(item.at!)
    start = Math.min(start, Math.floor(minutes / 60))
    end = Math.max(end, Math.ceil((minutes + INTERVIEW_MINUTES) / 60))
  }
  const hours = Array.from({ length: end - start }, (_, index) => start + index)
  const todayKey = dayKey(now)
  const nowMinutes = minutesOfDay(now)

  /** The snapped time under the pointer in a day column. */
  function slotAt(day: Date, event: { clientY: number; currentTarget: HTMLElement }) {
    const rect = event.currentTarget.getBoundingClientRect()
    const raw = ((event.clientY - rect.top) / HOUR_HEIGHT) * 60 + start * 60
    const minutes = Math.max(
      start * 60,
      Math.min(end * 60 - SNAP_MINUTES, Math.round(raw / SNAP_MINUTES) * SNAP_MINUTES),
    )
    const time = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`
    return { minutes, at: fromDateTimeInput(`${dayKey(day)}T${time}`)! }
  }

  function onDrop(day: Date, event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDropTarget(null)
    const registrationId = event.dataTransfer.getData(DRAG_TYPE)
    if (registrationId) onMove(registrationId, slotAt(day, event).at)
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[44rem]">
        <div className="sticky top-0 z-20 grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] border-b border-border bg-card">
          <div className="sticky left-0 z-10 bg-card" />
          {days.map((day) => {
            const key = dayKey(day)
            const today = key === todayKey
            return (
              <div key={key} className="flex flex-col items-center gap-0.5 py-2">
                <span
                  className={cn(
                    "text-xs font-medium tracking-wide uppercase",
                    today ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {format(day, "EEE")}
                </span>
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full paragraph-md tabular-nums",
                    today ? "bg-primary font-semibold text-primary-foreground" : "text-foreground",
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))]">
          <div
            className="sticky left-0 z-30 bg-card"
            style={{ height: hours.length * HOUR_HEIGHT }}
          >
            {hours.map((hour, index) => (
              <span
                key={hour}
                className="absolute right-2 -translate-y-1/2 text-xs text-muted-foreground tabular-nums"
                style={{ top: index * HOUR_HEIGHT }}
              >
                {index === 0 ? "" : `${String(hour).padStart(2, "0")}:00`}
              </span>
            ))}
          </div>
          {days.map((day) => {
            const key = dayKey(day)
            const dayItems = byDay.get(key) ?? []
            const lanes = dayLanes(dayItems.map((item) => minutesOfDay(item.at!)))
            return (
              <div
                key={key}
                role="presentation"
                className={cn(
                  "relative cursor-pointer border-l border-border",
                  key === todayKey && "bg-primary/[0.03]",
                )}
                style={{
                  height: hours.length * HOUR_HEIGHT,
                  backgroundImage: `repeating-linear-gradient(to bottom, var(--color-border) 0 1px, transparent 1px ${HOUR_HEIGHT}px)`,
                }}
                onClick={(event) => onSlot(slotAt(day, event).at)}
                onDragOver={(event) => {
                  if (!event.dataTransfer.types.includes(DRAG_TYPE)) return
                  event.preventDefault()
                  event.dataTransfer.dropEffect = "move"
                  const { minutes } = slotAt(day, event)
                  if (dropTarget?.day !== key || dropTarget.minutes !== minutes) {
                    setDropTarget({ day: key, minutes })
                  }
                }}
                onDragLeave={() => setDropTarget(null)}
                onDrop={(event) => onDrop(day, event)}
              >
                {dropTarget?.day === key && (
                  <div
                    className="pointer-events-none absolute inset-x-1 z-0 rounded-md border-2 border-dashed border-primary bg-primary/10 px-1.5 text-xs font-medium text-primary"
                    style={{
                      top: ((dropTarget.minutes - start * 60) / 60) * HOUR_HEIGHT,
                      height: (INTERVIEW_MINUTES / 60) * HOUR_HEIGHT,
                    }}
                  >
                    {String(Math.floor(dropTarget.minutes / 60)).padStart(2, "0")}:
                    {String(dropTarget.minutes % 60).padStart(2, "0")}
                  </div>
                )}
                {dayItems.map((item, index) => (
                  <WeekEvent
                    key={item.registrationId}
                    item={item}
                    userId={userId}
                    top={((minutesOfDay(item.at!) - start * 60) / 60) * HOUR_HEIGHT + 1}
                    lane={lanes[index].lane}
                    lanes={lanes[index].lanes}
                    onOpen={() => onOpen(item)}
                  />
                ))}
                {key === todayKey && nowMinutes >= start * 60 && nowMinutes <= end * 60 && (
                  <div
                    className="pointer-events-none absolute inset-x-0 z-20 h-0.5 bg-destructive"
                    style={{ top: ((nowMinutes - start * 60) / 60) * HOUR_HEIGHT }}
                    aria-hidden
                  >
                    <span className="absolute -top-1 -left-1 size-2.5 rounded-full bg-destructive" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** Interviews shown in a month cell before "+N more". */
const MONTH_CELL_ITEMS = 3

function MonthView({
  anchor,
  items,
  userId,
  now,
  onOpen,
  onDay,
}: {
  anchor: Date
  items: CalendarInterview[]
  userId: string
  now: string
  onOpen: (item: CalendarInterview) => void
  onDay: (day: Date) => void
}) {
  const weeks = monthWeeks(anchor)
  const todayKey = dayKey(now)
  const byDay = new Map<string, CalendarInterview[]>()
  for (const item of items) {
    const key = dayKey(item.at!)
    byDay.set(key, [...(byDay.get(key) ?? []), item])
  }

  return (
    <div>
      <div className="grid grid-cols-7 border-b border-border">
        {weeks[0].map((day) => (
          <div
            key={dayKey(day)}
            className="py-2 text-center text-xs font-medium tracking-wide text-muted-foreground uppercase"
          >
            <span className="sm:hidden">{format(day, "EEEEE")}</span>
            <span className="hidden sm:inline">{format(day, "EEE")}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {weeks.flat().map((day) => {
          const key = dayKey(day)
          const dayItems = byDay.get(key) ?? []
          const outside = !isSameMonth(day, anchor)
          return (
            <div
              key={key}
              className={cn(
                "flex min-h-20 flex-col gap-1 border-r border-b border-border p-1 sm:min-h-28 sm:p-1.5 [&:nth-child(7n)]:border-r-0",
                outside && "bg-secondary/30",
              )}
            >
              <button
                type="button"
                onClick={() => onDay(day)}
                aria-label={`Open the week of ${format(day, "d MMMM")}`}
                className={cn(
                  "flex size-7 items-center justify-center self-center rounded-full text-xs tabular-nums transition-colors outline-none hover:bg-secondary focus-visible:ring-4 focus-visible:ring-ring sm:self-start",
                  key === todayKey
                    ? "bg-primary font-semibold text-primary-foreground hover:bg-primary"
                    : outside
                      ? "text-muted-foreground"
                      : "text-foreground",
                )}
              >
                {format(day, "d")}
              </button>
              {/* Phones: one dot per interview. */}
              {dayItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => onDay(day)}
                  className="flex flex-wrap justify-center gap-0.5 sm:hidden"
                  aria-label={`${dayItems.length} interviews`}
                >
                  {dayItems.slice(0, 6).map((item) => (
                    <span
                      key={item.registrationId}
                      className={cn("size-1.5 rounded-full", dotTone(item, userId))}
                    />
                  ))}
                </button>
              )}
              <div className="hidden flex-col gap-0.5 sm:flex">
                {dayItems.slice(0, MONTH_CELL_ITEMS).map((item) => (
                  <button
                    key={item.registrationId}
                    type="button"
                    onClick={() => onOpen(item)}
                    className={cn(
                      "truncate rounded border px-1.5 py-0.5 text-left text-xs outline-none focus-visible:ring-4 focus-visible:ring-ring",
                      tone(item, userId),
                    )}
                  >
                    <span className="font-semibold tabular-nums">
                      {formatClubTime(item.at!, "HH:mm")}
                    </span>{" "}
                    {item.name}
                  </button>
                ))}
                {dayItems.length > MONTH_CELL_ITEMS && (
                  <button
                    type="button"
                    onClick={() => onDay(day)}
                    className="rounded px-1.5 text-left text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    +{dayItems.length - MONTH_CELL_ITEMS} more
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AgendaView({
  items,
  userId,
  now,
  onOpen,
}: {
  items: CalendarInterview[]
  userId: string
  now: string
  onOpen: (item: CalendarInterview) => void
}) {
  const [showPast, setShowPast] = useState(false)
  const startOfToday = fromDateTimeInput(`${dayKey(now)}T00:00`)!
  const past = items.filter((item) => new Date(item.at!) < startOfToday)
  const shown = showPast ? items : items.filter((item) => new Date(item.at!) >= startOfToday)
  const groups = new Map<string, CalendarInterview[]>()
  for (const item of shown) {
    const key = dayKey(item.at!)
    groups.set(key, [...(groups.get(key) ?? []), item])
  }
  const todayKey = dayKey(now)

  return (
    <div className="flex flex-col">
      {past.length > 0 && (
        <button
          type="button"
          onClick={() => setShowPast((value) => !value)}
          className="border-b border-border px-4 py-2 text-left paragraph-sm font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring"
        >
          {showPast ? "Hide" : "Show"} {past.length} past interview{past.length > 1 ? "s" : ""}
        </button>
      )}
      {groups.size === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
          <CalendarDaysIcon className="size-8 text-muted-foreground" aria-hidden />
          <p className="paragraph-md font-medium text-foreground">No interview coming up</p>
          <p className="paragraph-sm text-muted-foreground">
            Give a date to an applicant waiting for one.
          </p>
        </div>
      ) : (
        [...groups].map(([key, dayItems]) => {
          const day = clubDate(dayItems[0].at!)
          return (
            <section
              key={key}
              className="flex flex-col gap-2 border-b border-border p-4 last:border-b-0 sm:flex-row sm:gap-6"
            >
              <div className="flex items-baseline gap-2 sm:w-32 sm:shrink-0 sm:flex-col sm:gap-0">
                <span
                  className={cn(
                    "header-xs font-heading tabular-nums",
                    key === todayKey ? "text-primary" : "text-foreground",
                  )}
                >
                  {format(day, "d MMM")}
                </span>
                <span className="paragraph-sm text-muted-foreground">
                  {key === todayKey ? "Today" : format(day, "EEEE")}
                </span>
              </div>
              <ul className="flex min-w-0 flex-1 flex-col gap-2">
                {dayItems.map((item) => (
                  <li key={item.registrationId}>
                    <button
                      type="button"
                      onClick={() => onOpen(item)}
                      className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors outline-none hover:bg-secondary/50 focus-visible:ring-4 focus-visible:ring-ring"
                    >
                      <span
                        className={cn("h-10 w-1.5 shrink-0 rounded-full", dotTone(item, userId))}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate paragraph-md font-medium text-foreground">
                          {item.name}
                        </span>
                        <span className="flex flex-wrap gap-x-3 paragraph-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1 tabular-nums">
                            <ClockIcon className="size-3.5" aria-hidden />
                            {formatClubTime(item.at!, "HH:mm")} –{" "}
                            {formatClubTime(interviewEnd(item.at!), "HH:mm")}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <UserIcon className="size-3.5" aria-hidden />
                            {interviewerLabel(item, userId)}
                          </span>
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )
        })
      )}
    </div>
  )
}
