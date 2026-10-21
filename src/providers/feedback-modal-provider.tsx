"use client"

import { createContext, useContext, useState } from "react"

import { FeedbackModalHost } from "@/components/feedback-modal/feedback-modal-host"
import type { FeedbackModalOptions, FeedbackVariant } from "@/components/feedback-modal/types"

type FeedbackModalContextValue = {
  /** Opens the success / error / warning modal. One modal at a time: a new call replaces it. */
  showModal: (variant: FeedbackVariant, options: FeedbackModalOptions) => void
  showSuccess: (options: FeedbackModalOptions) => void
  showError: (options: FeedbackModalOptions) => void
  showWarning: (options: FeedbackModalOptions) => void
  hideModal: () => void
}

const FeedbackModalContext = createContext<FeedbackModalContextValue | null>(null)

/** Triggers the three feedback modals from any client component under `FeedbackModalProvider`. */
export function useFeedbackModal() {
  const context = useContext(FeedbackModalContext)
  if (!context) throw new Error("useFeedbackModal must be used inside <FeedbackModalProvider>")
  return context
}

type ModalState = { variant: FeedbackVariant; options: FeedbackModalOptions; open: boolean }

/**
 * Global trigger of the success / error / warning modals:
 * `const { showError } = useFeedbackModal(); showError({ title: "...", description: "..." })`.
 * The markup of each modal lives in `src/components/feedback-modal/`.
 */
export function FeedbackModalProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<ModalState | null>(null)

  function showModal(variant: FeedbackVariant, options: FeedbackModalOptions) {
    setModal({ variant, options, open: true })
  }

  function onOpenChange(open: boolean) {
    if (open || !modal) return
    setModal({ ...modal, open: false })
    modal.options.onClose?.()
  }

  const value: FeedbackModalContextValue = {
    showModal,
    showSuccess: (options) => showModal("success", options),
    showError: (options) => showModal("error", options),
    showWarning: (options) => showModal("warning", options),
    hideModal: () => onOpenChange(false),
  }

  return (
    <FeedbackModalContext value={value}>
      {children}
      <FeedbackModalHost
        variant={modal?.variant ?? "success"}
        options={modal?.options ?? null}
        open={modal?.open ?? false}
        onOpenChange={onOpenChange}
      />
    </FeedbackModalContext>
  )
}
