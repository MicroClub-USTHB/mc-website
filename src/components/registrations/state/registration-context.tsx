"use client"

import { createContext, useContext, useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { useLenis } from "lenis/react"

import {
  createRegistrationStore,
  type RegistrationState,
} from "@/components/registrations/state/registration-store"
import { REGISTRATION_STEPS } from "@/const/registrations"
import { submitRegistration } from "@/actions/submit-registration"
import {
  EMPTY_REGISTRATION,
  REGISTRATION_HONEYPOT_FIELD,
  STEP_FIELDS,
  validateRegistration,
  validateStudentId,
  type RegistrationErrors,
  type RegistrationField,
  type RegistrationValues,
} from "@/lib/registrations/schema"
import { useUnsavedChangesGuard } from "@/components/registrations/state/use-unsaved-changes-guard"
import { useFeedbackModal } from "@/providers/feedback-modal-provider"

const LAST_STEP = REGISTRATION_STEPS.length - 1

export const STUDENT_ID_FIELD = "studentId"

/** DOM id of a field, also what the error focus and the labels point to. */
export function fieldId(field: RegistrationField | typeof STUDENT_ID_FIELD) {
  return `registration-${field}`
}

type RegistrationContextValue = RegistrationState & {
  studentId: File | null
  studentIdError: string | null
  submitting: boolean
  /** Message read out by screen readers when a step changes or a step has errors. */
  announcement: string
  setValue: <F extends RegistrationField>(field: F, value: RegistrationValues[F]) => void
  /** Marks the field as visited and shows its error, if any. */
  blurField: (field: RegistrationField) => void
  setStudentId: (file: File | null) => void
  /** Validates the current step, then opens the next one or submits on the last step. */
  next: () => void
  back: () => void
  goToStep: (step: number) => void
  submit: (honeypot: string) => void
  startOver: () => void
}

const RegistrationContext = createContext<RegistrationContextValue | null>(null)

export function useRegistration() {
  const context = useContext(RegistrationContext)
  if (!context) throw new Error("useRegistration must be used inside <RegistrationProvider>")
  return context
}

/** Error of one field, or `undefined`, and the props shared by every text field. */
export function useRegistrationField<F extends RegistrationField>(field: F) {
  const { values, errors, setValue, blurField } = useRegistration()
  return {
    id: fieldId(field),
    value: values[field],
    error: errors[field],
    onValueChange: (value: RegistrationValues[F]) => setValue(field, value),
    onBlur: () => blurField(field),
  }
}

/** Frames to wait for a field to exist: a step change fades the old step out before the new one mounts. */
const FOCUS_MAX_FRAMES = 60

function focusField(id: string, frame = 0) {
  const element = document.getElementById(id)
  if (element) element.focus()
  else if (frame < FOCUS_MAX_FRAMES) requestAnimationFrame(() => focusField(id, frame + 1))
}

/**
 * State of the registration form, shared by the stepper, the steps and the actions:
 * values and step (kept as a draft in `sessionStorage`), errors, the student ID file and submission.
 * Validation rewards early and punishes late: a field validates when it is left, then on each
 * keystroke; "Next" validates the whole step and focuses the first field that failed.
 */
export function RegistrationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const lenis = useLenis()
  const { showSuccess, showError, showWarning } = useFeedbackModal()
  const [store] = useState(createRegistrationStore)
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)

  const [studentId, setStudentIdFile] = useState<File | null>(null)
  const [studentIdError, setStudentIdError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [announcement, setAnnouncement] = useState("")

  // Typed answers or a chosen ID: leaving the page would lose them. A restored draft counts too.
  const dirty = !!studentId || JSON.stringify(state.values) !== JSON.stringify(EMPTY_REGISTRATION)
  useUnsavedChangesGuard(dirty && !submitting)

  function announceStep(step: number) {
    const { name } = REGISTRATION_STEPS[step]
    setAnnouncement(`Step ${step + 1} of ${REGISTRATION_STEPS.length}: ${name}`)
  }

  /** Brings the stepper just under the fixed menu bar, which would hide it at the page top. */
  function scrollToForm() {
    const top = document.getElementById("registration-top")
    const bar = document.querySelector<HTMLElement>("header button[aria-controls]")
    if (!top) return
    const clearance = bar ? bar.getBoundingClientRect().bottom + 24 : 24
    lenis?.scrollTo(top, { offset: -clearance })
  }

  /** Errors of one step, with the student ID counted in the first one. */
  function stepErrors(step: number, values: RegistrationValues, file: File | null) {
    return {
      errors: validateRegistration(values, step),
      studentIdError: step === 0 ? validateStudentId(file) : null,
    }
  }

  function showStepErrors(step: number, errors: RegistrationErrors, fileError: string | null) {
    const failed = STEP_FIELDS[step].filter((field) => errors[field])
    const touched = Object.fromEntries(STEP_FIELDS[step].map((field) => [field, true as const]))
    store.set((current) => ({
      ...current,
      step,
      errors: { ...current.errors, ...errors },
      touched: { ...current.touched, ...touched },
    }))
    setStudentIdError(fileError)

    const count = failed.length + (fileError ? 1 : 0)
    setAnnouncement(`${count} ${count === 1 ? "field needs" : "fields need"} your attention.`)
    if (failed[0]) focusField(fieldId(failed[0]))
    else if (fileError) focusField(fieldId(STUDENT_ID_FIELD))
  }

  function openStep(step: number) {
    store.set((current) => ({
      ...current,
      step,
      furthestStep: Math.max(current.furthestStep, step),
    }))
    announceStep(step)
    scrollToForm()
  }

  function validateUpTo(target: number) {
    // Steps before `target` must be valid, the first invalid one opens with its errors.
    for (let step = 0; step < target; step += 1) {
      const result = stepErrors(step, state.values, studentId)
      if (Object.keys(result.errors).length > 0 || result.studentIdError) {
        showStepErrors(step, result.errors, result.studentIdError)
        return false
      }
    }
    return true
  }

  function setValue<F extends RegistrationField>(field: F, value: RegistrationValues[F]) {
    store.set((current) => {
      const values = { ...current.values, [field]: value }
      const errors = { ...current.errors }
      // Fields already visited (or with an error) validate while typing, new ones stay quiet.
      if (current.touched[field] || errors[field]) {
        const message = validateRegistration(
          values,
          STEP_FIELDS.findIndex((f) => f.includes(field)),
        )[field]
        if (message) errors[field] = message
        else delete errors[field]
      }
      return { ...current, values, errors, restored: false }
    })
  }

  function blurField(field: RegistrationField) {
    store.set((current) => {
      const message = validateRegistration(
        current.values,
        STEP_FIELDS.findIndex((f) => f.includes(field)),
      )[field]
      const errors = { ...current.errors }
      if (message) errors[field] = message
      else delete errors[field]
      return { ...current, errors, touched: { ...current.touched, [field]: true } }
    })
  }

  function setStudentId(file: File | null) {
    setStudentIdFile(file)
    // Picking a file shows its problem right away, clearing it shows the "required" message later.
    setStudentIdError(file ? validateStudentId(file) : null)
  }

  async function runSubmit(honeypot: string) {
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.set("values", JSON.stringify(state.values))
      if (studentId) formData.set(STUDENT_ID_FIELD, studentId)
      formData.set(REGISTRATION_HONEYPOT_FIELD, honeypot)

      const result = await submitRegistration(formData)

      switch (result.status) {
        case "success":
          store.reset()
          setStudentIdFile(null)
          setStudentIdError(null)
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
              store.set((current) => ({ ...current, step: 0 }))
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

  function next() {
    if (submitting) return
    const { errors, studentIdError: fileError } = stepErrors(state.step, state.values, studentId)
    if (Object.keys(errors).length > 0 || fileError) {
      showStepErrors(state.step, errors, fileError)
      return
    }
    if (state.step < LAST_STEP) openStep(state.step + 1)
  }

  function submit(honeypot: string) {
    if (submitting) return
    // Every step must be valid (a draft can be restored on the last step with an old step broken).
    if (!validateUpTo(LAST_STEP)) return
    const { errors } = stepErrors(LAST_STEP, state.values, studentId)
    if (Object.keys(errors).length > 0) {
      showStepErrors(LAST_STEP, errors, null)
      return
    }
    void runSubmit(honeypot)
  }

  function goToStep(step: number) {
    if (submitting || step === state.step || step > state.furthestStep) return
    if (step > state.step && !validateUpTo(step)) return
    openStep(step)
  }

  const value: RegistrationContextValue = {
    ...state,
    studentId,
    studentIdError,
    submitting,
    announcement,
    setValue,
    blurField,
    setStudentId,
    next,
    back: () => state.step > 0 && openStep(state.step - 1),
    goToStep,
    submit,
    startOver: () => {
      store.reset()
      setStudentIdFile(null)
      setStudentIdError(null)
      announceStep(0)
    },
  }

  return <RegistrationContext value={value}>{children}</RegistrationContext>
}
