"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  useState,
  useSyncExternalStore,
  useTransition,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react"

import { reviewRegistration } from "@/actions/admin/review-registration"
import { FormMessage } from "@/components/admin/form-message"
import {
  InterviewScheduleFields,
  readSchedule,
  type Interviewer,
} from "@/components/admin/registrations/interview-schedule-fields"
import { Keys } from "@/components/admin/shortcuts/kbd"
import { useShortcut } from "@/components/admin/shortcuts/use-shortcut"
import { McButton } from "@/components/ui/mc-button"
import { McCheckbox } from "@/components/ui/mc-checkbox"
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

/** Ctrl + letter opening each review, with the Control key on every platform. */
const SHORTCUTS: Partial<Record<ReviewState, string>> = {
  accepted: "a",
  rejected: "r",
  interview: "i",
}

/** Enter confirms the reason; Shift+Enter still adds a line. */
function submitOnEnter(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
  if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return
  if (event.ctrlKey || event.metaKey) return // Handled by the form.
  event.preventDefault()
  event.currentTarget.form?.requestSubmit()
}

/** Ctrl+Enter (or Cmd+Enter) confirms from any field of the dialog. */
function submitOnCtrlEnter(event: ReactKeyboardEvent<HTMLFormElement>) {
  if (event.key !== "Enter" || !(event.ctrlKey || event.metaKey)) return
  if (event.nativeEvent.isComposing) return
  event.preventDefault()
  event.currentTarget.requestSubmit()
}

/** Browser storage key: `"off"` when this browser stays on a registration after a review. */
const ADVANCE_KEY = "mc-review-advance"
const advanceListeners = new Set<() => void>()

function advanceEnabled() {
  try {
    return window.localStorage.getItem(ADVANCE_KEY) !== "off"
  } catch {
    return true
  }
}

function subscribeAdvance(listener: () => void) {
  advanceListeners.add(listener)
  return () => advanceListeners.delete(listener)
}

function setAdvance(enabled: boolean) {
  try {
    window.localStorage.setItem(ADVANCE_KEY, enabled ? "on" : "off")
  } catch {
    // Without storage the choice lasts until the page reloads.
  }
  advanceListeners.forEach((listener) => listener())
}

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
 * an interview also takes the questions to ask in it, for whichever HR member hosts it. Ctrl+A,
 * Ctrl+R and Ctrl+I open them; once confirmed, the next registration of the list opens unless
 * the reviewer turned that off.
 */
export function ReviewActions({
  registrationId,
  applicant,
  current,
  reasonRequired,
  questions = "",
  interviewers,
  interview,
  next,
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
  /** The next registration of the list it was opened from, opened after a review. */
  next: { href: string; name: string } | null
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  // On the server and before hydration it follows the default: on.
  const advance = useSyncExternalStore(subscribeAdvance, advanceEnabled, () => true)
  const [open, setOpen] = useState(false)
  // Kept after closing, so the dialog does not change while it fades out.
  const [action, setAction] = useState(ACTIONS[0])
  const [reasonError, setReasonError] = useState<string>()
  const [questionsError, setQuestionsError] = useState<string>()
  const [scheduleError, setScheduleError] = useState<string>()
  const [message, setMessage] = useState<string>()
  const [pending, startTransition] = useTransition()

  function onOpenChange(isOpen: boolean) {
    setOpen(isOpen)
    if (!isOpen) {
      setReasonError(undefined)
      setQuestionsError(undefined)
      setScheduleError(undefined)
      setMessage(undefined)
    }
  }

  const actions =
    current === "interview"
      ? [EDIT_QUESTIONS, ...ACTIONS.filter(({ state }) => state !== current)]
      : ACTIONS.filter(({ state }) => state !== current)

  function openAction(item: Action) {
    setAction(item)
    onOpenChange(true)
  }

  const byState = (state: ReviewState) => actions.find((item) => item.state === state)
  const accept = byState("accepted")
  const reject = byState("rejected")
  const toInterview = byState("interview")
  useShortcut("ctrl+a", () => accept && openAction(accept), !!accept)
  useShortcut("ctrl+r", () => reject && openAction(reject), !!reject)
  useShortcut("ctrl+i", () => toInterview && openAction(toInterview), !!toInterview)
  // Editing the interview details is not a new review: it stays on this registration.
  const advancesAfter = next !== null && action !== EDIT_QUESTIONS

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
      if (result.status === "error") {
        setMessage(result.message)
        return
      }
      onOpenChange(false)
      if (advancesAfter && advance) router.push(next.href)
    })
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {actions.map((item) => {
          const key = SHORTCUTS[item.state]
          return (
            <McButton
              key={item.label}
              variant={item.state === "accepted" ? "primary" : "secondary"}
              destructive={item.state === "rejected"}
              onClick={() => openAction(item)}
              aria-keyshortcuts={key ? `Control+${key.toUpperCase()}` : undefined}
              title={key ? `Ctrl + ${key.toUpperCase()}` : undefined}
            >
              {item.label}
            </McButton>
          )
        })}
      </div>
      <p className="hidden flex-wrap items-center gap-x-3 gap-y-1.5 paragraph-xs text-muted-foreground sm:flex">
        {actions.map((item) => {
          const key = SHORTCUTS[item.state]
          return (
            key && (
              <span key={item.label} className="inline-flex items-center gap-1.5">
                <Keys keys={["Ctrl", key.toUpperCase()]} />
                {item.label}
              </span>
            )
          )
        })}
        <span className="inline-flex items-center gap-1.5">
          <Keys keys={["?"]} />
          All shortcuts
        </span>
      </p>

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
          <form
            onSubmit={handleSubmit}
            onKeyDown={submitOnCtrlEnter}
            noValidate
            className="flex flex-col gap-4"
          >
            {action !== EDIT_QUESTIONS && (
              <McTextarea
                label={reasonRequired ? "Reason" : "Reason (optional)"}
                name="reason"
                rows={action.state === "interview" ? 3 : 4}
                error={reasonError}
                required={reasonRequired}
                description="Enter to confirm, Shift + Enter for a new line."
                onKeyDown={submitOnEnter}
                autoFocus
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
            {advancesAfter && (
              <McCheckbox
                checked={advance}
                onCheckedChange={(checked) => setAdvance(checked === true)}
                text="Open the next registration after confirming"
                supportText={`Next: ${next.name}`}
              />
            )}
            <McDialogFooter className="pb-0 sm:justify-between">
              <span className="hidden items-center gap-1.5 paragraph-xs text-muted-foreground sm:inline-flex">
                <Keys keys={["Ctrl", "Enter"]} />
                to confirm
              </span>
              <McButton type="submit" isLoading={pending} aria-keyshortcuts="Control+Enter">
                Confirm
              </McButton>
            </McDialogFooter>
          </form>
        </McDialogContent>
      </McDialog>
    </>
  )
}
