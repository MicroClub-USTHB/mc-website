import { CircleXIcon } from "lucide-react"

import { FeedbackModalFrame } from "@/components/feedback-modal/feedback-modal-frame"
import type { FeedbackModalProps } from "@/components/feedback-modal/types"

/** Error (Figma "Destructive") modal. Its own file, so it can be redesigned without the others. */
export function ErrorModal({ actionLabel = "Try again", ...props }: FeedbackModalProps) {
  return (
    <FeedbackModalFrame
      {...props}
      actionLabel={actionLabel}
      icon={CircleXIcon}
      tone="bg-destructive-foreground text-destructive"
    />
  )
}
