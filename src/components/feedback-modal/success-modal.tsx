import { CircleCheckIcon } from "lucide-react"

import { FeedbackModalFrame } from "@/components/feedback-modal/feedback-modal-frame"
import type { FeedbackModalProps } from "@/components/feedback-modal/types"

/** Success modal. Its own file, so it can be redesigned without the others. */
export function SuccessModal({ actionLabel = "Continue", ...props }: FeedbackModalProps) {
  return (
    <FeedbackModalFrame
      {...props}
      actionLabel={actionLabel}
      icon={CircleCheckIcon}
      tone="bg-success-foreground text-success"
    />
  )
}
