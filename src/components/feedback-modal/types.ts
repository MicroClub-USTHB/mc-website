export type FeedbackVariant = "success" | "error" | "warning"

export type FeedbackModalOptions = {
  /** Each variant has its Figma copy: title, message and button labels, overridable. */
  title?: string
  description?: string
  /** Label of the main button. Each variant has a default one. */
  actionLabel?: string
  /** Runs when the main button is pressed, before the modal closes. */
  onAction?: () => void
  /** Label of an optional second button, shown before the main one (e.g. "Home Page"). */
  secondaryLabel?: string
  /** Runs when the second button is pressed, before the modal closes. */
  onSecondary?: () => void
  /** Runs once the modal is closed, by any of its buttons, Escape or a click outside. */
  onClose?: () => void
}

/** What every variant modal receives from `FeedbackModalHost`. */
export type FeedbackModalProps = FeedbackModalOptions & {
  open: boolean
  onOpenChange: (open: boolean) => void
}
