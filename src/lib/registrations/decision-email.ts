import "server-only"

import { siteConfig } from "@/config/site"
import { sendHrEmail } from "@/lib/email"
import { connectToDatabase, getMongoClient } from "@/lib/mongodb"
import {
  DAILY_EMAIL_LIMIT,
  limitResetsAt,
  nextWaveSize,
  refusalsLocked,
  type DecisionKind,
} from "@/lib/registrations/decision-email-rules"
import {
  DISCORD_INVITE,
  acceptanceHtml,
  rejectionHtml,
} from "@/lib/registrations/decision-email-templates"
import { RegistrationModel } from "@/lib/registrations/model"
import type { TimelineActor } from "@/lib/registrations/timeline-store"

/** Fake addresses of the seed data (`@seed.test`): never emailed. */
const FAKE_EMAIL = /\.test$/i

type Sender = TimelineActor & { email: string }

/** The acceptance email, as drafted by Internal Relations. */
function acceptanceEmail(firstName: string, lastName: string) {
  const name = `${lastName} ${firstName}`.trim()
  return {
    subject: `${siteConfig.name}: access granted!`,
    html: acceptanceHtml(firstName, lastName),
    text: [
      `DEAR, ${name}!`,
      "",
      "Your signal reached us!",
      `First, thank you for your time, enthusiasm, and interest in becoming part of ${siteConfig.name} for the 2026/2027 academic year.`,
      "",
      "ACCESS GRANTED! YOU'VE BEEN ACCEPTED!",
      "",
      "We are delighted to welcome you to our community and look forward to having you as part of the club.",
      "Before you log in, read the Discord Guide: https://docs.google.com/document/d/1GlJGSv3PtZPeNiXc1k2ehkqaxDxCYAgBLLd4FSCCLMY/edit?tab=t.0",
      "",
      "ICE-BREAK EVENT: we will be holding our Ice-Break event on 23/11/2026, for our newly recruited members. More details will be shared on the Discord server.",
      "",
      "IMPORTANT: by not joining the members' server, you will not be considered an official member of Micro Club. This server is reserved exclusively for accepted members: sharing this link with anyone is strictly prohibited.",
      `Join the server: ${DISCORD_INVITE}`,
      "",
      "LET'S EXPERIENCE IT!",
    ].join("\n"),
  }
}

/** The refusal email, as drafted by Internal Relations. */
function refusalEmail(firstName: string, lastName: string) {
  const name = `${lastName} ${firstName}`.trim()
  return {
    subject: `${siteConfig.name}: application update`,
    html: rejectionHtml(firstName, lastName),
    text: [
      `DEAR, ${name}!`,
      "",
      "Your signal reached us!",
      `First, thank you for your time, enthusiasm, and interest in becoming part of ${siteConfig.name} for the 2026/2027 academic year.`,
      "",
      "After carefully reviewing all applications, we regret to inform you that your application has not been selected this time.",
      "",
      "Even if you weren't selected for internal membership this round, you are always welcome to attend our public workshops, hackathons, and Open Days!",
      `You can join our community Discord server: ${DISCORD_INVITE}`,
      "",
      `Thank you once again for your interest in ${siteConfig.name}, and we wish you the very best in your future endeavors!`,
      "",
      "Best regards,",
      "Micro Club Internal Relations Management Department",
      "USTHB – Algiers",
    ].join("\n"),
  }
}

function decisionEmail(kind: DecisionKind, firstName: string, lastName: string) {
  return kind === "accepted"
    ? acceptanceEmail(firstName, lastName)
    : refusalEmail(firstName, lastName)
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
        ...decisionEmail(kind, member.name, ""),
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
        ...decisionEmail(kind, String(document.firstName), String(document.lastName)),
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
