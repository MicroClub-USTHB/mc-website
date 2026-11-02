"use client"

import Link from "next/link"
import { useState, useTransition, type FormEvent } from "react"

import { authErrorMessage } from "@/components/admin/auth-errors"
import { FormMessage } from "@/components/admin/form-message"
import { McButton } from "@/components/ui/mc-button"
import { McInput } from "@/components/ui/mc-input"
import { adminRoutes } from "@/config/admin"
import { authClient } from "@/lib/auth/client"
import { fieldErrors, passwordPairSchema } from "@/lib/auth/schema"

type Field = "newPassword" | "confirmPassword"

/** Sets a new password from the emailed link. Signs out every device of the account. */
export function ResetPasswordForm({ token }: { token: string }) {
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [message, setMessage] = useState<string>()
  const [done, setDone] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const parsed = passwordPairSchema.safeParse({
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    })
    setErrors(parsed.success ? {} : fieldErrors<Field>(parsed.error))
    if (!parsed.success) return

    startTransition(async () => {
      const { error } = await authClient.resetPassword({
        newPassword: parsed.data.newPassword,
        token,
      })
      if (error) {
        setMessage(authErrorMessage(error, "This link is invalid or expired. Ask for a new one."))
        return
      }
      setDone(true)
    })
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4">
        <FormMessage tone="success">Your password was changed. You can now sign in.</FormMessage>
        <McButton size="lg" nativeButton={false} render={<Link href={adminRoutes.signIn} />}>
          Sign in
        </McButton>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <McInput
        label="New password"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        description="At least 12 characters."
        error={errors.newPassword}
        required
      />
      <McInput
        label="Confirm the new password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword}
        required
      />
      <FormMessage>{message}</FormMessage>
      <McButton type="submit" size="lg" isLoading={pending}>
        Change my password
      </McButton>
    </form>
  )
}
