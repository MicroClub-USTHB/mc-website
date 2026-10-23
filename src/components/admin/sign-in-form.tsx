"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition, type FormEvent } from "react"

import { authErrorMessage } from "@/components/admin/auth-errors"
import { FormMessage } from "@/components/admin/form-message"
import { McButton } from "@/components/ui/mc-button"
import { McInput } from "@/components/ui/mc-input"
import { adminRoutes } from "@/config/admin"
import { authClient } from "@/lib/auth/client"

/**
 * Email and password sign-in through `/api/auth` (rate limited). The admin home then sends each
 * role to its page, or to the forced password change.
 */
export function SignInForm() {
  const router = useRouter()
  const [message, setMessage] = useState<string>()
  const [pending, startTransition] = useTransition()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(async () => {
      const { error } = await authClient.signIn.email({
        email: String(formData.get("email")),
        password: String(formData.get("password")),
      })
      if (error) {
        setMessage(authErrorMessage(error, "Invalid email or password."))
        return
      }
      router.replace(adminRoutes.home)
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <McInput label="Email" name="email" type="email" autoComplete="username" required />
      <McInput
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      <FormMessage>{message}</FormMessage>
      <McButton type="submit" size="lg" isLoading={pending}>
        Sign in
      </McButton>
      <Link
        href={adminRoutes.forgotPassword}
        className="self-center paragraph-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Forgot password?
      </Link>
    </form>
  )
}
