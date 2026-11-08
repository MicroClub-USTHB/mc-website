import "server-only"

import mongoose, { Schema, isValidObjectId, type InferSchemaType } from "mongoose"

import { connectToDatabase } from "@/lib/mongodb"
import { RegistrationModel } from "@/lib/registrations/model"
import { placeListQuery, type PlaceSource } from "@/lib/registrations/place"
import { isRegistrationStatus } from "@/lib/registrations/status"
import { currentReviews, type TimelineEntry } from "@/lib/registrations/timeline"
import { teamActivity } from "@/lib/registrations/team-activity"

/** One place per HR member, replaced on each review, recommendation or mark (see `place.ts`). */
const placeDocument = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    registrationId: { type: String, required: true },
    /** Canonical list query (`placeListQuery`), for the back link and the arrows. */
    listQuery: { type: String, default: "" },
    source: { type: String, enum: ["review", "recommendation", "mark"], required: true },
    at: { type: Date, required: true },
  },
  { collection: "review_places" },
)

type PlaceDocument = InferSchemaType<typeof placeDocument>

const PlaceModel =
  (mongoose.models.ReviewPlace as mongoose.Model<PlaceDocument> | undefined) ??
  mongoose.model<PlaceDocument>("ReviewPlace", placeDocument)

export async function saveReviewPlace(
  userId: string,
  registrationId: string,
  search: string,
  source: PlaceSource,
) {
  if (!isValidObjectId(registrationId)) return
  await connectToDatabase()
  await PlaceModel.updateOne(
    { userId },
    { $set: { registrationId, listQuery: placeListQuery(search), source, at: new Date() } },
    { upsert: true },
  )
}

export async function clearReviewPlace(userId: string) {
  await connectToDatabase()
  await PlaceModel.deleteOne({ userId })
}

/** The member's place with what the banner shows, or `null` (none, or the registration is gone). */
export async function getReviewPlace(userId: string) {
  await connectToDatabase()
  const place = await PlaceModel.findOne({ userId }).lean()
  if (!place) return null
  const registration = await RegistrationModel.findById(place.registrationId)
    .select("firstName lastName status timeline")
    .lean()
  if (!registration) return null
  const ownReview = currentReviews((registration.timeline ?? []) as TimelineEntry[]).find(
    (review) => review.actorId === userId,
  )
  return {
    registrationId: place.registrationId,
    listQuery: place.listQuery,
    source: place.source as PlaceSource,
    at: place.at,
    name: `${registration.firstName} ${registration.lastName}`,
    status: isRegistrationStatus(registration.status) ? registration.status : "pending",
    ownState: ownReview?.state,
  }
}

/** Whether this registration is the member's place, for the "Mark my place" button. */
export async function isReviewPlace(userId: string, registrationId: string) {
  await connectToDatabase()
  return Boolean(await PlaceModel.exists({ userId, registrationId }))
}

/** Every HR member's decisions, from all the timelines (a few hundred registrations at most). */
export async function getTeamActivity() {
  await connectToDatabase()
  const registrations = await RegistrationModel.find({ "timeline.0": { $exists: true } })
    .select("timeline")
    .lean()
  return teamActivity(registrations.map((registration) => registration.timeline as TimelineEntry[]))
}
