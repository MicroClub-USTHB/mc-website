import { redirect } from "next/navigation"

import { homeFor, requireStaff } from "@/lib/auth/session"

/** Entry point of the admin area: sends each role to its page. */
export default async function AdminHomePage() {
  const { user } = await requireStaff()
  redirect(homeFor(user))
}
