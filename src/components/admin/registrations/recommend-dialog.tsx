"use client"

import { StarIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useState, useTransition, type FormEvent } from "react"

import { recommendRegistration, removeRecommendation } from "@/actions/admin/review-registration"
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
import {
  McSelect,
  McSelectContent,
  McSelectItem,
  McSelectLabel,
  McSelectTrigger,
  McSelectValue,
} from "@/components/ui/mc-select"
import { McTextarea } from "@/components/ui/mc-textarea"
import { cn } from "@/lib/utils"
import { RECOMMENDATION_TARGETS } from "@/lib/registrations/recommendations"
import { recommendationSchema } from "@/lib/registrations/review-schema"

const TARGET_ITEMS = RECOMMENDATION_TARGETS.map((target) => ({
  value: target.id,
  label: target.label,
}))

/**
 * Recommends an applicant to one section or department, with an optional note. An application has
 * one recommendation, the latest: once recommended, the same dialog shows who made it and lets any
 * HR member replace it (it becomes theirs) or remove it; the earlier ones stay in the timeline.
 */
export function RecommendDialog({
  registrationId,
  applicant,
  recommendation,
}: {
  registrationId: string
  applicant: string
  /** The application's recommendation, and who made it ("you" for the signed-in member). */
  recommendation?: { target: string; note: string; by: string }
}) {
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [target, setTarget] = useState<string | null>(recommendation?.target ?? null)
  const [note, setNote] = useState(recommendation?.note ?? "")
  const [message, setMessage] = useState<string>()
  const [saving, startSaving] = useTransition()
  const [removing, startRemoving] = useTransition()

  const changed = target !== recommendation?.target || note.trim() !== recommendation?.note

  function onOpenChange(next: boolean) {
    setOpen(next)
    setTarget(recommendation?.target ?? null)
    setNote(recommendation?.note ?? "")
    setMessage(undefined)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = recommendationSchema.safeParse({ target: target ?? "", note })
    if (!parsed.success) {
      setMessage(parsed.error.issues[0].message)
      return
    }

    startSaving(async () => {
      const result = await recommendRegistration(
        registrationId,
        parsed.data,
        searchParams.toString(),
      )
      if (result.status === "error") setMessage(result.message)
      else setOpen(false)
    })
  }

  function handleRemove() {
    startRemoving(async () => {
      const result = await removeRecommendation(registrationId)
      if (result.status === "error") setMessage(result.message)
      else setOpen(false)
    })
  }

  return (
    <McDialog open={open} onOpenChange={onOpenChange}>
      <McDialogTrigger
        render={
          <McButton
            variant="secondary"
            icon="leading"
            iconDefinition={<StarIcon className={cn("size-4", recommendation && "fill-current")} />}
          >
            {recommendation ? "Recommended" : "Recommend"}
          </McButton>
        }
      />
      <McDialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto wrap-anywhere sm:min-h-0">
        <McDialogHeader>
          <McDialogTitle>Recommend {applicant}</McDialogTitle>
          <McDialogDescription>
            {recommendation
              ? `Recommended by ${recommendation.by}. A new recommendation replaces it; the previous one stays in the timeline.`
              : "Choose where they would fit best. Mention anything else in the note."}
          </McDialogDescription>
        </McDialogHeader>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <McSelect
            items={TARGET_ITEMS}
            value={target}
            onValueChange={(value) => {
              setTarget(value)
              setMessage(undefined)
            }}
          >
            <McSelectLabel>Section or department</McSelectLabel>
            <McSelectTrigger className="w-full" aria-label="Section or department">
              <McSelectValue placeholder="Choose one" />
            </McSelectTrigger>
            {/* All 11 sections and departments, as far as the screen allows: past that, the list
                scrolls with a visible scrollbar (Lenis leaves it alone). */}
            <McSelectContent
              className="h-auto max-h-(--available-height) w-(--anchor-width)"
              alignItemWithTrigger={false}
              scrollbar
              data-lenis-prevent
            >
              {TARGET_ITEMS.map((item) => (
                <McSelectItem key={item.value} value={item.value}>
                  {item.label}
                </McSelectItem>
              ))}
            </McSelectContent>
          </McSelect>
          <McTextarea
            label="Note (optional)"
            name="note"
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <FormMessage>{message}</FormMessage>
          <McDialogFooter className="pb-0">
            {recommendation && (
              <McButton
                type="button"
                variant="secondary"
                destructive
                isLoading={removing}
                onClick={handleRemove}
              >
                Remove recommendation
              </McButton>
            )}
            {(!recommendation || changed) && (
              <McButton type="submit" isLoading={saving}>
                {recommendation ? "Save" : "Recommend"}
              </McButton>
            )}
          </McDialogFooter>
        </form>
      </McDialogContent>
    </McDialog>
  )
}
