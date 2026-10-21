export const STUDENT_ID_FIELD = "studentId"

/** DOM id of a field, also what the error focus and the labels point to. */
export function fieldId(field: string) {
  return `registration-${field}`
}

/** Frames to wait for a field to exist: a step change fades the old step out before the new one mounts. */
const FOCUS_MAX_FRAMES = 60

export function focusField(id: string, frame = 0) {
  const element = document.getElementById(id)
  if (element) element.focus()
  else if (frame < FOCUS_MAX_FRAMES) requestAnimationFrame(() => focusField(id, frame + 1))
}

/** Brings the stepper just under the fixed menu bar, which would hide it at the page top. */
export function scrollToRegistrationTop(scrollTo: (target: HTMLElement, offset: number) => void) {
  const top = document.getElementById("registration-top")
  const bar = document.querySelector<HTMLElement>("header button[aria-controls]")
  if (!top) return
  const clearance = bar ? bar.getBoundingClientRect().bottom + 24 : 24
  scrollTo(top, -clearance)
}
