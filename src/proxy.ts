import { getSessionCookie } from "better-auth/cookies"
import { NextResponse, type NextRequest } from "next/server"

import { adminRoutes, signedOutAdminRoutes } from "@/config/admin"

/**
 * Sends signed-out visitors of the admin area to sign in. Only checks that a session cookie exists
 * (no database call): every admin page and action still checks the session with `requireStaff()`.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (signedOutAdminRoutes.includes(pathname) || getSessionCookie(request)) {
    return NextResponse.next()
  }
  return NextResponse.redirect(new URL(adminRoutes.signIn, request.url))
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
}
