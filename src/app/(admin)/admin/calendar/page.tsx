import type { Metadata } from "next"

import { NextInterview } from "@/components/admin/calendar/next-interview"
import { InterviewCalendar } from "@/components/admin/calendar/interview-calendar"
import { requireStaff } from "@/lib/auth/session"
import { listCalendarInterviews, listInterviewers } from "@/lib/registrations/interview-store"

export const metadata: Metadata = { title: "Calendar" }

/**
 * The interviews: when each one happens and who hosts it, editable by every HR member, with the
 * applicants in interview still waiting for a date.
 */
export default async function CalendarPage() {
  const { user } = await requireStaff({ permissions: { registration: ["review"] } })
  const [items, interviewers] = await Promise.all([listCalendarInterviews(), listInterviewers()])
  const now = new Date()

  return (
    <div className="mx-auto flex w-full max-w-site flex-col gap-6 px-4 py-12 sm:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="header-md font-heading text-foreground">Calendar</h1>
        <p className="paragraph-md text-muted-foreground">
          Every interview and who hosts it. Click an interview to change it, a free slot to give it
          to an applicant, or drag to move one.
        </p>
      </div>
      <NextInterview items={items} userId={user.id} now={now} />
      <InterviewCalendar
        items={items}
        interviewers={interviewers}
        userId={user.id}
        now={now.toISOString()}
      />
    </div>
  )
}
