"use client"

import { BookmarkCheckIcon, BookmarkIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useTransition } from "react"

import { markReviewPlace } from "@/actions/admin/review-place"
import { useFeedbackModal } from "@/providers/feedback-modal-provider"
import { McButton } from "@/components/ui/mc-button"

/**
 * Marks this registration as where the member stopped, for the "Continue" banner of the list.
 * Reviewing or recommending marks it too; clicking a marked place clears it.
 */
export function MarkPlaceButton({
  registrationId,
  marked,
}: {
  registrationId: string
  marked: boolean
}) {
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()
  const { showError } = useFeedbackModal()

  function toggle() {
    startTransition(async () => {
      const result = await markReviewPlace(registrationId, searchParams.toString(), !marked)
      if (result.status === "error")
        showError({ title: "Your place could not be saved", description: "Try again." })
    })
  }

  return (
    <McButton
      variant="secondary"
      size="sm"
      icon="leading"
      iconDefinition={
        marked ? <BookmarkCheckIcon className="size-4" /> : <BookmarkIcon className="size-4" />
      }
      isLoading={pending}
      aria-pressed={marked}
      onClick={toggle}
      title={marked ? "Click to clear your place" : "Come back here from the registrations page"}
    >
      {marked ? "Your place" : "Mark my place"}
    </McButton>
  )
}
