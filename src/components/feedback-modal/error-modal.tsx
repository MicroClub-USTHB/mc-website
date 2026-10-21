import { CircleXIcon } from "lucide-react"

import type { FeedbackModalProps } from "@/components/feedback-modal/types"
import { McButton } from "@/components/ui/mc-button"
import {
  McDialog,
  McDialogContent,
  McDialogDescription,
  McDialogHeader,
  McDialogTitle,
} from "@/components/ui/mc-dialog"

/** Error modal. Its own file with its own markup, so it can be redesigned without the others. */
export function ErrorModal({
  open,
  onOpenChange,
  title,
  description,
  actionLabel = "Try again",
  onAction,
}: FeedbackModalProps) {
  return (
    <McDialog open={open} onOpenChange={onOpenChange}>
      <McDialogContent className="items-center text-center" showCloseButton={false}>
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-destructive-foreground text-destructive">
          <CircleXIcon className="size-8" aria-hidden />
        </span>
        <McDialogHeader className="items-center">
          <McDialogTitle>{title}</McDialogTitle>
          {description && <McDialogDescription>{description}</McDialogDescription>}
        </McDialogHeader>
        <McButton
          size="xl"
          className="mx-auto"
          onClick={() => {
            onAction?.()
            onOpenChange(false)
          }}
        >
          {actionLabel}
        </McButton>
      </McDialogContent>
    </McDialog>
  )
}
