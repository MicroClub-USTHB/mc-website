import "server-only"

import { v2 as cloudinary } from "cloudinary"

import { STUDENT_ID_RULES } from "@/const/registrations"

/** Cloudinary folder of the student IDs: every accepted upload must live here. */
export const STUDENT_ID_FOLDER = "microclub/registrations/student-ids"

export type UploadedStudentId = {
  url: string
  publicId: string
  resourceType: string
  format?: string
  bytes: number
}

/** What the browser needs to upload one student ID straight to Cloudinary. */
export type StudentIdUploadSignature = {
  cloudName: string
  apiKey: string
  timestamp: number
  signature: string
  folder: string
  type: "authenticated"
  allowedFormats: string
}

function configure() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret)
    throw new Error("CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET is missing")

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true })
  return { cloudName, apiKey, apiSecret }
}

/**
 * Signs an upload of a student ID, to be sent by the browser directly to Cloudinary: the file
 * never goes through this server, so no request body limit applies. The signature pins the folder,
 * the `authenticated` type (no public URL, only signed ones) and the accepted formats, which
 * Cloudinary checks on the file content, not on its name.
 */
export function signStudentIdUpload(): StudentIdUploadSignature {
  const { cloudName, apiKey, apiSecret } = configure()
  const params = {
    allowed_formats: STUDENT_ID_RULES.formats.join(","),
    folder: STUDENT_ID_FOLDER,
    timestamp: Math.round(Date.now() / 1000),
    type: "authenticated" as const,
  }

  return {
    cloudName,
    apiKey,
    timestamp: params.timestamp,
    signature: cloudinary.utils.api_sign_request(params, apiSecret),
    folder: params.folder,
    type: params.type,
    allowedFormats: params.allowed_formats,
  }
}

/**
 * Reads an uploaded student ID back from Cloudinary, so the size and format that get stored are
 * the real ones, not what the browser claims. `null` when there is no such upload.
 */
export async function getStudentIdUpload(
  publicId: string,
  resourceType: string,
): Promise<UploadedStudentId | null> {
  configure()
  try {
    const resource = await cloudinary.api.resource(publicId, {
      type: "authenticated",
      resource_type: resourceType,
    })
    return {
      url: resource.secure_url,
      publicId: resource.public_id,
      resourceType: resource.resource_type,
      format: resource.format,
      bytes: resource.bytes,
    }
  } catch (error) {
    if ((error as { error?: { http_code?: number } }).error?.http_code === 404) return null
    throw error
  }
}

/** Removes an uploaded student ID: a rejected registration must not leave its file behind. */
export async function deleteStudentId(
  upload: Pick<UploadedStudentId, "publicId" | "resourceType">,
) {
  configure()
  await cloudinary.uploader.destroy(upload.publicId, {
    type: "authenticated",
    resource_type: upload.resourceType,
  })
}
