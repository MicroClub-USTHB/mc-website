import { useRef, useTransition } from "react"
import { useRouter } from "next/navigation"

import { createStudentIdUploadSignature } from "@/actions/sign-student-id-upload"
import { submitRegistration } from "@/actions/submit-registration"
import { fieldId, focusField } from "@/components/registrations/state/registration-focus"
import type { RegistrationStore } from "@/components/registrations/state/registration-store"
import { REGISTRATION_HONEYPOT_FIELD, STEP_FIELDS } from "@/lib/registrations/schema"
import { uploadStudentId, type StudentIdUpload } from "@/lib/registrations/upload-student-id"
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
 * Sends the registration: uploads the student ID straight to Cloudinary (signed by the server),
 * then sends the answers with a reference to it. A retry after a failure that may pass reuses the
 * upload instead of sending the file again. Turns each outcome of the Server Action into feedback: a modal for
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
  const { showSuccess, showError } = useFeedbackModal()
  /** Error modal (Figma): "Home Page" leaves, "Try Again" closes it on the form. */
  const failed = (options: Parameters<typeof showError>[0] = {}) =>
    showError({ onSecondary: () => router.push("/"), ...options })
  // The transition keeps `submitting` true until the whole request (and its handling) is done.
  const [submitting, startSubmit] = useTransition()
  const uploaded = useRef<{ file: File; upload: StudentIdUpload } | null>(null)

  /** The student ID in Cloudinary: the one from an earlier attempt, or a new upload. `null` after showing why not. */
  async function ensureUpload(file: File) {
    if (uploaded.current?.file === file) return uploaded.current.upload

    const signed = await createStudentIdUploadSignature()
    if (signed.status === "rate-limited") {
      failed()
      return null
    }
    if (signed.status === "error") throw new Error("Signing the upload failed")

    try {
      const upload = await uploadStudentId(file, signed.signature)
      uploaded.current = { file, upload }
      return upload
    } catch (error) {
      console.error("Registration: the student ID upload failed", error)
      failed()
      return null
    }
  }

  async function send(honeypot: string) {
    try {
      if (!studentId) return
      const upload = await ensureUpload(studentId)
      if (!upload) return

      const formData = new FormData()
      formData.set("values", JSON.stringify(store.getSnapshot().values))
      formData.set("upload", JSON.stringify(upload))
      formData.set(REGISTRATION_HONEYPOT_FIELD, honeypot)

      const result = await submitRegistration(formData)

      switch (result.status) {
        case "success":
          uploaded.current = null
          onSaved()
          showSuccess({
            onAction: () => router.push("/"),
            onClose: scrollToForm,
          })
          break
        case "invalid": {
          // The server removed (or never had) the upload: the next attempt sends the file again.
          if (result.uploadRejected) uploaded.current = null
          // The server found what the browser let through: show it on the step that owns it.
          const step = STEP_FIELDS.findIndex(
            (fields, index) =>
              fields.some((field) => result.errors[field]) ||
              (index === 0 && result.studentIdError),
          )
          showStepErrors(Math.max(step, 0), result.errors, result.studentIdError ?? null)
          failed()
          break
        }
        case "duplicate":
          uploaded.current = null
          failed({
            onAction: () => {
              store.openStep(0)
              focusField(fieldId("email"))
            },
          })
          break
        case "rate-limited":
          failed()
          break
        case "error":
          failed()
          break
      }
    } catch (error) {
      console.error("Registration: the request failed", error)
      failed()
    }
  }

  return { submitting, submit: (honeypot: string) => startSubmit(() => send(honeypot)) }
}
