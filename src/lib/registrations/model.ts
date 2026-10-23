import "server-only"

import mongoose, { Schema, type InferSchemaType } from "mongoose"

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
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  },
  { timestamps: true },
)

export type RegistrationDocument = InferSchemaType<typeof registrationDocument>

/** `models.Registration` is reused across hot reloads, a second `model()` call would throw. */
export const RegistrationModel =
  (mongoose.models.Registration as mongoose.Model<RegistrationDocument> | undefined) ??
  mongoose.model<RegistrationDocument>("Registration", registrationDocument)
