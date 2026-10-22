import { CircleAlertIcon } from "lucide-react"

import { FeedbackModalFrame } from "@/components/feedback-modal/feedback-modal-frame"
import type { FeedbackModalProps } from "@/components/feedback-modal/types"

/** Figma copy of the modal (the title shows in caps, the message in lowercase). */
const COPY = {
  title: "LEAVING WITHOUT SAVING ?",
  description: "CHANGES ARE NOT SAVED , ARE YOU SURE YOU WANT TO LEAVE ?",
  actionLabel: "Try Again",
  secondaryLabel: "Home Page",
}

/** Warning modal. Its own file, so it can be redesigned without the others. */
export function WarningModal(props: FeedbackModalProps) {
  return (
    <FeedbackModalFrame
      {...COPY}
      {...Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined))}
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={props.title ?? COPY.title}
      icon={CircleAlertIcon}
      tone="bg-warning-foreground text-warning"
    />
  )
}
