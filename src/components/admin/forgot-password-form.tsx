"use client"

import { useState, useTransition, type FormEvent } from "react"

import { authErrorMessage } from "@/components/admin/auth-errors"
import { FormMessage } from "@/components/admin/form-message"
import { McButton } from "@/components/ui/mc-button"
import { McInput } from "@/components/ui/mc-input"
import { adminRoutes } from "@/config/admin"
import { authClient } from "@/lib/auth/client"

/** Asks for a reset link. Same answer whether the account exists or not. */
export function ForgotPasswordForm() {
  const [result, setResult] = useState<{ tone: "error" | "success"; text: string }>()
  const [pending, startTransition] = useTransition()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = String(new FormData(event.currentTarget).get("email"))
    startTransition(async () => {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: adminRoutes.resetPassword,
      })
      setResult(
        error
          ? { tone: "error", text: authErrorMessage(error, "The link could not be sent.") }
          : {
              tone: "success",
              text: "If an account uses this email, a link to choose a new password is on its way. It expires in 1 hour.",
            },
      )
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <McInput label="Email" name="email" type="email" autoComplete="username" required />
      <FormMessage tone={result?.tone}>{result?.text}</FormMessage>
      <McButton type="submit" size="lg" isLoading={pending}>
        Send the link
      </McButton>
    </form>
  )
}
