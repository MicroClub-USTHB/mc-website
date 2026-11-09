import { TZDate } from "@date-fns/tz"
import { addDays, addMinutes, format, isValid, parse, startOfWeek } from "date-fns"
import { z } from "zod"

import { CLUB_TIME_ZONE } from "@/lib/dates"

/** Length of an interview on the calendar, in minutes. */
export const INTERVIEW_MINUTES = 30

/** Value format of an `<input type="datetime-local">`, read in the club's timezone. */
const INPUT_FORMAT = "yyyy-MM-dd'T'HH:mm"

/** A moment in the club's timezone, so date math (days, weeks) follows the club's calendar. */
export function clubDate(date: Date | string | number) {
  return new TZDate(new Date(date), CLUB_TIME_ZONE)
}

/** A `datetime-local` value read as club time, `null` when empty or invalid. */
export function fromDateTimeInput(value: string) {
  if (!value) return null
  const date = parse(value, INPUT_FORMAT, new TZDate(0, CLUB_TIME_ZONE))
  return isValid(date) ? new Date(date.getTime()) : null
}

/** Key of a moment's club calendar day, e.g. `2026-11-09`. */
export function dayKey(date: Date | string | number) {
  return format(clubDate(date), "yyyy-MM-dd")
}

/** The seven days of the week holding `date`, starting on Sunday (the club's week). */
export function weekDays(date: Date | string | number) {
  const start = startOfWeek(clubDate(date), { weekStartsOn: 0 })
  return Array.from({ length: 7 }, (_, index) => addDays(start, index))
}

/** The weeks shown for the month holding `date`: whole weeks, from Sunday, 6 rows at most. */
export function monthWeeks(date: Date | string | number) {
  const day = clubDate(date)
  const first = new TZDate(day.getFullYear(), day.getMonth(), 1, CLUB_TIME_ZONE)
  const weeks: TZDate[][] = []
  let start = startOfWeek(first, { weekStartsOn: 0 })
  while (weeks.length < 6 && (weeks.length === 0 || start.getMonth() === first.getMonth())) {
    weeks.push(Array.from({ length: 7 }, (_, index) => addDays(start, index)))
    start = addDays(start, 7)
  }
  return weeks
}

/** Minutes since the club's midnight, for placing an interview in a day column. */
export function minutesOfDay(date: Date | string | number) {
  const day = clubDate(date)
  return day.getHours() * 60 + day.getMinutes()
}

/** Where an interview ends: its end time, or its default length after its start. */
export function interviewEnd(at: Date | string | number, endAt?: Date | string | null) {
  return endAt ? new Date(endAt) : addMinutes(new Date(at), INTERVIEW_MINUTES)
}

/** Choices of the time pickers: every quarter hour from 07:00 to 23:00. */
export const TIME_OPTIONS = Array.from({ length: (23 - 7) * 4 + 1 }, (_, index) => {
  const minutes = 7 * 60 + index * 15
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`
})

/** Minutes of an `HH:mm` time. */
export function timeMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

/** An `HH:mm` time moved by some minutes, kept within the day. */
export function shiftTime(time: string, minutes: number) {
  const total = Math.min(Math.max(timeMinutes(time) + minutes, 0), 23 * 60 + 59)
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
}

/** An interview's moments as the form's parts, in club time (`""` when not scheduled). */
export function scheduleParts(at: Date | string | null | undefined, endAt?: Date | string | null) {
  if (!at) return { date: "", start: "", end: "" }
  return {
    date: dayKey(at),
    start: format(clubDate(at), "HH:mm"),
    end: format(clubDate(interviewEnd(at, endAt)), "HH:mm"),
  }
}

/** The form's parts as moments, `null` without a date. */
export function scheduleMoments({
  date,
  start,
  end,
}: {
  date: string
  start: string
  end: string
}) {
  if (!date) return null
  const at = fromDateTimeInput(`${date}T${start}`)
  const endAt = fromDateTimeInput(`${date}T${end}`)
  return at && endAt ? { at, endAt } : null
}

/**
 * Side-by-side lanes of one day's interviews (minutes since midnight): overlapping ones share the width of their group.
 * Returns each item's lane and the lane count of its group, in the input order.
 */
export function dayLanes(intervals: { start: number; end: number }[]) {
  const order = intervals
    .map((interval, index) => ({ ...interval, index }))
    .sort((a, b) => a.start - b.start)
  const result = intervals.map(() => ({ lane: 0, lanes: 1 }))
  let group: number[] = []
  let groupEnd = -Infinity
  let laneEnds: number[] = []

  const closeGroup = () => {
    for (const index of group) result[index].lanes = laneEnds.length
    group = []
    laneEnds = []
  }

  for (const { start, end, index } of order) {
    if (start >= groupEnd) closeGroup()
    let lane = laneEnds.findIndex((end) => end <= start)
    if (lane === -1) lane = laneEnds.push(0) - 1
    laneEnds[lane] = end
    result[index].lane = lane
    group.push(index)
    groupEnd = Math.max(groupEnd, end)
  }
  closeGroup()
  return result
}

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/

/**
 * An interview's schedule as picked: a club day (`yyyy-MM-dd`), its start and end times, and an
 * HR member's id. All optional (`""` clears them), but a day needs both times, end after start.
 */
export const interviewScheduleSchema = z
  .object({
    date: z
      .string()
      .trim()
      .regex(/^(\d{4}-\d{2}-\d{2})?$/, "Pick a valid date."),
    start: z.string().trim().regex(TIME).or(z.literal("")),
    end: z.string().trim().regex(TIME).or(z.literal("")),
    interviewerId: z.string().trim().max(100),
  })
  .superRefine((value, context) => {
    if (!value.date) return
    if (!value.start || !value.end) {
      context.addIssue({
        code: "custom",
        path: ["start"],
        message: "Pick when it starts and ends.",
      })
    } else if (timeMinutes(value.end) <= timeMinutes(value.start)) {
      context.addIssue({ code: "custom", path: ["end"], message: "End after it starts." })
    }
  })

export type InterviewScheduleInput = z.infer<typeof interviewScheduleSchema>

/** A registration's interview as the admin pages read it. */
export type InterviewSchedule = {
  at: string | null
  endAt: string | null
  interviewerId: string | null
  interviewerName: string | null
  updatedByName: string | null
  updatedAt: string | null
}
