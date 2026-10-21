"use server"

import { headers } from "next/headers"

import { deleteStudentId, uploadStudentId, type UploadedStudentId } from "@/lib/cloudinary"
import { matchesFileSignature } from "@/lib/registrations/file-signature"
import { connectToDatabase } from "@/lib/mongodb"
import { isRateLimited } from "@/lib/rate-limit"
import { RegistrationModel } from "@/lib/registrations/model"
import {
  REGISTRATION_HONEYPOT_FIELD,
  normalizePhone,
  parseBirthDate,
  registrationSchema,
  validateStudentId,
  type RegistrationErrors,
} from "@/lib/registrations/schema"
import { PHONE_COUNTRIES } from "@/const/registrations"

/**
 * Outcome of a registration, one case per feedback modal:
 * `success` -> success modal, `duplicate` / `rate-limited` -> warning modal, `error` -> error modal.
 * `invalid` is not a modal: the form shows the messages next to the fields.
 */
export type RegistrationResult =
  | { status: "success" }
  | { status: "invalid"; errors: RegistrationErrors; studentIdError?: string }
  | { status: "duplicate" }
  | { status: "rate-limited" }
  | { status: "error" }

const RATE_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 }
const MONGO_DUPLICATE_KEY = 11000

/**
 * Saves a registration: the form values (`values`, JSON), the student ID (`studentId`, file) and the
 * honeypot, as one `FormData`.
 *
 * Order: validate -> rate limit -> duplicate email -> upload the ID to Cloudinary -> save in MongoDB.
 * If saving fails after the upload, the uploaded file is removed. A filled honeypot gets a fake
 * success (bots learn nothing). Needs `MONGODB_URI` and the `CLOUDINARY_*` variables (`.env.example`).
 */
export async function submitRegistration(formData: FormData): Promise<RegistrationResult> {
  if (formData.get(REGISTRATION_HONEYPOT_FIELD)) return { status: "success" }

  let raw: unknown
  try {
    raw = JSON.parse(String(formData.get("values")))
  } catch {
    return { status: "error" }
  }

  const parsed = registrationSchema.safeParse(raw)
  const file = formData.get("studentId")
  const studentId = file instanceof File ? file : null
  const studentIdError =
    validateStudentId(studentId) ??
    (studentId && !(await matchesFileSignature(studentId))
      ? "This file does not look like a valid JPG, PNG, WebP or PDF."
      : null)

  if (!parsed.success || studentIdError) {
    const errors: RegistrationErrors = {}
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors[issue.path[0] as keyof RegistrationErrors] ??= issue.message
      }
    }
    return { status: "invalid", errors, studentIdError: studentIdError ?? undefined }
  }

  const values = parsed.data
  const birthDate = parseBirthDate(values.birthDate)
  const country = PHONE_COUNTRIES.find((candidate) => candidate.code === values.phoneCountry)
  if (!birthDate || !country || !studentId) return { status: "error" }

  const requestHeaders = await headers()
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (isRateLimited(`registration:${ip}`, RATE_LIMIT.limit, RATE_LIMIT.windowMs))
    return { status: "rate-limited" }

  let upload: UploadedStudentId | null = null
  try {
    await connectToDatabase()

    const email = values.email.toLowerCase()
    if (await RegistrationModel.exists({ email })) return { status: "duplicate" }

    upload = await uploadStudentId(studentId)

    await RegistrationModel.create({
      firstName: values.firstName,
      lastName: values.lastName,
      discord: values.discord,
      phone: `${country.dialCode}${normalizePhone(values.phone)}`,
      birthDate,
      email,
      fieldOfStudy: values.fieldOfStudy,
      yearOfStudy: values.yearOfStudy,
      university: values.university,
      studentId: upload,
      answers: {
        aboutYou: values.aboutYou,
        knowAboutClub: values.knowAboutClub,
        beingInClub: values.beingInClub,
        canBring: values.canBring,
        yearGoals: values.yearGoals,
        expectations: values.expectations,
      },
      links: {
        portfolio: values.portfolioUrl,
        behance: values.behanceUrl,
        linkedin: values.linkedinUrl,
        github: values.githubUrl,
      },
      skills: values.skills,
    })

    return { status: "success" }
  } catch (error) {
    if (upload) {
      await deleteStudentId(upload).catch((cleanupError) =>
        console.error("Registration: removing the uploaded student ID failed", cleanupError),
      )
    }
    // Two submissions of one email at once: the unique index rejects the second one.
    if ((error as { code?: number }).code === MONGO_DUPLICATE_KEY) return { status: "duplicate" }

    console.error("Registration: saving failed", error)
    return { status: "error" }
  }
}
