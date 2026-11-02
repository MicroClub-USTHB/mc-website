import type { Metadata } from "next"

import { AuthCard } from "@/components/admin/auth-card"
import { ForgotPasswordForm } from "@/components/admin/forgot-password-form"

export const metadata: Metadata = { title: "Forgot password" }

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot your password?"
      description="Enter the email of your account: we will send you a link to choose a new password."
    >
      <ForgotPasswordForm />
    </AuthCard>
  )
}
