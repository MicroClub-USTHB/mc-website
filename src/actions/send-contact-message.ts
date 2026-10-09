"use server"

import {
  readContactValues,
  validateContact,
  type ContactErrors,
  type ContactValues,
} from "@/lib/contact-validation"

export type ContactState = {
  status: "idle" | "success" | "error"
  message?: string
  errors?: ContactErrors
  /** Submitted values, so the form can keep them when the submission fails. */
  values?: ContactValues
}

const RESEND_URL = "https://api.resend.com/emails"

/**
 * Validates the contact form and emails it to the club inbox through Resend.
 * Needs `CONTACT_RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL` (see `.env.example`).
 */
export async function sendContactMessage(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const values = readContactValues(formData)
  const errors = validateContact(values)
  if (Object.keys(errors).length > 0) return { status: "error", errors, values }

  const apiKey = process.env.CONTACT_RESEND_API_KEY
  const to = process.env.CONTACT_TO_EMAIL
  const from = process.env.CONTACT_FROM_EMAIL
  if (!apiKey || !to || !from) {
    console.error(
      "Contact form: CONTACT_RESEND_API_KEY, CONTACT_TO_EMAIL or CONTACT_FROM_EMAIL is missing",
    )
    return {
      status: "error",
      message: "We could not send your message. Please try again later.",
      values,
    }
  }

  try {
    const response = await fetch(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to,
        reply_to: values.email,
        subject: `Website contact: ${values.name}`,
        text: `From: ${values.name} <${values.email}>\n\n${values.message}`,
      }),
    })
    if (!response.ok) throw new Error(`Resend responded with ${response.status}`)
  } catch (error) {
    console.error("Contact form: sending failed", error)
    return {
      status: "error",
      message: "We could not send your message. Please try again later.",
      values,
    }
  }

  return {
    status: "success",
    message: "Thank you! Your message has been sent, we will get back to you soon.",
  }
}
