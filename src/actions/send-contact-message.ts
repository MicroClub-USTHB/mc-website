"use server"

import { Resend } from "resend"

import { buildClubEmail, buildConfirmationEmail } from "@/lib/contact-email"
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

const SEND_ERROR = "We could not send your message. Please try again later."

/**
 * Validates the contact form, then through Resend:
 * 1. emails the submission to the club inbox (reply-to is the sender), and
 * 2. emails a confirmation with a copy of the message to the sender.
 *
 * Needs `CONTACT_RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL` (see `.env.example`).
 * The club email decides success; a failed confirmation is only logged.
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
    return { status: "error", message: SEND_ERROR, values }
  }

  const resend = new Resend(apiKey)

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: values.email,
      ...buildClubEmail(values),
    })
    if (error) throw new Error(`${error.name}: ${error.message}`)
  } catch (error) {
    console.error("Contact form: sending to the club failed", error)
    return { status: "error", message: SEND_ERROR, values }
  }

  try {
    const { error } = await resend.emails.send({
      from,
      to: values.email,
      replyTo: to,
      ...buildConfirmationEmail(values),
    })
    if (error) throw new Error(`${error.name}: ${error.message}`)
  } catch (error) {
    console.error("Contact form: sending the confirmation failed", error)
  }

  return {
    status: "success",
    message: "Thank you! Your message has been sent. A confirmation was sent to your email.",
  }
}
