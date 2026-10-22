import { CircleXIcon } from "lucide-react"

import { FeedbackModalFrame } from "@/components/feedback-modal/feedback-modal-frame"
import type { FeedbackModalProps } from "@/components/feedback-modal/types"

/** Figma copy of the modal (the title shows in caps, the message in lowercase). */
const COPY = {
  title: "SOMETHING WENT WRONG",
  description: "OOPS ! SOMETHING WENT WRONG",
  actionLabel: "Try Again",
  secondaryLabel: "Home Page",
}

/** Error (Figma "Destructive") modal. Its own file, so it can be redesigned without the others. */
export function ErrorModal(props: FeedbackModalProps) {
  return (
    <FeedbackModalFrame
      {...COPY}
      {...Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined))}
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={props.title ?? COPY.title}
      icon={CircleXIcon}
      tone="bg-destructive-foreground text-destructive"
    />
  )
}
