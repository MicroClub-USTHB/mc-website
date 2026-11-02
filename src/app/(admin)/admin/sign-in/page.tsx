import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { AuthCard } from "@/components/admin/auth-card"
import { SignInForm } from "@/components/admin/sign-in-form"
import { getSession, homeFor } from "@/lib/auth/session"

export const metadata: Metadata = { title: "Sign in" }

export default async function SignInPage() {
  const session = await getSession()
  if (session) redirect(homeFor(session.user))

  return (
    <AuthCard title="Sign in" description="Admin area of the Micro Club staff.">
      <SignInForm />
    </AuthCard>
  )
}
