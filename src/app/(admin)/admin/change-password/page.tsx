import type { Metadata } from "next"

import { AuthCard } from "@/components/admin/auth-card"
import { ChangePasswordForm } from "@/components/admin/change-password-form"
import { requireStaff } from "@/lib/auth/session"

export const metadata: Metadata = { title: "Change password" }

export default async function ChangePasswordPage() {
  const { user } = await requireStaff({ allowPendingPasswordChange: true })

  return (
    <AuthCard
      title="Change your password"
      description={
        user.mustChangePassword
          ? "Your password was generated for you: choose your own before going further."
          : "Your other devices will be signed out."
      }
    >
      <ChangePasswordForm />
    </AuthCard>
  )
}
