"use client"

import { useActionState } from "react"

import { changePassword, type ChangePasswordState } from "@/actions/change-password"
import { FormMessage } from "@/components/admin/form-message"
import { McButton } from "@/components/ui/mc-button"
import { McInput } from "@/components/ui/mc-input"

const INITIAL_STATE: ChangePasswordState = {}

/** Current password, then the new one twice. On success the action opens the user's home page. */
export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, INITIAL_STATE)
  const errors = state.errors ?? {}

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <McInput
        label="Current password"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        error={errors.currentPassword}
        required
      />
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
      <FormMessage>{state.message}</FormMessage>
      <McButton type="submit" size="lg" isLoading={pending}>
        Change my password
      </McButton>
    </form>
  )
}
