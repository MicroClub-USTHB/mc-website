"use server"

import { revalidatePath } from "next/cache"

import { adminRoutes } from "@/config/admin"
import { requireStaff } from "@/lib/auth/session"
import {
  sendAcceptanceEmails,
  sendAcceptanceTest,
  type SendResult,
} from "@/lib/registrations/acceptance-email"

type ActionResult = ({ status: "success" } & SendResult) | { status: "error"; message: string }

async function run(send: typeof sendAcceptanceTest): Promise<ActionResult> {
  const { user } = await requireStaff({ permissions: { registration: ["review"] } })
  try {
    const result = await send({ id: user.id, name: user.name, email: user.email })
    revalidatePath(adminRoutes.registrations)
    return { status: "success", ...result }
  } catch (error) {
    console.error("Acceptance emails: sending failed", error)
    return { status: "error", message: "The emails could not be sent. Try again." }
  }
}

/** The acceptance email, sent to every HR member to check it. */
export async function testAcceptanceEmail() {
  return run(sendAcceptanceTest)
}

/** The acceptance email, sent to every accepted registration that did not get it yet. */
export async function sendAcceptances() {
  return run(sendAcceptanceEmails)
}
