import "server-only"

import { siteConfig } from "@/config/site"
import { CONTACT } from "@/const/contact"
import { emailParagraph, emailSteps, escapeHtml, renderEmail, sendHrEmail } from "@/lib/email"
import { connectToDatabase, getMongoClient } from "@/lib/mongodb"
import {
  DAILY_EMAIL_LIMIT,
  limitResetsAt,
  nextWaveSize,
  refusalsLocked,
  type DecisionKind,
} from "@/lib/registrations/decision-email-rules"
import { RegistrationModel } from "@/lib/registrations/model"
import type { TimelineActor } from "@/lib/registrations/timeline-store"

/** Fake addresses of the seed data (`@seed.test`): never emailed. */
const FAKE_EMAIL = /\.test$/i

type Sender = TimelineActor & { email: string }

const SIGN_OFF = `Questions? Just reply to this email.<br><br>See you soon,<br><strong>${escapeHtml(siteConfig.name)}</strong>`

/** The acceptance email sent to `fullName`, the same for the HR test and the applicants. */
function acceptanceEmail(fullName: string) {
  const discord = CONTACT.discord
  return {
    subject: `Welcome to ${siteConfig.name}, ${fullName}!`,
    html: renderEmail({
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
        emailParagraph(SIGN_OFF),
      ].join(""),
      action: { label: "Join the Discord server", href: discord },
    }),
    text: [
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
    ].join("\n"),
  }
}

/** The refusal email sent to `fullName`: kind, and the door left open to the community. */
function refusalEmail(fullName: string) {
  const discord = CONTACT.discord
  return {
    subject: `Your application to ${siteConfig.name}`,
    html: renderEmail({
      preheader: `Thank you for applying to ${siteConfig.name}, ${fullName}.`,
      title: `Thank you, ${fullName}`,
      intro: `Thank you for your interest in ${siteConfig.name} and for the time you gave to your application.`,
      rows: [
        emailParagraph(
          `We received far more applications than we have places this year. After reading every one of them carefully, we are sorry to tell you that we cannot welcome you into the club this time.`,
        ),
        emailSteps("You are still part of the community", [
          "Our events, workshops and hackathons are open to every student: join them.",
          "Stay in touch on our Discord server, where every event is announced.",
          "Keep building and apply again at the next recruitment: we would love to read you again.",
        ]),
        emailParagraph(SIGN_OFF),
      ].join(""),
      action: { label: "Join the Discord server", href: discord },
    }),
    text: [
      `Thank you, ${fullName}`,
      "",
      `Thank you for your interest in ${siteConfig.name} and for the time you gave to your application.`,
      "We received far more applications than we have places this year, and we are sorry to tell you that we cannot welcome you into the club this time.",
      "",
      "You are still part of the community:",
      "1. Our events, workshops and hackathons are open to every student.",
      "2. Stay in touch on our Discord server, where every event is announced.",
      "3. Apply again at the next recruitment.",
      "",
      `Join the Discord server: ${discord}`,
      "",
      `Questions? Reply to this email. See you soon, ${siteConfig.name}.`,
    ].join("\n"),
  }
}

function decisionEmail(kind: DecisionKind, fullName: string) {
  return kind === "accepted" ? acceptanceEmail(fullName) : refusalEmail(fullName)
}

/** Registrations of `kind` that did not get their decision email yet. */
function waitingFilter(kind: DecisionKind) {
  return {
    status: kind,
    "decisionEmail.sentAt": { $exists: false },
    email: { $not: FAKE_EMAIL },
  }
}

const DAY = 24 * 60 * 60 * 1000

/** When each decision email of the last 24 hours went out (duplicates were not sent). */
async function sentLast24h() {
  const documents = await RegistrationModel.find({
    "decisionEmail.sentAt": { $gte: new Date(Date.now() - DAY) },
    "decisionEmail.duplicate": { $ne: true },
  })
    .select("decisionEmail.sentAt")
    .lean()
  return documents.flatMap((document) =>
    document.decisionEmail?.sentAt ? [new Date(document.decisionEmail.sentAt)] : [],
  )
}

