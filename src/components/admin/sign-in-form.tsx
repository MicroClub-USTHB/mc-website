"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useForm } from "react-hook-form"

import { FormMessage } from "@/components/admin/form-message"
import { McButton } from "@/components/ui/mc-button"
import { McInput, McInputButton } from "@/components/ui/mc-input"
import { adminRoutes } from "@/config/admin"
import { authClient } from "@/lib/auth/client"
import { signInSchema, type SignInInput } from "@/lib/auth/schema"

/** A failed sign-in, told apart so the visitor knows what to fix (or that nothing is to fix). */
function signInError(
  error: { status: number; code?: string | undefined; message?: string | undefined },
  retryAfter: number | null,
) {
  if (error.status === 429) {
    const wait = retryAfter ? `${retryAfter} second${retryAfter === 1 ? "" : "s"}` : "a minute"
    return { message: `Too many attempts. Try again in ${wait}.`, credentials: false }
  }
  if (error.code === "INVALID_EMAIL_OR_PASSWORD" || error.status === 401) {
    return {
      message: "The email or the password is incorrect. Check both, then try again.",
      credentials: true,
    }
  }
  // Deactivated account (the admin plugin's `bannedUserMessage`) and anything else the server says.
  return {
    message: error.message || "Sign-in failed. Try again in a moment.",
    credentials: false,
  }
}

/**
 * Email and password sign-in through `/api/auth` (rate limited). The admin home then sends each
 * role to its page, or to the forced password change.
 *
 * React Hook Form with the shared Zod schema (`signInSchema`): a field is checked once left, then
 * again as it is typed in, each error under its own field (and the first invalid one focused on
 * submit). The server's answers are told apart: wrong credentials mark both fields, keep the email
 * and empty the password; a rate limit says how long to wait; a deactivated account and a network
 * failure say so. The password can be shown, and a Caps Lock left on is pointed out.
 */
export function SignInForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [capsLock, setCapsLock] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    resetField,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = handleSubmit(async (values) => {
    let retryAfter: number | null = null
    try {
      const { error } = await authClient.signIn.email(values, {
        onError: ({ response }) => {
          retryAfter = Number(response.headers.get("X-Retry-After")) || null
        },
      })
      if (!error) {
        router.replace(adminRoutes.home)
        router.refresh()
        return
      }
      const { message, credentials } = signInError(error, retryAfter)
      if (credentials) {
        // Both fields marked (which one is wrong is not told), the password typed again.
        setError("email", { type: "server", message: undefined })
        resetField("password", { keepError: true })
        setError("password", { type: "server", message: undefined })
        setFocus("password")
      }
      setError("root.server", { type: "server", message })
    } catch {
      setError("root.server", {
        type: "network",
        message: "The server could not be reached. Check your connection and try again.",
      })
    }
  })

  /** Typing again clears the server's verdict: it was about the previous attempt. */
  const clearServerError = () => {
    if (!errors.root?.server) return
    clearErrors("root.server")
    clearErrors(["email", "password"])
  }

  const trackCapsLock = (event: React.KeyboardEvent<HTMLInputElement>) =>
    setCapsLock(event.getModifierState("CapsLock"))

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <McInput
        label="Email"
        type="email"
        inputMode="email"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        required
        error={errors.email?.message ?? !!errors.email}
        {...register("email", { onChange: clearServerError })}
      />
      <McInput
        label="Password"
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        required
        error={errors.password?.message ?? !!errors.password}
        description={capsLock ? "Caps Lock is on." : undefined}
        onKeyDown={trackCapsLock}
        onKeyUp={trackCapsLock}
        addonEnd={
          <McInputButton
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((shown) => !shown)}
          >
            {showPassword ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
          </McInputButton>
        }
        {...register("password", { onChange: clearServerError })}
      />
      <FormMessage>{errors.root?.server?.message}</FormMessage>
      <McButton type="submit" size="lg" isLoading={isSubmitting}>
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
