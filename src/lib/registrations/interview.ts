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

/** A moment as a `datetime-local` value in club time, `""` for none. */
export function toDateTimeInput(date: Date | string | null | undefined) {
  return date ? format(clubDate(date), INPUT_FORMAT) : ""
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

/** Where an interview ends. */
export function interviewEnd(date: Date | string | number) {
  return addMinutes(new Date(date), INTERVIEW_MINUTES)
}

/**
 * Side-by-side lanes of one day's interviews: overlapping ones share the width of their group.
 * Returns each item's lane and the lane count of its group, in the input order.
 */
export function dayLanes(starts: number[], length = INTERVIEW_MINUTES) {
  const order = starts.map((start, index) => ({ start, index })).sort((a, b) => a.start - b.start)
  const result = starts.map(() => ({ lane: 0, lanes: 1 }))
  let group: number[] = []
  let groupEnd = -Infinity
  let laneEnds: number[] = []

  const closeGroup = () => {
    for (const index of group) result[index].lanes = laneEnds.length
    group = []
    laneEnds = []
  }

  for (const { start, index } of order) {
    if (start >= groupEnd) closeGroup()
    let lane = laneEnds.findIndex((end) => end <= start)
    if (lane === -1) lane = laneEnds.push(0) - 1
    laneEnds[lane] = start + length
    result[index].lane = lane
    group.push(index)
    groupEnd = Math.max(groupEnd, start + length)
  }
  closeGroup()
  return result
}

/**
 * An interview's schedule as typed: a `datetime-local` value in club time and an HR member's id,
 * both optional (`""` clears it).
 */
export const interviewScheduleSchema = z.object({
  at: z
    .string()
    .trim()
    .refine((value) => !value || fromDateTimeInput(value) !== null, "Pick a valid date and time."),
  interviewerId: z.string().trim().max(100),
})

export type InterviewScheduleInput = z.infer<typeof interviewScheduleSchema>

/** A registration's interview as the admin pages read it. */
export type InterviewSchedule = {
  at: string | null
  interviewerId: string | null
  interviewerName: string | null
  updatedByName: string | null
  updatedAt: string | null
}
