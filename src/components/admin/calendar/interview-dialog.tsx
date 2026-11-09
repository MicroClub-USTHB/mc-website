"use client"

import Link from "next/link"
import { useState, useTransition, type FormEvent } from "react"
import { ArrowUpRightIcon } from "lucide-react"

import { scheduleInterview } from "@/actions/admin/review-registration"
import { FormMessage } from "@/components/admin/form-message"
import {
  InterviewScheduleFields,
  type Interviewer,
} from "@/components/admin/registrations/interview-schedule-fields"
import { StatusBadge } from "@/components/admin/registrations/status-badge"
import { McButton } from "@/components/ui/mc-button"
import {
  McDialog,
  McDialogContent,
  McDialogDescription,
  McDialogFooter,
  McDialogHeader,
  McDialogTitle,
} from "@/components/ui/mc-dialog"
import {
  McSelect,
  McSelectContent,
  McSelectItem,
  McSelectLabel,
  McSelectTrigger,
  McSelectValue,
} from "@/components/ui/mc-select"
import { registrationRoute } from "@/config/admin"
import { formatClubTime } from "@/lib/dates"
import type { CalendarInterview } from "@/lib/registrations/interview-store"
import { interviewScheduleSchema, toDateTimeInput } from "@/lib/registrations/interview"

/** What the dialog edits: one interview, or a free slot to give to a registration waiting for a date. */
export type InterviewDialogTarget =
  { kind: "interview"; item: CalendarInterview } | { kind: "slot"; at: Date }

/**
 * Edits an interview's date and host from the calendar. On a free slot it first asks which
 * registration waiting for a date takes it.
 */
export function InterviewDialog({
  target,
  onClose,
  interviewers,
  unscheduled,
}: {
  target: InterviewDialogTarget | null
  onClose: () => void
  interviewers: Interviewer[]
  /** Registrations in interview without a date, for a free slot. */
  unscheduled: CalendarInterview[]
}) {
  // Kept while the dialog fades out.
  const [shown, setShown] = useState(target)
  if (target && target !== shown) setShown(target)

  const [chosenId, setChosenId] = useState("")
  const [error, setError] = useState<string>()
  const [message, setMessage] = useState<string>()
  const [pending, startTransition] = useTransition()

  const item =
    shown?.kind === "interview"
      ? shown.item
      : unscheduled.find((entry) => entry.registrationId === chosenId)
  const defaultAt = shown?.kind === "slot" ? toDateTimeInput(shown.at) : toDateTimeInput(item?.at)

  function close() {
    onClose()
    setChosenId("")
    setError(undefined)
    setMessage(undefined)
  }

  function submit(formElement: HTMLFormElement, clear = false) {
    if (!item) {
      setMessage("Choose who to interview.")
      return
    }
    const form = new FormData(formElement)
    const parsed = interviewScheduleSchema.safeParse({
      at: clear ? "" : (form.get("interviewAt") ?? ""),
      interviewerId: form.get("interviewerId") ?? "",
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message)
      return
    }
    setError(undefined)
    startTransition(async () => {
      const result = await scheduleInterview(item.registrationId, parsed.data)
      if (result.status === "error") setMessage(result.message)
      else close()
    })
  }

  const items = unscheduled.map((entry) => ({ value: entry.registrationId, label: entry.name }))

  return (
    <McDialog open={target !== null} onOpenChange={(open) => !open && close()}>
      <McDialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto wrap-anywhere sm:min-h-0">
        <McDialogHeader>
          <McDialogTitle>
            {shown?.kind === "slot"
              ? `Interview on ${formatClubTime(shown.at, "EEE d MMM 'at' HH:mm")}`
              : `Interview with ${item?.name ?? ""}`}
          </McDialogTitle>
          <McDialogDescription>
            {item?.updatedByName && item.updatedAt
              ? `Last changed by ${item.updatedByName} on ${formatClubTime(item.updatedAt, "d MMM 'at' HH:mm")}.`
              : "Every HR member sees the calendar and can change it."}
          </McDialogDescription>
        </McDialogHeader>

        <form
          key={`${shown?.kind}-${item?.registrationId ?? "none"}`}
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            submit(event.currentTarget)
          }}
          noValidate
          className="flex flex-col gap-4"
        >
          {shown?.kind === "slot" &&
            (items.length > 0 ? (
              <McSelect
                items={items}
                value={chosenId}
                onValueChange={(value) => {
                  setChosenId(String(value ?? ""))
                  setMessage(undefined)
                }}
              >
                <McSelectLabel>Applicant waiting for a date</McSelectLabel>
                <McSelectTrigger className="w-full" aria-label="Applicant">
                  <McSelectValue placeholder="Choose one" />
                </McSelectTrigger>
                <McSelectContent
                  className="h-auto max-h-(--available-height) w-(--anchor-width)"
                  alignItemWithTrigger={false}
                  scrollbar
                  data-lenis-prevent
                >
                  {items.map((entry) => (
                    <McSelectItem key={entry.value} value={entry.value}>
                      {entry.label}
                    </McSelectItem>
                  ))}
                </McSelectContent>
              </McSelect>
            ) : (
              <p className="paragraph-sm text-muted-foreground">
                Every applicant in interview already has a date. Move an interview by dragging it,
                or open it to change its date.
              </p>
            ))}

          {item && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate paragraph-md font-medium text-foreground">
                  {item.name}
                </span>
                <StatusBadge status={item.status} />
              </div>
              <Link
                href={registrationRoute(item.registrationId)}
                className="inline-flex items-center gap-1 rounded-sm paragraph-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-4 focus-visible:ring-ring"
              >
                Open application
                <ArrowUpRightIcon className="size-4" aria-hidden />
              </Link>
            </div>
          )}

          {(item || shown?.kind === "interview") && (
            <InterviewScheduleFields
              interviewers={interviewers}
              defaultAt={defaultAt}
              defaultInterviewerId={item?.interviewerId ?? ""}
              error={error}
            />
          )}

          <FormMessage>{message}</FormMessage>
          <McDialogFooter className="flex-row flex-wrap justify-end gap-2 pb-0">
            {shown?.kind === "interview" && item?.at && (
              <McButton
                type="button"
                variant="secondary"
                disabled={pending}
                onClick={(event) => {
                  const form = event.currentTarget.form
                  if (form) submit(form, true)
                }}
              >
                Remove date
              </McButton>
            )}
            <McButton type="submit" isLoading={pending} disabled={!item}>
              Save
            </McButton>
          </McDialogFooter>
        </form>
      </McDialogContent>
    </McDialog>
  )
}
