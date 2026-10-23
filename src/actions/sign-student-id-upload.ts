"use server"

import { headers } from "next/headers"

import { signStudentIdUpload, type StudentIdUploadSignature } from "@/lib/cloudinary"
import { isRateLimited } from "@/lib/rate-limit"
import { areRegistrationsOpen } from "@/lib/registrations/window"

export type SignatureResult =
  | { status: "ok"; signature: StudentIdUploadSignature }
  | { status: "rate-limited" }
  | { status: "error" }

const RATE_LIMIT = { limit: 10, windowMs: 60 * 60 * 1000 }

/**
 * Hands the browser a signed, short-lived permission to upload one student ID to Cloudinary.
 * Each IP gets 10 per hour, so the signature cannot be used to fill the storage.
 */
export async function createStudentIdUploadSignature(): Promise<SignatureResult> {
  if (!areRegistrationsOpen()) return { status: "error" }
  const requestHeaders = await headers()
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (isRateLimited(`student-id-signature:${ip}`, RATE_LIMIT.limit, RATE_LIMIT.windowMs))
    return { status: "rate-limited" }

  try {
    return { status: "ok", signature: signStudentIdUpload() }
  } catch (error) {
    console.error("Registration: signing the student ID upload failed", error)
    return { status: "error" }
  }
}
