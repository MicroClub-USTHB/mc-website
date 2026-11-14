"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { adminRoutes } from "@/config/admin"
import { requireStaff } from "@/lib/auth/session"
import {
  DecisionEmailError,
  sendDecisionTest,
  sendDecisionWave,
  type SendResult,
} from "@/lib/registrations/decision-email"

const kind = z.enum(["accepted", "rejected"])

type ActionResult = ({ status: "success" } & SendResult) | { status: "error"; message: string }

async function run(
  input: unknown,
  send: typeof sendDecisionTest | typeof sendDecisionWave,
): Promise<ActionResult> {
  const { user } = await requireStaff({ permissions: { registration: ["review"] } })
  const parsed = kind.safeParse(input)
  if (!parsed.success) return { status: "error", message: "Unknown email." }
  try {
    const result = await send(parsed.data, { id: user.id, name: user.name, email: user.email })
    revalidatePath(adminRoutes.registrations, "layout")
    return { status: "success", ...result }
  } catch (error) {
    if (error instanceof DecisionEmailError) return { status: "error", message: error.message }
    console.error("Decision emails: sending failed", error)
    return { status: "error", message: "The emails could not be sent. Try again." }
  }
}

/** The decision email, sent to every HR member to check it. */
export async function testDecisionEmail(input: "accepted" | "rejected") {
  return run(input, sendDecisionTest)
}

/** The next wave of decision emails, within the daily limit. */
export async function sendDecisionEmailWave(input: "accepted" | "rejected") {
  return run(input, sendDecisionWave)
}
