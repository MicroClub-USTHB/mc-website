import type { Metadata } from "next"
import Link from "next/link"

import { AuthCard } from "@/components/admin/auth-card"
import { ResetPasswordForm } from "@/components/admin/reset-password-form"
import { McButton } from "@/components/ui/mc-button"
import { adminRoutes } from "@/config/admin"

export const metadata: Metadata = { title: "Reset password" }

/** Opened from the emailed link: Better Auth checks the token and adds it (or `error`) to the URL. */
export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/admin/reset-password">) {
  const { token } = await searchParams

  if (typeof token !== "string" || !token) {
    return (
      <AuthCard
        title="Link expired"
        description="This link is invalid or expired: reset links work once, for 1 hour."
      >
        <McButton
          size="lg"
          nativeButton={false}
          render={<Link href={adminRoutes.forgotPassword} />}
        >
          Ask for a new link
        </McButton>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Choose a new password" description="You will be signed out of every device.">
      <ResetPasswordForm token={token} />
    </AuthCard>
  )
}
