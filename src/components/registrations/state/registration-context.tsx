"use client"

import { createContext, useContext, useRef, useState, useSyncExternalStore } from "react"
import { useLenis } from "lenis/react"

import {
  fieldId,
  focusField,
  scrollToRegistrationTop,
  stepTitleId,
  STUDENT_ID_FIELD,
} from "@/components/registrations/state/registration-focus"
import {
  createRegistrationStore,
  type RegistrationState,
  type RegistrationStore,
} from "@/components/registrations/state/registration-store"
import { useRegistrationSubmit } from "@/components/registrations/state/use-registration-submit"
import { useUnsavedChangesGuard } from "@/components/registrations/state/use-unsaved-changes-guard"
import { REGISTRATION_STEPS } from "@/const/registrations"
import {
  EMPTY_REGISTRATION,
  STEP_FIELDS,
  validateRegistration,
  validateStudentId,
  type RegistrationErrors,
  type RegistrationField,
  type RegistrationValues,
} from "@/lib/registrations/schema"

const LAST_STEP = REGISTRATION_STEPS.length - 1

/**
 * What changes rarely: the chosen file, submission state and the step actions. Typed values,
 * errors and the current step are not here, they live in the store and each component subscribes
 * only to the part it reads, so typing in one field does not render the others.
 */
type RegistrationContextValue = {
  store: RegistrationStore
  studentId: File | null
  studentIdError: string | null
  submitting: boolean
  /** Message read out by screen readers when a step changes or a step has errors. */
  announcement: string
  setStudentId: (file: File | null) => void
  /** Validates the current step, then opens the next one. */
  next: () => void
  back: () => void
  goToStep: (step: number) => void
  /** Whether the review dialog (answers summary before sending) is open. */
  reviewing: boolean
  closeReview: () => void
  /** Validates every step, then opens the review dialog. */
  submit: (honeypot: string) => void
  /** Sends the registration, from the review dialog. */
  confirmSubmit: () => void
  startOver: () => void
}

const RegistrationContext = createContext<RegistrationContextValue | null>(null)

export function useRegistration() {
  const context = useContext(RegistrationContext)
  if (!context) throw new Error("useRegistration must be used inside <RegistrationProvider>")
  return context
}

/** Reads a part of the form state; re-renders only when the selected value changes (compared with `Object.is`). */
export function useRegistrationSelector<T>(selector: (state: RegistrationState) => T) {
  const { store } = useRegistration()
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getSnapshot()),
    () => selector(store.getServerSnapshot()),
  )
}

/** Value, error and handlers of one text field, subscribed to that field only. */
export function useRegistrationField<F extends RegistrationField>(field: F) {
  const { store } = useRegistration()
  const value = useRegistrationSelector((state) => state.values[field])
  const error = useRegistrationSelector((state) => state.errors[field])
  return {
    id: fieldId(field),
    value,
    error,
    onValueChange: (next: RegistrationValues[F]) => store.setValue(field, next),
    onBlur: () => store.blurField(field),
  }
}

/** Errors of one step, with the student ID counted in the first one. */
function stepErrors(step: number, values: RegistrationValues, file: File | null) {
  return {
    errors: validateRegistration(values, step),
    studentIdError: step === 0 ? validateStudentId(file) : null,
  }
}

const hasErrors = (result: { errors: RegistrationErrors; studentIdError: string | null }) =>
  Object.keys(result.errors).length > 0 || !!result.studentIdError

/**
 * State of the registration form, shared by the stepper, the steps and the actions.
 * Validation rewards early and punishes late: a field validates when it is left, then on each
 * keystroke; "Next" validates the whole step and focuses the first field that failed.
 */
export function RegistrationProvider({ children }: { children: React.ReactNode }) {
  const lenis = useLenis()
  const [store] = useState(createRegistrationStore)

  const [studentId, setStudentIdFile] = useState<File | null>(null)
  const [studentIdError, setStudentIdError] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState("")
  const [reviewing, setReviewing] = useState(false)
  const honeypot = useRef("")

  const dirtyValues = useSyncExternalStore(
    store.subscribe,
    () => JSON.stringify(store.getSnapshot().values) !== JSON.stringify(EMPTY_REGISTRATION),
    () => false,
  )

  function scrollToForm() {
    scrollToRegistrationTop((target, offset) => lenis?.scrollTo(target, { offset }))
  }

  function showStepErrors(step: number, errors: RegistrationErrors, fileError: string | null) {
    store.showErrors(step, errors)
    setStudentIdError(fileError)

    const failed = STEP_FIELDS[step].filter((field) => errors[field])
    const count = failed.length + (fileError ? 1 : 0)
    setAnnouncement(`${count} ${count === 1 ? "field needs" : "fields need"} your attention.`)
    if (failed[0]) focusField(fieldId(failed[0]))
    else if (fileError) focusField(fieldId(STUDENT_ID_FIELD))
  }

  function openStep(step: number) {
    store.openStep(step)
    setAnnouncement(
      `Step ${step + 1} of ${REGISTRATION_STEPS.length}: ${REGISTRATION_STEPS[step].name}`,
    )
    scrollToForm()
    focusField(stepTitleId(step), true)
  }

  function resetForm() {
    store.reset()
    setStudentIdFile(null)
    setStudentIdError(null)
  }

  const { submitting, submit: sendRegistration } = useRegistrationSubmit({
    store,
    studentId,
    showStepErrors,
    onSaved: resetForm,
    scrollToForm,
  })

  // Typed answers or a chosen ID: leaving the page would lose them. A restored draft counts too.
  useUnsavedChangesGuard((dirtyValues || !!studentId) && !submitting)

  /** Opens the first invalid step before `target`, if any, and tells whether all were valid. */
  function validateUpTo(target: number) {
    const { values } = store.getSnapshot()
    for (let step = 0; step < target; step += 1) {
      const result = stepErrors(step, values, studentId)
      if (hasErrors(result)) {
        showStepErrors(step, result.errors, result.studentIdError)
        return false
      }
    }
    return true
  }

  const value: RegistrationContextValue = {
    store,
    studentId,
    studentIdError,
    submitting,
    announcement,
    setStudentId(file) {
      setStudentIdFile(file)
      // Picking a file shows its problem right away, clearing it shows the "required" message later.
      setStudentIdError(file ? validateStudentId(file) : null)
    },
    next() {
      if (submitting) return
      const { step } = store.getSnapshot()
      if (!validateUpTo(step + 1)) return
      if (step < LAST_STEP) openStep(step + 1)
    },
    back() {
      const { step } = store.getSnapshot()
      if (step > 0) openStep(step - 1)
    },
    goToStep(target) {
      const { step, furthestStep } = store.getSnapshot()
      if (submitting || target === step || target > furthestStep) return
      if (target > step && !validateUpTo(target)) return
      openStep(target)
    },
    reviewing,
    closeReview: () => setReviewing(false),
    submit(trap) {
      if (submitting) return
      // Every step must be valid (a draft can restore on the last step with an earlier one broken).
      if (!validateUpTo(LAST_STEP + 1)) return
      honeypot.current = trap
      setReviewing(true)
    },
    confirmSubmit() {
      if (submitting) return
      // The page button shows the progress; the modals of the outcome open over the form.
      setReviewing(false)
      sendRegistration(honeypot.current)
    },
    startOver() {
      resetForm()
      setAnnouncement(`Step 1 of ${REGISTRATION_STEPS.length}: ${REGISTRATION_STEPS[0].name}`)
    },
  }

  return <RegistrationContext value={value}>{children}</RegistrationContext>
}
