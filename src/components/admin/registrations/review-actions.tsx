"use client"

import { useSearchParams } from "next/navigation"
import { useState, useTransition, type FormEvent } from "react"

import { reviewRegistration } from "@/actions/admin/review-registration"
import { FormMessage } from "@/components/admin/form-message"
import {
  InterviewScheduleFields,
  readSchedule,
  type Interviewer,
} from "@/components/admin/registrations/interview-schedule-fields"
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
import { interviewScheduleSchema, scheduleParts } from "@/lib/registrations/interview"
import { reviewSchema } from "@/lib/registrations/review-schema"
import type { ReviewState } from "@/lib/registrations/status"

type Action = { state: ReviewState; label: string; title: (applicant: string) => string }

const ACTIONS: Action[] = [
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

/** Shown instead of "To Interview" to a reviewer already asking for one: edits its details. */
const EDIT_QUESTIONS: Action = {
  state: "interview",
  label: "Edit interview details",
  title: (applicant) => `Interview with ${applicant}`,
}

/**
 * The review buttons, without the reviewer's own state, and their confirmation dialog. Asking for
 * an interview also takes the questions to ask in it, for whichever HR member hosts it.
 */
export function ReviewActions({
  registrationId,
  applicant,
  current,
  reasonRequired,
  questions = "",
  interviewers,
  interview,
}: {
  registrationId: string
  applicant: string
  /** The signed-in reviewer's own review. */
  current: ReviewState
  /** Only a person's first review of an application needs a reason. */
  reasonRequired: boolean
  /** The reviewer's interview questions, when their review is `interview`. */
  questions?: string
  /** HR members who can host the interview. */
  interviewers: Interviewer[]
  /** The registration's interview date and host, whoever set them. */
  interview: { at: string | null; endAt: string | null; interviewerId: string | null }
}) {
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  // Kept after closing, so the dialog does not change while it fades out.
  const [action, setAction] = useState(ACTIONS[0])
  const [reasonError, setReasonError] = useState<string>()
  const [questionsError, setQuestionsError] = useState<string>()
  const [scheduleError, setScheduleError] = useState<string>()
  const [message, setMessage] = useState<string>()
  const [pending, startTransition] = useTransition()

  function onOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setReasonError(undefined)
      setQuestionsError(undefined)
      setScheduleError(undefined)
      setMessage(undefined)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const parsed = reviewSchema.safeParse({
      state: action.state,
      reason: form.get("reason") ?? "",
      questions: form.get("questions") ?? "",
    })
    if (!parsed.success) {
      const errors = fieldErrors<"reason" | "questions">(parsed.error)
      setReasonError(errors.reason)
      setQuestionsError(errors.questions)
      return
    }
    setQuestionsError(undefined)
    if (reasonRequired && !parsed.data.reason) {
      setReasonError("Give the reason for your first review.")
      return
    }
    setReasonError(undefined)

    const schedule = interviewScheduleSchema.safeParse(readSchedule(form))
    if (action.state === "interview" && !schedule.success) {
      setScheduleError(schedule.error.issues[0]?.message)
      return
    }
    setScheduleError(undefined)
    // Editing the details without touching the questions only changes the schedule.
    const scheduleOnly = action === EDIT_QUESTIONS && parsed.data.questions === questions

    startTransition(async () => {
      const result = await reviewRegistration(
        registrationId,
        parsed.data,
        searchParams.toString(),
        action.state === "interview" && schedule.success
          ? { ...schedule.data, scheduleOnly }
          : undefined,
      )
      if (result.status === "error") setMessage(result.message)
      else onOpenChange(false)
    })
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {(current === "interview"
          ? [EDIT_QUESTIONS, ...ACTIONS.filter(({ state }) => state !== current)]
          : ACTIONS.filter(({ state }) => state !== current)
        ).map((item) => (
          <McButton
            key={item.label}
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
        <McDialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto wrap-anywhere sm:min-h-0">
          <McDialogHeader>
            <McDialogTitle>{action.title(applicant)}</McDialogTitle>
            <McDialogDescription>
              {action === EDIT_QUESTIONS
                ? "Every HR member sees them, and the interview shows on the calendar once it has a date."
                : action.state === "pending"
                  ? "This withdraws your review: your place goes to the next HR member who reviews."
                  : "Every HR member can see your review and its reason."}
            </McDialogDescription>
          </McDialogHeader>
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {action !== EDIT_QUESTIONS && (
              <McTextarea
                label={reasonRequired ? "Reason" : "Reason (optional)"}
                name="reason"
                rows={action.state === "interview" ? 3 : 4}
                error={reasonError}
                required={reasonRequired}
              />
            )}
            {action.state === "interview" && (
              <McTextarea
                label="Questions to ask (optional)"
                name="questions"
                rows={4}
                defaultValue={questions}
                placeholder={"One per line, e.g.\nWhich project are you proudest of?"}
                description="Shown to every HR member, for whoever hosts the interview."
                error={questionsError}
              />
            )}
            {action.state === "interview" && (
              <InterviewScheduleFields
                interviewers={interviewers}
                defaultSchedule={scheduleParts(interview.at, interview.endAt)}
                defaultInterviewerId={interview.interviewerId ?? ""}
                error={scheduleError}
              />
            )}
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