/** What waits and what went out for each decision, and the room left in the daily limit. */
export async function decisionEmailStatus() {
  await connectToDatabase()
  const [acceptedWaiting, acceptedSent, rejectedWaiting, rejectedSent, recent] = await Promise.all([
    RegistrationModel.countDocuments(waitingFilter("accepted")),
    RegistrationModel.countDocuments({ "decisionEmail.kind": "accepted" }),
    RegistrationModel.countDocuments(waitingFilter("rejected")),
    RegistrationModel.countDocuments({ "decisionEmail.kind": "rejected" }),
    sentLast24h(),
  ])
  const wave = (waiting: number) => nextWaveSize({ sentLast24h: recent.length, waiting })
  return {
    accepted: { waiting: acceptedWaiting, sent: acceptedSent, wave: wave(acceptedWaiting) },
    rejected: {
      waiting: rejectedWaiting,
      sent: rejectedSent,
      wave: refusalsLocked(acceptedWaiting) ? 0 : wave(rejectedWaiting),
      locked: refusalsLocked(acceptedWaiting),
    },
    limit: { sent: recent.length, max: DAILY_EMAIL_LIMIT, resetsAt: limitResetsAt(recent) },
  }
}

export type DecisionEmailStatus = Awaited<ReturnType<typeof decisionEmailStatus>>

export type SendResult = { sent: number; skipped: number; failed: string[] }

/** Every active HR member with a real address: where the HR test goes. */
async function hrMembers() {
  await connectToDatabase()
  const users = await getMongoClient()
    .db()
    .collection<{ name: string; email: string; role?: string; banned?: boolean }>("user")
    .find({ role: "hr", banned: { $ne: true } })
    .project<{ name: string; email: string }>({ name: 1, email: 1 })
    .toArray()
  return users.filter((user) => !FAKE_EMAIL.test(user.email))
}

/**
 * The exact decision email, sent to every HR member with their own name, to check it before
 * sending it to the applicants. Not counted as sent to anyone.
 */
export async function sendDecisionTest(kind: DecisionKind, sender: Sender): Promise<SendResult> {
  const result: SendResult = { sent: 0, skipped: 0, failed: [] }
  for (const member of await hrMembers()) {
    try {
      await sendHrEmail({
        to: member.email,
        replyTo: sender.email,
        ...decisionEmail(kind, member.name),
      })
      result.sent += 1
    } catch (error) {
      console.error(`Decision test email to ${member.email} failed:`, error)
      result.failed.push(member.email)
    }
  }
  return result
}

export class DecisionEmailError extends Error {}

/**
 * Sends the next wave of `kind` emails, oldest registrations first, within the daily limit.
 * Each registration is marked before its email goes out (and unmarked if it fails), so two HR
 * members sending at once never email anyone twice; an address that already got a decision email,
 * from another registration, is marked as a duplicate instead of emailed again.
 */
export async function sendDecisionWave(kind: DecisionKind, sender: Sender): Promise<SendResult> {
  const status = await decisionEmailStatus()
  if (kind === "rejected" && status.rejected.locked) {
    throw new DecisionEmailError("Send every acceptance email before the refusals.")
  }
  const size = status[kind].wave
  if (size === 0) throw new DecisionEmailError("Nothing to send now: the daily limit is reached.")

  const documents = await RegistrationModel.find(waitingFilter(kind))
    .select("firstName lastName email")
    .sort({ createdAt: 1 })
    .limit(size)
    .lean()
  const emailed = new Set(
    (
      await RegistrationModel.distinct("email", {
        email: { $in: documents.map((document) => document.email) },
        "decisionEmail.sentAt": { $exists: true },
      })
    ).map((email) => String(email).toLowerCase()),
  )

  const result: SendResult = { sent: 0, skipped: 0, failed: [] }
  for (const document of documents) {
    const email = String(document.email)
    const duplicate = emailed.has(email.toLowerCase())
    const claimed = await RegistrationModel.updateOne(
      { _id: document._id, "decisionEmail.sentAt": { $exists: false } },
      {
        $set: {
          decisionEmail: {
            kind,
            sentAt: new Date(),
            sentById: sender.id,
            sentByName: sender.name,
            ...(duplicate && { duplicate: true }),
          },
        },
      },
    )
    // Another HR member's wave took it first.
    if (claimed.modifiedCount === 0) continue
    if (duplicate) {
      result.skipped += 1
      continue
    }
    try {
      await sendHrEmail({
        to: email,
        replyTo: sender.email,
        ...decisionEmail(kind, `${document.firstName} ${document.lastName}`),
      })
      emailed.add(email.toLowerCase())
      result.sent += 1
    } catch (error) {
      console.error(`Decision email to ${email} failed:`, error)
      await RegistrationModel.updateOne({ _id: document._id }, { $unset: { decisionEmail: 1 } })
      result.failed.push(email)
    }
  }
  return result
}
