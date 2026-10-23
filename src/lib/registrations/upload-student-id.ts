import type { StudentIdUploadSignature } from "@/lib/cloudinary"

/** Reference to a student ID already stored in Cloudinary, sent with the registration. */
export type StudentIdUpload = {
  publicId: string
  resourceType: string
}

/** Public ids the server accepts: a file in the student ID folder, no path tricks. */
export const STUDENT_ID_PUBLIC_ID = /^microclub\/registrations\/student-ids\/[\w-]+$/

/**
 * Uploads the student ID from the browser straight to Cloudinary, with a signature made by the
 * server (`signStudentIdUpload`). Throws with Cloudinary's message when the file is refused.
 */
export async function uploadStudentId(
  file: File,
  signed: StudentIdUploadSignature,
): Promise<StudentIdUpload> {
  const body = new FormData()
  body.set("file", file)
  body.set("api_key", signed.apiKey)
  body.set("timestamp", String(signed.timestamp))
  body.set("signature", signed.signature)
  body.set("folder", signed.folder)
  body.set("type", signed.type)
  body.set("allowed_formats", signed.allowedFormats)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/auto/upload`, {
    method: "POST",
    body,
  })
  const result = await response.json().catch(() => null)
  if (!response.ok || !result?.public_id)
    throw new Error(result?.error?.message ?? `Upload failed (${response.status})`)

  return { publicId: result.public_id, resourceType: result.resource_type }
}
