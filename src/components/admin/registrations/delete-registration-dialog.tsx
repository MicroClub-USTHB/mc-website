"use client"

import { Trash2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition, type FormEvent } from "react"

import { deleteRegistration } from "@/actions/admin/review-registration"
import { McButton } from "@/components/ui/mc-button"
import {
  McDialog,
  McDialogContent,
  McDialogDescription,
  McDialogFooter,
  McDialogHeader,
  McDialogTitle,
} from "@/components/ui/mc-dialog"
import { McTextarea } from "@/components/ui/mc-textarea"

/**
 * Soft deletes a registration (a double, a mistake), with a required reason, then goes back to
 * the list it was opened from. It disappears from every list, count, calendar and email.
 */
export function DeleteRegistrationDialog({
  registrationId,
  applicant,
  back,
}: {
  registrationId: string
  applicant: string
  /** The list to return to once deleted. */
  back: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string>()
  const [pending, startTransition] = useTransition()

  function onOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setError(undefined)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const reason = String(new FormData(event.currentTarget).get("reason") ?? "").trim()
    if (!reason) {
      setError("Say why it is deleted (e.g. a double of another registration).")
      return
    }
    startTransition(async () => {
      const result = await deleteRegistration(registrationId, reason)
      if (result.status === "error") {
        setError(result.message)
        return
      }
      setOpen(false)
      router.push(back)
    })
  }

  return (
    <>
      <McButton
        variant="tertiary"
        size="sm"
        destructive
        icon="leading"
        iconDefinition={<Trash2Icon className="size-4" />}
        onClick={() => onOpenChange(true)}
      >
        Delete registration
      </McButton>

      <McDialog open={open} onOpenChange={onOpenChange}>
        <McDialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto wrap-anywhere sm:min-h-0">
          <McDialogHeader>
            <McDialogTitle>Delete {applicant}&apos;s registration?</McDialogTitle>
            <McDialogDescription>
              For a double or a mistake. It disappears from every list, count, calendar and email,
              and nobody can review, decide or email it anymore. Its page stays readable from a
              direct link, with your reason.
            </McDialogDescription>
          </McDialogHeader>
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <McTextarea
              label="Reason"
              name="reason"
              rows={3}
              required
              autoFocus
              placeholder="Double of another registration (same name and phone)…"
              error={error}
            />
            <McDialogFooter className="pb-0">
              <McButton variant="secondary" onClick={() => onOpenChange(false)} disabled={pending}>
                Cancel
              </McButton>
              <McButton type="submit" destructive isLoading={pending}>
                Delete it
              </McButton>
            </McDialogFooter>
          </form>
        </McDialogContent>
      </McDialog>
    </>
  )
}
