import { useState } from "react"
import { useRouter } from "next/navigation"

import { submitRegistration } from "@/actions/submit-registration"
import { fieldId, focusField } from "@/components/registrations/state/registration-focus"
import type { RegistrationStore } from "@/components/registrations/state/registration-store"
import { REGISTRATION_HONEYPOT_FIELD, STEP_FIELDS } from "@/lib/registrations/schema"
import { useFeedbackModal } from "@/providers/feedback-modal-provider"

type SubmitOptions = {
  store: RegistrationStore
  studentId: File | null
  /** Opens `step` with the messages the server returned. */
  showStepErrors: (
    step: number,
    errors: Parameters<RegistrationStore["showErrors"]>[1],
    fileError: string | null,
  ) => void
  /** After a saved registration: forget the draft and the chosen file. */
  onSaved: () => void
  scrollToForm: () => void
}

/**
 * Sends the registration and turns each outcome of the Server Action into feedback: a modal for
 * success, duplicate, rate limit and failure, messages on the fields for server-side validation.
 */
export function useRegistrationSubmit({
  store,
  studentId,
  showStepErrors,
  onSaved,
  scrollToForm,
}: SubmitOptions) {
  const router = useRouter()
  const { showSuccess, showError, showWarning } = useFeedbackModal()
  const [submitting, setSubmitting] = useState(false)

  async function submit(honeypot: string) {
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.set("values", JSON.stringify(store.getSnapshot().values))
      if (studentId) formData.set("studentId", studentId)
      formData.set(REGISTRATION_HONEYPOT_FIELD, honeypot)

      const result = await submitRegistration(formData)

      switch (result.status) {
        case "success":
          onSaved()
          showSuccess({
            title: "You are registered!",
            description:
              "Thank you for applying to Micro Club. We received your registration and will get back to you soon.",
            actionLabel: "Back to home",
            onAction: () => router.push("/"),
            onClose: scrollToForm,
          })
          break
        case "invalid": {
          // The server found what the browser let through: show it on the step that owns it.
          const step = STEP_FIELDS.findIndex(
            (fields, index) =>
              fields.some((field) => result.errors[field]) ||
              (index === 0 && result.studentIdError),
          )
          showStepErrors(Math.max(step, 0), result.errors, result.studentIdError ?? null)
          showError({
            title: "Some answers need a fix",
            description: "Please check the highlighted fields, then submit again.",
          })
          break
        }
        case "duplicate":
          showWarning({
            title: "You are already registered",
            description:
              "A registration with this email already exists. If you think this is a mistake, contact us through the Contact section.",
            actionLabel: "Change my email",
            onAction: () => {
              store.openStep(0)
              focusField(fieldId("email"))
            },
          })
          break
        case "rate-limited":
          showWarning({
            title: "Too many attempts",
            description:
              "You tried to register several times in a row. Please wait a while, then try again.",
          })
          break
        case "error":
          showError({
            title: "We could not save your registration",
            description:
              "Something went wrong on our side. Your answers are kept, please try again.",
          })
          break
      }
    } catch (error) {
      console.error("Registration: the request failed", error)
      showError({
        title: "We could not reach the server",
        description: "Check your connection and try again. Your answers are kept.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return { submitting, submit }
}
