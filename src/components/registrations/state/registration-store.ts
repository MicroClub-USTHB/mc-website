import {
  EMPTY_REGISTRATION,
  STEP_FIELDS,
  validateRegistration,
  type RegistrationErrors,
  type RegistrationField,
  type RegistrationValues,
} from "@/lib/registrations/schema"

export type RegistrationState = {
  step: number
  /** Furthest step reached, so the stepper lets the visitor jump back and forth up to it. */
  furthestStep: number
  values: RegistrationValues
  errors: RegistrationErrors
  /** Fields the visitor already left: they validate again on every keystroke. */
  touched: Partial<Record<RegistrationField, true>>
  /** The state came from a saved draft, not from an empty form. */
  restored: boolean
}

export const INITIAL_STATE: RegistrationState = {
  step: 0,
  furthestStep: 0,
  values: EMPTY_REGISTRATION,
  errors: {},
  touched: {},
  restored: false,
}

/** `sessionStorage`: a refresh keeps the draft, closing the tab drops the personal data. */
const STORAGE_KEY = "mc-registration-draft"

type Draft = Pick<RegistrationState, "step" | "furthestStep" | "values">

function readDraft(): RegistrationState | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const draft = JSON.parse(raw) as Draft
    const hasContent = JSON.stringify(draft.values) !== JSON.stringify(EMPTY_REGISTRATION)
    if (!hasContent && draft.step === 0) return null
    return {
      ...INITIAL_STATE,
      step: draft.step,
      furthestStep: draft.furthestStep,
      // Fields added since the draft was saved fall back to their empty value.
      values: { ...EMPTY_REGISTRATION, ...draft.values },
      restored: true,
    }
  } catch {
    return null
  }
}

function writeDraft(state: RegistrationState) {
  try {
    const draft: Draft = {
      step: state.step,
      furthestStep: state.furthestStep,
      values: state.values,
    }
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch {
    // Storage is blocked or full: the form still works, it just cannot restore itself.
  }
}

function removeDraft() {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to clean when storage is blocked.
  }
}

/** Step that owns `field`. */
function stepOf(field: RegistrationField) {
  return STEP_FIELDS.findIndex((fields) => fields.includes(field))
}

/** `errors` with the message of `field` set, or removed when the field is valid. */
function withFieldError(
  values: RegistrationValues,
  errors: RegistrationErrors,
  field: RegistrationField,
) {
  const message = validateRegistration(values, stepOf(field))[field]
  const next = { ...errors }
  if (message) next[field] = message
  else delete next[field]
  return next
}

/**
 * Form state outside React, read with `useSyncExternalStore`: the server and the first client
 * render use the empty form, then the saved draft is read, with no state set in an effect.
 */
export function createRegistrationStore() {
  let state = INITIAL_STATE
  let loaded = false
  const listeners = new Set<() => void>()

  return {
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot() {
      if (!loaded) {
        loaded = true
        state = readDraft() ?? state
      }
      return state
    },
    getServerSnapshot: () => INITIAL_STATE,
    /** Replaces the state with `update(current)`, saves the draft and notifies the readers. */
    set(update: (current: RegistrationState) => RegistrationState) {
      state = update(this.getSnapshot())
      writeDraft(state)
      listeners.forEach((listener) => listener())
    },
    /**
     * Sets one field. Fields already visited (or with an error) validate while typing, new ones
     * stay quiet.
     */
    setValue<F extends RegistrationField>(field: F, value: RegistrationValues[F]) {
      this.set((current) => {
        const values = { ...current.values, [field]: value }
        const shouldValidate = current.touched[field] || current.errors[field]
        const errors = shouldValidate
          ? withFieldError(values, current.errors, field)
          : current.errors
        return { ...current, values, errors, restored: false }
      })
    },
    /** Marks the field as visited and shows its error, if any. */
    blurField(field: RegistrationField) {
      this.set((current) => ({
        ...current,
        errors: withFieldError(current.values, current.errors, field),
        touched: { ...current.touched, [field]: true },
      }))
    },
    /** Opens `step`, and remembers it as reached. */
    openStep(step: number) {
      this.set((current) => ({
        ...current,
        step,
        furthestStep: Math.max(current.furthestStep, step),
      }))
    },
    /** Opens `step` showing `errors` on its fields (they all count as visited). */
    showErrors(step: number, errors: RegistrationErrors) {
      const touched = Object.fromEntries(STEP_FIELDS[step].map((field) => [field, true as const]))
      this.set((current) => ({
        ...current,
        step,
        errors: { ...current.errors, ...errors },
        touched: { ...current.touched, ...touched },
      }))
    },
    /** Back to an empty form, and forgets the draft. */
    reset() {
      state = INITIAL_STATE
      removeDraft()
      listeners.forEach((listener) => listener())
    },
  }
}

export type RegistrationStore = ReturnType<typeof createRegistrationStore>
