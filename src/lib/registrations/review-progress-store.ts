import "server-only"

import { REVIEW_DEADLINES } from "@/config/registrations"
import { connectToDatabase } from "@/lib/mongodb"
import { listCalendarInterviews } from "@/lib/registrations/interview-store"
import { RegistrationModel } from "@/lib/registrations/model"
import { reviewProgress } from "@/lib/registrations/review-progress"
import { isRegistrationStatus } from "@/lib/registrations/status"
import type { TimelineEntry } from "@/lib/registrations/timeline"

/** The team's review progress and the member's own share (see `review-progress.ts`). */
export async function getReviewProgress(userId: string) {
  await connectToDatabase()
  const [registrations, interviews] = await Promise.all([
    RegistrationModel.find().select("timeline status").lean(),
    listCalendarInterviews(),
  ])

  const deadlines = {
    reviews: REVIEW_DEADLINES.reviews ? new Date(REVIEW_DEADLINES.reviews) : null,
    decisions: REVIEW_DEADLINES.decisions ? new Date(REVIEW_DEADLINES.decisions) : null,
  }
  const progress = reviewProgress({
    registrations: registrations.map((registration) => ({
      timeline: (registration.timeline ?? []) as TimelineEntry[],
      status: isRegistrationStatus(registration.status) ? registration.status : "pending",
    })),
    userId,
    now: new Date(),
    deadlines,
  })
  return {
    ...progress,
    deadlines: REVIEW_DEADLINES,
    interviews: {
      scheduled: interviews.filter((interview) => interview.at).length,
      waiting: interviews.filter(
        (interview) =>
          !interview.at && interview.status !== "accepted" && interview.status !== "rejected",
      ).length,
      /** Still open interviews set after the decisions deadline. */
      late: deadlines.decisions
        ? interviews.filter(
            (interview) =>
              interview.at &&
              new Date(interview.at) > deadlines.decisions! &&
              interview.status !== "accepted" &&
              interview.status !== "rejected",
          ).length
        : 0,
    },
  }
}
