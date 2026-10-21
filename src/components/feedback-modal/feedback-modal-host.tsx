"use client"

import { ErrorModal } from "@/components/feedback-modal/error-modal"
import { SuccessModal } from "@/components/feedback-modal/success-modal"
import type { FeedbackModalOptions, FeedbackVariant } from "@/components/feedback-modal/types"
import { WarningModal } from "@/components/feedback-modal/warning-modal"

const MODALS = {
  success: SuccessModal,
  error: ErrorModal,
  warning: WarningModal,
} as const

type FeedbackModalHostProps = {
  /** Variant of the modal on screen, kept while it closes so it fades out unchanged. */
  variant: FeedbackVariant
  options: FeedbackModalOptions | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Renders the modal of the current variant. */
export function FeedbackModalHost({
  variant,
  options,
  open,
  onOpenChange,
}: FeedbackModalHostProps) {
  if (!options) return null
  const Modal = MODALS[variant]
  return <Modal open={open} onOpenChange={onOpenChange} {...options} />
}
