"use client"

import { useState, useTransition, type FormEvent } from "react"

import { reviewRegistration } from "@/actions/review-registration"
import { FormMessage } from "@/components/admin/form-message"
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
import { fieldErrors } from "@/lib/auth/schema"
import { reviewSchema } from "@/lib/registrations/review-schema"
import type { ReviewState } from "@/lib/registrations/status"

const ACTIONS: { state: ReviewState; label: string; title: (applicant: string) => string }[] = [
  {
    state: "interview",
    label: "To Interview",
    title: (applicant) => `Move ${applicant} to interview?`,
  },
  { state: "accepted", label: "Accept", title: (applicant) => `Accept ${applicant}?` },
  { state: "rejected", label: "Reject", title: (applicant) => `Reject ${applicant}?` },
  {
    state: "pending",
    label: "Pending",
    title: (applicant) => `Move ${applicant} back to pending?`,
  },
]

/** The review buttons, without the reviewer's own state, and their confirmation dialog. */
export function ReviewActions({
  registrationId,
  applicant,
  current,
  reasonRequired,
}: {
  registrationId: string
  applicant: string
  /** The signed-in reviewer's own review. */
  current: ReviewState
  /** Only a person's first review of an application needs a reason. */
  reasonRequired: boolean
}) {
  const [open, setOpen] = useState(false)
  // Kept after closing, so the dialog does not change while it fades out.
  const [action, setAction] = useState(ACTIONS[0])
  const [reasonError, setReasonError] = useState<string>()
  const [message, setMessage] = useState<string>()
  const [pending, startTransition] = useTransition()

  function onOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setReasonError(undefined)
      setMessage(undefined)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = reviewSchema.safeParse({
      state: action.state,
      reason: new FormData(event.currentTarget).get("reason"),
    })
    if (!parsed.success) {
      setReasonError(fieldErrors<"reason">(parsed.error).reason)
      return
    }
    if (reasonRequired && !parsed.data.reason) {
      setReasonError("Give the reason for your first review.")
      return
    }
    setReasonError(undefined)

    startTransition(async () => {
      const result = await reviewRegistration(registrationId, parsed.data)
      if (result.status === "error") setMessage(result.message)
      else onOpenChange(false)
    })
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {ACTIONS.filter(({ state }) => state !== current).map((item) => (
          <McButton
            key={item.state}
            variant={item.state === "accepted" ? "primary" : "secondary"}
            destructive={item.state === "rejected"}
            onClick={() => {
              setAction(item)
              onOpenChange(true)
            }}
          >
            {item.label}
          </McButton>
        ))}
      </div>

      <McDialog open={open} onOpenChange={onOpenChange}>
        <McDialogContent className="sm:min-h-0">
          <McDialogHeader>
            <McDialogTitle>{action.title(applicant)}</McDialogTitle>
            <McDialogDescription>
              {action.state === "pending"
                ? "This withdraws your review: your place goes to the next HR member who reviews."
                : "Every HR member can see your review and its reason."}
            </McDialogDescription>
          </McDialogHeader>
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <McTextarea
              label={reasonRequired ? "Reason" : "Reason (optional)"}
              name="reason"
              rows={4}
              error={reasonError}
              required={reasonRequired}
            />
            <FormMessage>{message}</FormMessage>
            <McDialogFooter className="pb-0">
              <McButton type="submit" isLoading={pending}>
                Confirm
              </McButton>
            </McDialogFooter>
          </form>
        </McDialogContent>
      </McDialog>
    </>
  )
}
