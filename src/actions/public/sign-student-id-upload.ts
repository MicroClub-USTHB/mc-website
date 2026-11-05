"use server"

import { headers } from "next/headers"

import { signStudentIdUpload, type StudentIdUploadSignature } from "@/lib/cloudinary"
import { clientIp, isRateLimited } from "@/lib/rate-limit"
import { areRegistrationsOpen } from "@/lib/registrations/window"

export type SignatureResult =
  | { status: "ok"; signature: StudentIdUploadSignature }
  | { status: "rate-limited" }
  | { status: "error" }

/** Per IP, loose: many students share one address (campus network, CGNAT), and retries re-sign. */
const RATE_LIMIT = { limit: 60, windowMs: 60 * 60 * 1000 }

/**
 * Hands the browser a signed, short-lived permission to upload one student ID to Cloudinary.
 * Each IP gets 60 per hour, so the signature cannot be used to fill the storage.
 */
export async function createStudentIdUploadSignature(): Promise<SignatureResult> {
  if (!areRegistrationsOpen()) return { status: "error" }
  const requestHeaders = await headers()
  const ip = clientIp(requestHeaders)
  if (await isRateLimited(`student-id-signature:${ip}`, RATE_LIMIT.limit, RATE_LIMIT.windowMs))
    return { status: "rate-limited" }

  try {
    return { status: "ok", signature: signStudentIdUpload() }
  } catch (error) {
    console.error("Registration: signing the student ID upload failed", error)
    return { status: "error" }
  }
}
