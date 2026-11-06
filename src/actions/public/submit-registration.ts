"use server"

import { headers } from "next/headers"

import { PHONE_COUNTRIES, STUDENT_ID_RULES } from "@/const/registrations"
import { deleteStudentId, verifyStudentIdUpload, type UploadedStudentId } from "@/lib/cloudinary"
import { connectToDatabase } from "@/lib/mongodb"
import { clientIp, isRateLimited } from "@/lib/rate-limit"
import { RegistrationModel } from "@/lib/registrations/model"
import { areRegistrationsOpen } from "@/lib/registrations/window"
import {
  REGISTRATION_HONEYPOT_FIELD,
  normalizePhone,
  parseBirthDate,
  registrationSchema,
  type RegistrationErrors,
} from "@/lib/registrations/schema"
import { STUDENT_ID_PUBLIC_ID, type StudentIdUpload } from "@/lib/registrations/upload-student-id"

/**
 * Outcome of a registration, one case per feedback modal:
 * `success` -> success modal, `duplicate` / `rate-limited` -> warning modal, `error` -> error modal.
 * `invalid` is not a modal: the form shows the messages next to the fields. `uploadRejected` tells
 * the form that the uploaded ID is gone (deleted or never there), so it must upload it again.
 */
export type RegistrationResult =
  | { status: "success" }
  | {
      status: "invalid"
      errors: RegistrationErrors
      studentIdError?: string
      uploadRejected?: boolean
    }
  | { status: "duplicate" }
  | { status: "rate-limited" }
  | { status: "error" }

/**
 * Per IP, a loose backstop only: a campus network or a mobile carrier (CGNAT) puts many students
 * behind one address. The real limit is per email, the one key a registration has.
 */
const IP_RATE_LIMIT = { limit: 30, windowMs: 60 * 60 * 1000 }
const EMAIL_RATE_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 }
const MONGO_DUPLICATE_KEY = 11000

function readUploadReference(raw: FormDataEntryValue | null): StudentIdUpload | null {
  try {
    const upload = JSON.parse(String(raw)) as Partial<StudentIdUpload>
    const valid =
      typeof upload.publicId === "string" &&
      STUDENT_ID_PUBLIC_ID.test(upload.publicId) &&
      (upload.resourceType === "image" || upload.resourceType === "raw") &&
      typeof upload.version === "number" &&
      typeof upload.signature === "string" &&
      typeof upload.format === "string" &&
      typeof upload.bytes === "number"
    return valid ? (upload as StudentIdUpload) : null
  } catch {
    return null
  }
}

/**
 * Deletes the student ID of a rejected or dropped submission, but only when Cloudinary's signature
 * proves it is a real upload response, which only the visitor who uploaded the file received: a
 * forged reference could name another applicant's file.
 */
async function discardUpload(upload: StudentIdUpload | null) {
  try {
    if (upload && verifyStudentIdUpload(upload)) await deleteStudentId(upload)
  } catch (error) {
    console.error("Registration: removing the uploaded student ID failed", error)
  }
}

/** The ID Cloudinary really stored must be small enough and in an accepted format. */
function uploadProblem(stored: UploadedStudentId) {
  if (stored.bytes > STUDENT_ID_RULES.maxBytes) return "This file is too large (5 MB max)."
  if (!stored.format || !(STUDENT_ID_RULES.formats as readonly string[]).includes(stored.format))
    return "Please upload a JPG, PNG, WebP or PDF file."
  return null
}

/**
 * Saves a registration: the form values (`values`, JSON), a reference to the student ID the browser
 * already uploaded to Cloudinary (`upload`, JSON) and the honeypot, as one `FormData`.
 *
 * Order: validate -> rate limit (per IP and per email) -> duplicate email -> check Cloudinary's
 * signature of the upload -> save in MongoDB. A rejected registration (invalid file, duplicate)
 * deletes its upload once its signature checks out; after a failure that may pass (database down)
 * the upload stays, so the retry reuses it. A filled honeypot gets a fake success (bots learn
 * nothing), is logged, and deletes its upload too. Needs `MONGODB_URI` and the `CLOUDINARY_*`
 * variables (`.env.example`).
 */
export async function submitRegistration(formData: FormData): Promise<RegistrationResult> {
  if (formData.get(REGISTRATION_HONEYPOT_FIELD)) {
    // A bot, or a visitor whose autofill filled the decoy: the log shows how often it happens.
    console.warn("Registration: honeypot filled, submission dropped")
    await discardUpload(readUploadReference(formData.get("upload")))
    return { status: "success" }
  }
  // The window may have closed while the form was open.
  if (!areRegistrationsOpen()) return { status: "error" }

  let raw: unknown
  try {
    raw = JSON.parse(String(formData.get("values")))
  } catch {
    return { status: "error" }
  }

  const parsed = registrationSchema.safeParse(raw)
  const upload = readUploadReference(formData.get("upload"))

  if (!parsed.success || !upload) {
    const errors: RegistrationErrors = {}
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors[issue.path[0] as keyof RegistrationErrors] ??= issue.message
      }
    }
    return {
      status: "invalid",
      errors,
      studentIdError: upload
        ? undefined
        : "Please upload your certificate of enrollment or student ID.",
      uploadRejected: !upload,
    }
  }

  const values = parsed.data
  const birthDate = parseBirthDate(values.birthDate)
  const country = PHONE_COUNTRIES.find((candidate) => candidate.code === values.phoneCountry)
  if (!birthDate || !country) return { status: "error" }

  const requestHeaders = await headers()
  const ip = clientIp(requestHeaders)
  const email = values.email.toLowerCase()
  const [ipLimited, emailLimited] = await Promise.all([
    isRateLimited(`registration:${ip}`, IP_RATE_LIMIT.limit, IP_RATE_LIMIT.windowMs),
    isRateLimited(`registration-email:${email}`, EMAIL_RATE_LIMIT.limit, EMAIL_RATE_LIMIT.windowMs),
  ])
  if (ipLimited || emailLimited) return { status: "rate-limited" }

  try {
    await connectToDatabase()

    if (await RegistrationModel.exists({ email })) {
      await discardUpload(upload)
      return { status: "duplicate" }
    }

    // A forged reference is refused without touching the file: it may not be this visitor's.
    const stored = verifyStudentIdUpload(upload)
    const problem = stored ? uploadProblem(stored) : "Please upload your ID again."
    if (!stored || problem) {
      await discardUpload(upload)
      return {
        status: "invalid",
        errors: {},
        studentIdError: problem ?? undefined,
        uploadRejected: true,
      }
    }

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
      studentId: stored,
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
    // Two submissions of one email at once: the unique index rejects the second one.
    if ((error as { code?: number }).code === MONGO_DUPLICATE_KEY) {
      await discardUpload(upload)
      return { status: "duplicate" }
    }

    console.error("Registration: saving failed", error)
    return { status: "error" }
  }
}
