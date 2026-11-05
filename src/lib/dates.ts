import { tz } from "@date-fns/tz"
import { format } from "date-fns"

/** The club's timezone: moments (submissions, reviews) are shown in it, whatever the server's or browser's timezone. */
export const CLUB_TIME_ZONE = "Africa/Algiers"

const clubTime = tz(CLUB_TIME_ZONE)
const utc = tz("UTC")

/** Formats a moment stored in UTC (a submission, a review) in the club's local time. */
export function formatClubTime(date: Date | string, pattern: string) {
  return format(date, pattern, { in: clubTime })
}

/** Formats a calendar date stored as midnight UTC (a birth date), so it never shifts by a day. */
export function formatCalendarDate(date: Date | string, pattern: string) {
  return format(date, pattern, { in: utc })
}
