import "server-only"

import { siteConfig } from "@/config/site"
import { CONTACT } from "@/const/contact"
import { emailParagraph, emailSteps, escapeHtml, renderEmail, sendHrEmail } from "@/lib/email"
import { connectToDatabase, getMongoClient } from "@/lib/mongodb"
import { RegistrationModel } from "@/lib/registrations/model"
import type { TimelineActor } from "@/lib/registrations/timeline-store"

/** Fake addresses of the seed data (`@seed.test`): never emailed. */
const FAKE_EMAIL = /\.test$/i

/** The acceptance email sent to `fullName`, the same for the HR test and the applicants. */
export function acceptanceEmail(fullName: string) {
  const discord = CONTACT.discord
  const subject = `Welcome to ${siteConfig.name}, ${fullName}!`
  const html = renderEmail({
    preheader: `Congratulations ${fullName}, your application to ${siteConfig.name} is accepted.`,
    title: `Welcome aboard, ${fullName}!`,
    intro: `Congratulations: the HR team is happy to tell you that you are accepted into ${siteConfig.name}.`,
    rows: [
      emailParagraph(
        `You now join a community of students who build, learn and share in tech since 1985. We can't wait to see what you will create with us.`,
      ),
      emailSteps("What happens next", [
        "Join our Discord server: it is where the club talks, plans and shares every announcement.",
        "Introduce yourself there and meet the members of your section.",
        "Watch for the welcome session and your first activities, announced on Discord.",
      ]),
      emailParagraph(
        `Questions? Just reply to this email and the HR team will answer you.<br><br>See you soon,<br><strong>${escapeHtml(siteConfig.name)}</strong>`,
      ),
    ].join(""),
    action: { label: "Join the Discord server", href: discord },
  })
  const text = [
    `Welcome aboard, ${fullName}!`,
    "",
    `Congratulations: the HR team is happy to tell you that you are accepted into ${siteConfig.name}.`,
    "",
    "What happens next:",
    "1. Join our Discord server, where every announcement is shared.",
    "2. Introduce yourself there and meet the members of your section.",
    "3. Watch for the welcome session and your first activities.",
    "",
    `Join the Discord server: ${discord}`,
    "",
    `Questions? Reply to this email. See you soon, ${siteConfig.name}.`,
  ].join("\n")
  return { subject, html, text }
}

/** Every active HR member with a real address: where the HR test goes. */
async function testRecipients() {
  await connectToDatabase()
  const users = await getMongoClient()
    .db()
    .collection<{ name: string; email: string; role?: string; banned?: boolean }>("user")
    .find({ role: "hr", banned: { $ne: true } })
    .project<{ name: string; email: string }>({ name: 1, email: 1 })
    .toArray()
  return users.filter((user) => !FAKE_EMAIL.test(user.email))
}

export type SendResult = { sent: number; failed: string[] }

/** Sends one by one, so a failed address does not stop the others; returns what went out. */
async function sendAll<T extends { email: string }>(
  recipients: T[],
  build: (recipient: T) => { fullName: string; replyTo: string },
  onSent?: (recipient: T) => Promise<unknown>,
): Promise<SendResult> {
  const result: SendResult = { sent: 0, failed: [] }
  for (const recipient of recipients) {
    const { fullName, replyTo } = build(recipient)
    try {
      await sendHrEmail({ to: recipient.email, replyTo, ...acceptanceEmail(fullName) })
      await onSent?.(recipient)
      result.sent += 1
    } catch (error) {
      console.error(`Acceptance email to ${recipient.email} failed:`, error)
      result.failed.push(recipient.email)
    }
  }
  return result
}

/**
 * The exact acceptance email, sent to every HR member with their own name, to check it before
 * sending it to the applicants.
 */
export async function sendAcceptanceTest(actor: TimelineActor & { email: string }) {
  const recipients = await testRecipients()
  return sendAll(recipients, (recipient) => ({ fullName: recipient.name, replyTo: actor.email }))
}

/** Accepted registrations that did not get the acceptance email yet. */
function waitingFilter() {
  return {
    status: "accepted" as const,
    "acceptanceEmail.sentAt": { $exists: false },
    email: { $not: FAKE_EMAIL },
  }
}

export async function countWaitingAcceptances() {
  await connectToDatabase()
  return RegistrationModel.countDocuments(waitingFilter())
}

/**
 * Sends the acceptance email to every accepted registration that did not get it yet, marking each
 * one as it goes out: sending again only reaches the ones left (new or failed).
 */
export async function sendAcceptanceEmails(actor: TimelineActor & { email: string }) {
  await connectToDatabase()
  const documents = await RegistrationModel.find(waitingFilter())
    .select("firstName lastName email")
    .sort({ createdAt: 1 })
    .lean()
  const registrations = documents.map((document) => ({
    id: document._id,
    email: String(document.email),
    fullName: `${document.firstName} ${document.lastName}`,
  }))
  return sendAll(
    registrations,
    (registration) => ({ fullName: registration.fullName, replyTo: actor.email }),
    (registration) =>
      RegistrationModel.updateOne(
        { _id: registration.id },
        {
          $set: {
            acceptanceEmail: { sentAt: new Date(), sentById: actor.id, sentByName: actor.name },
          },
        },
      ),
  )
}
