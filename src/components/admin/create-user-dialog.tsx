"use client"

import { UserPlusIcon } from "lucide-react"
import { useState, useTransition, type FormEvent } from "react"

import { createHrUser } from "@/actions/manage-hr-users"
import { FormMessage } from "@/components/admin/form-message"
import { McButton } from "@/components/ui/mc-button"
import {
  McDialog,
  McDialogContent,
  McDialogDescription,
  McDialogFooter,
  McDialogHeader,
  McDialogTitle,
  McDialogTrigger,
} from "@/components/ui/mc-dialog"
import { McInput } from "@/components/ui/mc-input"
import { fieldErrors, hrUserSchema, type HrUserInput } from "@/lib/auth/schema"
import { useFeedbackModal } from "@/providers/feedback-modal-provider"

type Errors = Partial<Record<keyof HrUserInput, string>>

/** Name and email of a new HR member; the password is generated and emailed by the server. */
export function CreateUserDialog() {
  const [open, setOpen] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [message, setMessage] = useState<string>()
  const [pending, startTransition] = useTransition()
  const { showSuccess, showWarning } = useFeedbackModal()

  function onOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setErrors({})
      setMessage(undefined)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const parsed = hrUserSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
    })
    setErrors(parsed.success ? {} : fieldErrors<keyof HrUserInput>(parsed.error))
    if (!parsed.success) return

    startTransition(async () => {
      const result = await createHrUser(parsed.data)
      if (result.status === "error") {
        setErrors(result.errors ?? {})
        setMessage(result.errors ? undefined : result.message)
        return
      }
      onOpenChange(false)
      if (result.status === "success") {
        showSuccess({ title: "Account created", description: result.message, actionLabel: "Done" })
      } else {
        showWarning({ title: "Email not sent", description: result.message, actionLabel: "Done" })
      }
    })
  }

  return (
    <McDialog open={open} onOpenChange={onOpenChange}>
      <McDialogTrigger
        render={
          <McButton icon="leading" iconDefinition={<UserPlusIcon className="size-4" />}>
            Create an account
          </McButton>
        }
      />
      <McDialogContent className="sm:min-h-0">
        <McDialogHeader>
          <McDialogTitle>New HR member</McDialogTitle>
          <McDialogDescription>
            They will receive a generated password by email, to change at first sign-in.
          </McDialogDescription>
        </McDialogHeader>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <McInput label="Full name" name="name" autoComplete="off" error={errors.name} required />
          <McInput
            label="Email"
            name="email"
            type="email"
            autoComplete="off"
            error={errors.email}
            required
          />
          <FormMessage>{message}</FormMessage>
          <McDialogFooter className="pb-0">
            <McButton type="submit" isLoading={pending}>
              Create and send
            </McButton>
          </McDialogFooter>
        </form>
      </McDialogContent>
    </McDialog>
  )
}
