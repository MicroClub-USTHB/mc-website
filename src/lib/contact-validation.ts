export const CONTACT_FIELDS = ["name", "email", "message"] as const

export type ContactField = (typeof CONTACT_FIELDS)[number]
export type ContactValues = Record<ContactField, string>
export type ContactErrors = Partial<Record<ContactField, string>>

export const CONTACT_LIMITS = { name: 100, email: 254, message: 2000 } as const

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Reads the contact fields out of a submitted form, as trimmed strings. */
export function readContactValues(formData: FormData): ContactValues {
  const read = (field: ContactField) => {
    const value = formData.get(field)
    return typeof value === "string" ? value.trim() : ""
  }
  return { name: read("name"), email: read("email"), message: read("message") }
}

/** Shared by the form (instant feedback) and the Server Action (the source of truth). */
export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {}

  if (!values.name) errors.name = "Please enter your full name."
  else if (values.name.length > CONTACT_LIMITS.name)
    errors.name = `Your name must be at most ${CONTACT_LIMITS.name} characters.`

  if (!values.email) errors.email = "Please enter your email."
  else if (values.email.length > CONTACT_LIMITS.email || !EMAIL_PATTERN.test(values.email))
    errors.email = "Please enter a valid email address."

  if (!values.message) errors.message = "Please write your message."
  else if (values.message.length > CONTACT_LIMITS.message)
    errors.message = `Your message must be at most ${CONTACT_LIMITS.message} characters.`

  return errors
}
