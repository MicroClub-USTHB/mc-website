import type { NextRequest } from "next/server"

import { hasPermission } from "@/lib/auth/permissions"
import { getSession } from "@/lib/auth/session"
import { downloadStudentId } from "@/lib/cloudinary"
import { getRegistration } from "@/lib/registrations/review"

function text(status: number, message: string) {
  return new Response(message, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  })
}

/**
 * The applicant's student ID, streamed from Cloudinary to signed-in HR members only: the file is
 * an identity document, so no Cloudinary URL reaches the browser and nothing is cached.
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext<"/admin/registrations/[id]/student-id">,
) {
  const session = await getSession()
  if (!session || session.user.mustChangePassword) return text(401, "Sign in to view this file.")
  if (!hasPermission(session.user.role, { registration: ["review"] })) {
    return text(403, "You cannot view this file.")
  }

  const { id } = await context.params
  const registration = await getRegistration(id)
  if (!registration?.studentId) return text(404, "File unavailable.")

  try {
    const file = await downloadStudentId(registration.studentId)
    if (!file) return text(404, "File unavailable.")
    return new Response(file.body, {
      headers: {
        "Content-Type": file.contentType,
        "Content-Disposition": "inline",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    console.error("Student ID download failed", error)
    return text(502, "File unavailable.")
  }
}
