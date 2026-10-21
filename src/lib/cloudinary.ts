import "server-only"

import { v2 as cloudinary, type UploadApiResponse } from "cloudinary"

const STUDENT_ID_FOLDER = "microclub/registrations/student-ids"

export type UploadedStudentId = {
  url: string
  publicId: string
  resourceType: string
  format?: string
  bytes: number
}

function configure() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret)
    throw new Error("CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET is missing")

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true })
}

/**
 * Uploads a student ID as an `authenticated` asset: it has no public URL, only the signed one
 * returned here, so IDs cannot be found by guessing links.
 */
export async function uploadStudentId(file: File): Promise<UploadedStudentId> {
  configure()
  const buffer = Buffer.from(await file.arrayBuffer())

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder: STUDENT_ID_FOLDER, type: "authenticated", resource_type: "auto" },
        (error, uploaded) => (uploaded ? resolve(uploaded) : reject(error)),
      )
      .end(buffer)
  })

  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
    format: result.format,
    bytes: result.bytes,
  }
}

/** Removes an uploaded student ID, used when the registration could not be saved. */
export async function deleteStudentId(
  upload: Pick<UploadedStudentId, "publicId" | "resourceType">,
) {
  configure()
  await cloudinary.uploader.destroy(upload.publicId, {
    type: "authenticated",
    resource_type: upload.resourceType,
  })
}
