"use client"

import { format } from "date-fns"
import { ClockIcon, XIcon } from "lucide-react"
import { useState } from "react"

import { McDatePicker } from "@/components/ui/mc-calendar"
import {
  McSelect,
  McSelectContent,
  McSelectItem,
  McSelectLabel,
  McSelectTrigger,
  McSelectValue,
} from "@/components/ui/mc-select"
import {
  INTERVIEW_MINUTES,
  TIME_OPTIONS,
  shiftTime,
  timeMinutes,
} from "@/lib/registrations/interview"

export type Interviewer = { id: string; name: string }

/** The form's schedule parts, in club time; `""` when not scheduled. */
export type ScheduleParts = { date: string; start: string; end: string }

const UNASSIGNED = ""
/** Start given to a newly picked day. */
const DEFAULT_START = "10:00"
const FIELD_HEIGHT = "h-11 rounded-lg"

/** A `yyyy-MM-dd` key as a local date for the date picker, which works in the browser's time. */
function keyToDate(key: string) {
  const [year, month, day] = key.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function duration(start: string, end: string) {
  const minutes = timeMinutes(end) - timeMinutes(start)
  const hours = Math.floor(minutes / 60)
  return [hours && `${hours} h`, minutes % 60 && `${minutes % 60} min`].filter(Boolean).join(" ")
}

function TimeSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  // A time off the quarter hours (set before) stays choosable.
  const items = (value && !options.includes(value) ? [value, ...options] : options).map((time) => ({
    value: time,
    label: time,
  }))
  return (
    <div className="flex min-w-0 flex-col">
      <McSelect items={items} value={value} onValueChange={(next) => onChange(String(next ?? ""))}>
        <McSelectLabel>{label}</McSelectLabel>
        <McSelectTrigger className={`${FIELD_HEIGHT} w-full tabular-nums`} aria-label={label}>
          <McSelectValue placeholder="--:--" />
        </McSelectTrigger>
        <McSelectContent
          className="h-auto max-h-[min(16rem,var(--available-height))] w-(--anchor-width) min-w-28"
          alignItemWithTrigger={false}
          scrollbar
          data-lenis-prevent
        >
          {items.map((item) => (
            <McSelectItem key={item.value} value={item.value} className="tabular-nums">
              {item.label}
            </McSelectItem>
          ))}
        </McSelectContent>
      </McSelect>
    </div>
  )
}

/**
 * The interview's day, its start and end (30 minutes by default) and its host, all optional: the
 * host can be another HR member than the one asking for the interview. Read from the form as
 * `interviewDate`, `interviewStart`, `interviewEnd` and `interviewerId`.
 */
export function InterviewScheduleFields({
  interviewers,
  defaultSchedule = { date: "", start: "", end: "" },
  defaultInterviewerId = "",
  error,
}: {
  interviewers: Interviewer[]
  defaultSchedule?: ScheduleParts
  defaultInterviewerId?: string
  error?: string
}) {
  const [schedule, setSchedule] = useState(defaultSchedule)
  const [interviewerId, setInterviewerId] = useState(defaultInterviewerId)
  const { date, start, end } = schedule

  const interviewerItems = [
    { value: UNASSIGNED, label: "Not assigned yet" },
    ...interviewers.map((user) => ({ value: user.id, label: user.name })),
  ]

  function pickDate(next?: Date) {
    if (!next) return
    const nextStart = start || DEFAULT_START
    setSchedule({
      date: format(next, "yyyy-MM-dd"),
      start: nextStart,
      end: end || shiftTime(nextStart, INTERVIEW_MINUTES),
    })
  }

  // Moving the start keeps the length; an end must stay after the start.
  function pickStart(nextStart: string) {
    const length = start && end ? timeMinutes(end) - timeMinutes(start) : INTERVIEW_MINUTES
    setSchedule({ date, start: nextStart, end: shiftTime(nextStart, length) })
  }

  return (
    <div className="flex flex-col gap-4">
      <input type="hidden" name="interviewDate" value={date} />
      <input type="hidden" name="interviewStart" value={date ? start : ""} />
      <input type="hidden" name="interviewEnd" value={date ? end : ""} />
      <input type="hidden" name="interviewerId" value={interviewerId} />

      <div className="flex flex-col gap-1.5">
        <div className="grid grid-cols-2 items-end gap-3">
          <McDatePicker
            label="Interview day (optional)"
            placeholder="No date yet"
            dateFormat="EEEE d MMMM yyyy"
            weekStartsOn={0}
            selected={date ? keyToDate(date) : undefined}
            onSelect={pickDate}
            className="col-span-2 min-w-0"
            triggerClassName={`${FIELD_HEIGHT} w-full bg-background`}
          />
          {date && (
            <>
              <TimeSelect label="From" value={start} options={TIME_OPTIONS} onChange={pickStart} />
              <TimeSelect
                label="To"
                value={end}
                options={TIME_OPTIONS.filter((time) => timeMinutes(time) > timeMinutes(start))}
                onChange={(nextEnd) => setSchedule({ date, start, end: nextEnd })}
              />
            </>
          )}
        </div>
        {error ? (
          <p className="paragraph-sm text-destructive" role="alert">
            {error}
          </p>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2 paragraph-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon className="size-3.5" aria-hidden />
              {date && start && end
                ? `${duration(start, end)} · Algiers time`
                : `${INTERVIEW_MINUTES} min by default · Algiers time`}
            </span>
            {date && (
              <button
                type="button"
                onClick={() => setSchedule({ date: "", start: "", end: "" })}
                className="inline-flex items-center gap-1 rounded-sm font-medium outline-none hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring"
              >
                <XIcon className="size-3.5" aria-hidden />
                Remove date
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <McSelect
          items={interviewerItems}
          value={interviewerId}
          onValueChange={(value) => setInterviewerId(String(value ?? UNASSIGNED))}
        >
          <McSelectLabel>Interviewer (optional)</McSelectLabel>
          <McSelectTrigger className={`${FIELD_HEIGHT} w-full`} aria-label="Interviewer">
            <McSelectValue placeholder="Not assigned yet" />
          </McSelectTrigger>
          <McSelectContent
            className="h-auto max-h-(--available-height) w-(--anchor-width)"
            alignItemWithTrigger={false}
            scrollbar
            data-lenis-prevent
          >
            {interviewerItems.map((item) => (
              <McSelectItem key={item.value || "none"} value={item.value}>
                {item.label}
              </McSelectItem>
            ))}
          </McSelectContent>
        </McSelect>
      </div>
    </div>
  )
}

/** The schedule fields' values in a submitted form. */
export function readSchedule(form: FormData) {
  return {
    date: String(form.get("interviewDate") ?? ""),
    start: String(form.get("interviewStart") ?? ""),
    end: String(form.get("interviewEnd") ?? ""),
    interviewerId: String(form.get("interviewerId") ?? ""),
  }
}
