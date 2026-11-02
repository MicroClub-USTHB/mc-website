import "server-only"

import mongoose, { Schema, type InferSchemaType } from "mongoose"

import { REGISTRATION_STATUSES, REVIEW_STATES } from "@/lib/registrations/status"

/** One action of an HR member on a registration, see `TimelineEntry`. */
const timelineEntry = new Schema(
  {
    kind: {
      type: String,
      enum: ["review", "recommendation", "recommendation-removed"],
      required: true,
    },
    actorId: { type: String, required: true },
    actorName: { type: String, required: true },
    at: { type: Date, required: true },
    state: { type: String, enum: REVIEW_STATES },
    reason: { type: String },
    target: { type: String },
    note: { type: String },
  },
  { _id: false },
)

const registrationDocument = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    discord: { type: String, required: true, trim: true },
    /** International number, e.g. `+213555123456`. */
    phone: { type: String, required: true, trim: true },
    birthDate: { type: Date, required: true },
    /** Lowercased: it is the unique key, one registration per email. */
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    fieldOfStudy: { type: String, required: true, trim: true },
    yearOfStudy: { type: String, required: true, trim: true },
    university: { type: String, required: true, trim: true },
    studentId: {
      /** Signed Cloudinary URL of the private upload. */
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      resourceType: { type: String, required: true },
      format: { type: String },
      bytes: { type: Number },
    },
    answers: {
      aboutYou: { type: String, required: true },
      knowAboutClub: { type: String, required: true },
      beingInClub: { type: String, required: true },
      canBring: { type: String, required: true },
      yearGoals: { type: String, required: true },
      expectations: { type: String, required: true },
    },
    links: {
      portfolio: { type: String, default: "" },
      behance: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
    },
    skills: { type: [String], required: true },
    /** Computed from `timeline` on every change, stored for the list to filter and sort. */
    status: { type: String, enum: REGISTRATION_STATUSES, default: "pending" },
    timeline: { type: [timelineEntry], default: [] },
  },
  { timestamps: true },
)

// The admin list: newest first by default, often filtered by status.
registrationDocument.index({ createdAt: -1 })
registrationDocument.index({ status: 1, createdAt: -1 })

export type RegistrationDocument = InferSchemaType<typeof registrationDocument>

/** `models.Registration` is reused across hot reloads, a second `model()` call would throw. */
export const RegistrationModel =
  (mongoose.models.Registration as mongoose.Model<RegistrationDocument> | undefined) ??
  mongoose.model<RegistrationDocument>("Registration", registrationDocument)
