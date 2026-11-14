"use client"

import { CheckIcon, GavelIcon, XIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useState, useTransition, type FormEvent } from "react"

import { decideRegistration } from "@/actions/admin/review-registration"
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
import type { FinalDecision } from "@/lib/registrations/timeline"
import { cn } from "@/lib/utils"

const CHOICES: { state: FinalDecision; label: string; hint: string; icon: React.ReactNode }[] = [
  {
    state: "accepted",
    label: "Accepted",
    hint: "Joins the club: gets the acceptance email.",
    icon: <CheckIcon className="size-5" aria-hidden />,
  },
  {
    state: "rejected",
    label: "Refused",
    hint: "Does not join this time: gets the refusal email.",
    icon: <XIcon className="size-5" aria-hidden />,
  },
]

/**
 * "Final decision", after the interview: any HR member picks accepted or refused, which becomes
 * the registration's status whatever the reviews say. While its email is not sent, it can change.
 */
export function FinalDecisionDialog({
  registrationId,
  applicant,
  current,
}: {
  registrationId: string
  applicant: string
  /** The final decision already made, to change it. */
  current?: { state: FinalDecision; note: string; by: string }
}) {
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [choice, setChoice] = useState<FinalDecision | undefined>(current?.state)
  const [message, setMessage] = useState<string>()
  const [pending, startTransition] = useTransition()

  function onOpenChange(next: boolean) {
    setOpen(next)
    if (next) setChoice(current?.state)
    else setMessage(undefined)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!choice) {
      setMessage("Choose accepted or refused.")
      return
    }
    const note = String(new FormData(event.currentTarget).get("note") ?? "")
    startTransition(async () => {
      const result = await decideRegistration(
        registrationId,
        { state: choice, note },
        searchParams.toString(),
      )
      if (result.status === "error") setMessage(result.message)
      else onOpenChange(false)
    })
  }

  return (
    <>
      <McButton
        variant={current ? "secondary" : "primary"}
        icon="leading"
        iconDefinition={<GavelIcon className="size-4" />}
        onClick={() => onOpenChange(true)}
      >
        {current ? "Change final decision" : "Final decision"}
      </McButton>

      <McDialog open={open} onOpenChange={onOpenChange}>
        <McDialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto wrap-anywhere sm:min-h-0">
          <McDialogHeader>
            <McDialogTitle>Final decision for {applicant}</McDialogTitle>
            <McDialogDescription>
              {current
                ? `${current.by} decided "${current.state === "accepted" ? "Accepted" : "Refused"}". A new choice replaces it, until the decision email is sent.`
                : "After the interview: this becomes the registration's status, whatever the reviews say. Every HR member sees it in the timeline."}
            </McDialogDescription>
          </McDialogHeader>
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div
              role="radiogroup"
              aria-label="Final decision"
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              {CHOICES.map((item) => {
                const selected = choice === item.state
                return (
                  <button
                    key={item.state}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => {
                      setChoice(item.state)
                      setMessage(undefined)
                    }}
                    className={cn(
                      "flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors outline-none focus-visible:ring-4 focus-visible:ring-ring",
                      selected
                        ? item.state === "accepted"
                          ? "border-success bg-success/10"
                          : "border-destructive bg-destructive/10"
                        : "border-border hover:bg-secondary/60",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-9 place-items-center rounded-full",
                        item.state === "accepted"
                          ? "bg-success/15 text-success"
                          : "bg-destructive/10 text-destructive",
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="paragraph-md font-medium text-foreground">{item.label}</span>
                    <span className="paragraph-sm text-muted-foreground">{item.hint}</span>
                  </button>
                )
              })}
            </div>
            <McTextarea
              label="Note for the team (optional)"
              name="note"
              rows={3}
              defaultValue={current?.note}
              placeholder="How the interview went, what decided it…"
            />
            <FormMessage>{message}</FormMessage>
            <McDialogFooter className="pb-0">
              <McButton type="submit" isLoading={pending} disabled={!choice}>
                Confirm
              </McButton>
            </McDialogFooter>
          </form>
        </McDialogContent>
      </McDialog>
    </>
  )
}
