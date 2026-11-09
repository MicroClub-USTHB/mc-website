import "server-only"

import { isValidObjectId } from "mongoose"

import { connectToDatabase, getMongoClient } from "@/lib/mongodb"
import {
  scheduleMoments,
  type InterviewSchedule,
  type InterviewScheduleInput,
} from "@/lib/registrations/interview"
import { RegistrationModel } from "@/lib/registrations/model"
import { isRegistrationStatus, type RegistrationStatus } from "@/lib/registrations/status"
import { currentReviews, type TimelineEntry } from "@/lib/registrations/timeline"
import type { TimelineActor, TimelineResult } from "@/lib/registrations/timeline-store"

/** HR members who can host an interview: active `hr` accounts (Better Auth's `user` collection). */
export async function listInterviewers() {
  await connectToDatabase()
  const users = await getMongoClient()
    .db()
    .collection<{ name: string; role?: string; banned?: boolean }>("user")
    .find({ role: "hr", banned: { $ne: true } })
    .project<{ _id: unknown; name: string }>({ name: 1 })
    .sort({ name: 1 })
    .toArray()
  return users.map((user) => ({ id: String(user._id), name: user.name }))
}

/**
 * Sets a registration's interview date and host (either may be empty to clear it). The host must
 * be an active HR member; their name is stored with it, like the timeline's names.
 */
export async function saveInterview(
  id: string,
  actor: TimelineActor,
  { interviewerId, ...times }: InterviewScheduleInput,
): Promise<TimelineResult> {
  if (!isValidObjectId(id))
    return { status: "error", message: "This registration no longer exists." }
  let interviewerName: string | undefined
  if (interviewerId) {
    const interviewer = (await listInterviewers()).find((user) => user.id === interviewerId)
    if (!interviewer) return { status: "error", message: "Choose an active HR member." }
    interviewerName = interviewer.name
  }

  await connectToDatabase()
  const moments = scheduleMoments(times)
  const { matchedCount } = await RegistrationModel.updateOne(
    { _id: id },
    {
      $set: {
        interview: {
          ...moments,
          ...(interviewerName && { interviewerId, interviewerName }),
          updatedById: actor.id,
          updatedByName: actor.name,
          updatedAt: new Date(),
        },
      },
    },
  )
  return matchedCount > 0
    ? { status: "success" }
    : { status: "error", message: "This registration no longer exists." }
}

/** A registration's interview, for the review dialog. */
export function interviewSchedule(interview: unknown): InterviewSchedule {
  const value = (interview ?? {}) as {
    at?: Date
    endAt?: Date
    interviewerId?: string
    interviewerName?: string
    updatedByName?: string
    updatedAt?: Date
  }
  return {
    at: value.at ? new Date(value.at).toISOString() : null,
    endAt: value.endAt ? new Date(value.endAt).toISOString() : null,
    interviewerId: value.interviewerId ?? null,
    interviewerName: value.interviewerName ?? null,
    updatedByName: value.updatedByName ?? null,
    updatedAt: value.updatedAt ? new Date(value.updatedAt).toISOString() : null,
  }
}

export type CalendarInterview = InterviewSchedule & {
  registrationId: string
  name: string
  status: RegistrationStatus
}

/**
 * The calendar's registrations: every one with an interview date, and those in interview (by
 * status or by a reviewer asking for one) still waiting for a date.
 */
export async function listCalendarInterviews(): Promise<CalendarInterview[]> {
  await connectToDatabase()
  const registrations = await RegistrationModel.find({
    $or: [
      { "interview.at": { $exists: true } },
      { status: "interview" },
      { timeline: { $elemMatch: { kind: "review", state: "interview" } } },
    ],
  })
    .select("firstName lastName status interview timeline")
    .sort({ "interview.at": 1, createdAt: 1 })
    .lean()

  return registrations
    .filter(
      (registration) =>
        registration.interview?.at ||
        registration.status === "interview" ||
        currentReviews((registration.timeline ?? []) as TimelineEntry[]).some(
          (review) => review.state === "interview",
        ),
    )
    .map((registration) => ({
      registrationId: String(registration._id),
      name: `${registration.firstName} ${registration.lastName}`,
      status: isRegistrationStatus(registration.status) ? registration.status : "pending",
      ...interviewSchedule(registration.interview),
    }))
}
