export type FeedbackVariant = "success" | "error" | "warning"

export type FeedbackModalOptions = {
  title: string
  description?: string
  /** Label of the main button. Each variant has a default one. */
  actionLabel?: string
  /** Runs when the main button is pressed, before the modal closes. */
  onAction?: () => void
  /** Runs once the modal is closed, by any of its buttons, Escape or a click outside. */
  onClose?: () => void
}

/** What every variant modal receives from `FeedbackModalHost`. */
export type FeedbackModalProps = FeedbackModalOptions & {
  open: boolean
  onOpenChange: (open: boolean) => void
}
