import { CircleCheckIcon } from "lucide-react"

import { FeedbackModalFrame } from "@/components/feedback-modal/feedback-modal-frame"
import type { FeedbackModalProps } from "@/components/feedback-modal/types"

/** Figma copy of the modal (the title shows in caps, the message in lowercase). */
const COPY = {
  title: "registration successful",
  description: "Thank you for registering ! see you there",
  actionLabel: "Home Page",
}

/** Success modal. Its own file, so it can be redesigned without the others. */
export function SuccessModal(props: FeedbackModalProps) {
  return (
    <FeedbackModalFrame
      {...COPY}
      {...Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined))}
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={props.title ?? COPY.title}
      icon={CircleCheckIcon}
      tone="bg-success-foreground text-success"
    />
  )
}
