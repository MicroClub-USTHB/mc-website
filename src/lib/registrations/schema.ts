import { z } from "zod"

import {
  ANSWER_MAX_LENGTH,
  ANSWER_MIN_LENGTH,
  PHONE_COUNTRIES,
  REGISTRATION_SKILLS,
  STUDENT_ID_RULES,
} from "@/const/registrations"

/** Name of the hidden decoy field: real visitors never see it, bots fill it. */
export const REGISTRATION_HONEYPOT_FIELD = "company"

const MIN_AGE = 14
const MAX_AGE = 100

const required = (label: string, max = 100) =>
  z
    .string()
    .trim()
    .min(1, `Please enter your ${label}.`)
    .max(max, `Your ${label} must be at most ${max} characters.`)

const answer = z
  .string()
  .trim()
  .min(1, "Please write your answer.")
  .min(ANSWER_MIN_LENGTH, `Please write at least ${ANSWER_MIN_LENGTH} characters.`)
  .max(ANSWER_MAX_LENGTH, `Your answer must be at most ${ANSWER_MAX_LENGTH} characters.`)

const optionalLink = z
  .string()
  .trim()
  .max(300, "This link is too long.")
  .refine((value) => value === "" || isHttpUrl(value), "Please enter a valid link (https://...).")

/**
 * The 9 national digits of an Algerian number typed with spaces, dashes, a leading 0 or the
 * country code (0555..., +213 555..., 00213 555... = 555...).
 */
export function normalizePhone(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/^(00)?213/, "")
    .replace(/^0+/, "")
}

/** Parses `dd/mm/yyyy` into a real date, or `null` when it is not an existing day. */
export function parseBirthDate(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
  if (!match) return null
  const [day, month, year] = [Number(match[1]), Number(match[2]), Number(match[3])]
  const date = new Date(Date.UTC(year, month - 1, day))
  const real =
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  return real ? date : null
}

function isHttpUrl(value: string) {
  try {
    const { protocol } = new URL(value)
    return protocol === "https:" || protocol === "http:"
  } catch {
    return false
  }
}

function yearsSince(date: Date) {
  const now = new Date()
  let years = now.getUTCFullYear() - date.getUTCFullYear()
  const birthdayPassed =
    now.getUTCMonth() > date.getUTCMonth() ||
    (now.getUTCMonth() === date.getUTCMonth() && now.getUTCDate() >= date.getUTCDate())
  if (!birthdayPassed) years -= 1
  return years
}

const countryCodes = PHONE_COUNTRIES.map((country) => country.code) as [string, ...string[]]

export const personalSchema = z.object({
  firstName: required("first name"),
  lastName: required("last name"),
  discord: required("Discord username", 40),
  phoneCountry: z.enum(countryCodes),
  phone: z
    .string()
    .trim()
    .min(1, "Please enter your phone number.")
    .refine((value) => /^[\d\s().+-]+$/.test(value), "Only digits, spaces and dashes are allowed.")
    // Algerian numbers: 9 digits, mobiles start with 5, 6 or 7, landlines with 2, 3 or 4.
    .refine(
      (value) => /^[2-7]\d{8}$/.test(normalizePhone(value)),
      "Please enter a valid Algerian phone number.",
    ),
  birthDate: z
    .string()
    .trim()
    .min(1, "Please enter your date of birth.")
    .superRefine((value, context) => {
      const date = parseBirthDate(value)
      if (!date) {
        const typed = /^\d{2}\/\d{2}\/\d{4}$/.test(value)
        context.addIssue({
          code: "custom",
          message: typed ? "This date does not exist." : "Please use the format dd/mm/yyyy.",
        })
        return
      }
      const age = yearsSince(date)
      if (date > new Date() || age < MIN_AGE || age > MAX_AGE)
        context.addIssue({ code: "custom", message: "Please enter a valid date of birth." })
    }),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email.")
    .max(254, "Please enter a valid email address.")
    .pipe(z.email("Please enter a valid email address.")),
  fieldOfStudy: required("field of study"),
  yearOfStudy: required("year of study", 40),
  university: required("university or school", 150),
})

export const aboutSchema = z.object({
  aboutYou: answer,
  knowAboutClub: answer,
  beingInClub: answer,
  canBring: answer,
  yearGoals: answer,
  expectations: answer,
})

export const additionalSchema = z.object({
  portfolioUrl: optionalLink,
  behanceUrl: optionalLink,
  linkedinUrl: optionalLink,
  githubUrl: optionalLink,
  skills: z
    .array(z.enum(REGISTRATION_SKILLS))
    .min(1, "Select at least 1 skill.")
    .max(REGISTRATION_SKILLS.length, "Too many skills selected."),
})

/** One schema per step, in step order: a step is valid when its schema accepts the values. */
export const STEP_SCHEMAS = [personalSchema, aboutSchema, additionalSchema] as const

export const registrationSchema = z.object({
  ...personalSchema.shape,
  ...aboutSchema.shape,
  ...additionalSchema.shape,
})

export type RegistrationValues = z.infer<typeof registrationSchema>
export type RegistrationField = keyof RegistrationValues
/** Fields typed as free text (all but the skills list). */
export type TextField = {
  [F in RegistrationField]: RegistrationValues[F] extends string ? F : never
}[RegistrationField]
export type RegistrationErrors = Partial<Record<RegistrationField, string>>

export const EMPTY_REGISTRATION: RegistrationValues = {
  firstName: "",
  lastName: "",
  discord: "",
  phoneCountry: PHONE_COUNTRIES[0].code,
  phone: "",
  birthDate: "",
  email: "",
  fieldOfStudy: "",
  yearOfStudy: "",
  university: "",
  aboutYou: "",
  knowAboutClub: "",
  beingInClub: "",
  canBring: "",
  yearGoals: "",
  expectations: "",
  portfolioUrl: "",
  behanceUrl: "",
  linkedinUrl: "",
  githubUrl: "",
  skills: [],
}

/** Fields owned by each step, derived from the step schemas. */
export const STEP_FIELDS = STEP_SCHEMAS.map(
  (schema) => Object.keys(schema.shape) as RegistrationField[],
)

/** Validates the fields of `step` (or all fields), as `field -> first error message`. */
export function validateRegistration(
  values: RegistrationValues,
  step?: number,
): RegistrationErrors {
  const schema = step === undefined ? registrationSchema : STEP_SCHEMAS[step]
  const result = schema.safeParse(values)
  if (result.success) return {}

  const errors: RegistrationErrors = {}
  for (const issue of result.error.issues) {
    const field = issue.path[0] as RegistrationField
    errors[field] ??= issue.message
  }
  return errors
}

/** Returns an error message when the student ID file is not accepted, else `null`. */
export function validateStudentId(file: Pick<File, "size" | "type"> | null) {
  if (!file) return "Please upload your certificate of enrollment or student ID."
  if (file.size === 0) return "This file is empty."
  if (file.size > STUDENT_ID_RULES.maxBytes) return "This file is too large (5 MB max)."
  if (!(STUDENT_ID_RULES.mimeTypes as readonly string[]).includes(file.type))
    return "Please upload a JPG, PNG, WebP or PDF file."
  return null
}
