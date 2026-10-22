import { CircleAlertIcon } from "lucide-react"

import { FeedbackModalFrame } from "@/components/feedback-modal/feedback-modal-frame"
import type { FeedbackModalProps } from "@/components/feedback-modal/types"

/** Warning modal. Its own file, so it can be redesigned without the others. */
export function WarningModal({ actionLabel = "Got it", ...props }: FeedbackModalProps) {
  return (
    <FeedbackModalFrame
      {...props}
      actionLabel={actionLabel}
      icon={CircleAlertIcon}
      tone="bg-warning-foreground text-warning"
    />
  )
}
