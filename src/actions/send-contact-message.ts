"use server"

import { headers } from "next/headers"
import { Resend } from "resend"

import { notifyDiscord } from "@/lib/contact-discord"
import { buildClubEmail, buildConfirmationEmail } from "@/lib/contact-email"
import {
  readContactValues,
  validateContact,
  type ContactErrors,
  type ContactValues,
} from "@/lib/contact-validation"
import { isRateLimited } from "@/lib/rate-limit"

export type ContactState = {
  status: "idle" | "success" | "error"
  message?: string
  errors?: ContactErrors
  /** Submitted values, so the form can keep them when the submission fails. */
  values?: ContactValues
}

/** Name of the hidden decoy field: real visitors never see it, bots fill it. */
export const HONEYPOT_FIELD = "website"

const RATE_LIMIT = { limit: 3, windowMs: 10 * 60 * 1000 }

const SUCCESS = "Thank you! Your message has been sent. A confirmation was sent to your email."
const SEND_ERROR = "We could not send your message. Please try again later."

/**
 * Validates the contact form, then through Resend:
 * 1. emails the submission to the club inbox (reply-to is the sender), and
 * 2. emails a confirmation with a copy of the message to the sender, and
 * 3. posts the submission to Discord when `CONTACT_DISCORD_WEBHOOK_URL` is set.
 *
 * Spam: a filled honeypot gets a fake success (bots learn nothing), and each IP can send 3 messages
 * per 10 minutes. Needs `CONTACT_RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL`
 * (see `.env.example`). The club email decides success; the confirmation and Discord only log.
 */
export async function sendContactMessage(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  if (formData.get(HONEYPOT_FIELD)) return { status: "success", message: SUCCESS }

  const values = readContactValues(formData)
  const errors = validateContact(values)
  if (Object.keys(errors).length > 0) return { status: "error", errors, values }

  const requestHeaders = await headers()
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (isRateLimited(`contact:${ip}`, RATE_LIMIT.limit, RATE_LIMIT.windowMs)) {
    return {
      status: "error",
      message: "Too many messages sent. Please try again in a few minutes.",
      values,
    }
  }

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

  const discordWebhook = process.env.CONTACT_DISCORD_WEBHOOK_URL
  const [confirmation, discord] = await Promise.allSettled([
    resend.emails
      .send({ from, to: values.email, replyTo: to, ...buildConfirmationEmail(values) })
      .then(({ error }) => {
        if (error) throw new Error(`${error.name}: ${error.message}`)
      }),
    discordWebhook ? notifyDiscord(discordWebhook, values) : Promise.resolve(),
  ])
  if (confirmation.status === "rejected")
    console.error("Contact form: sending the confirmation failed", confirmation.reason)
  if (discord.status === "rejected")
    console.error("Contact form: Discord notification failed", discord.reason)

  return {
    status: "success",
    message: SUCCESS,
  }
}
