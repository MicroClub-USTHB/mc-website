import { CircleCheckIcon } from "lucide-react"

import type { FeedbackModalProps } from "@/components/feedback-modal/types"
import { McButton } from "@/components/ui/mc-button"
import {
  McDialog,
  McDialogContent,
  McDialogDescription,
  McDialogHeader,
  McDialogTitle,
} from "@/components/ui/mc-dialog"

/** Success modal. Its own file with its own markup, so it can be redesigned without the others. */
export function SuccessModal({
  open,
  onOpenChange,
  title,
  description,
  actionLabel = "Continue",
  onAction,
  secondaryLabel,
  onSecondary,
}: FeedbackModalProps) {
  return (
    <McDialog open={open} onOpenChange={onOpenChange}>
      <McDialogContent className="items-center text-center" showCloseButton={false}>
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-success-foreground text-success">
          <CircleCheckIcon className="size-8" aria-hidden />
        </span>
        <McDialogHeader className="items-center">
          <McDialogTitle>{title}</McDialogTitle>
          {description && <McDialogDescription>{description}</McDialogDescription>}
        </McDialogHeader>
        <div className="flex flex-wrap justify-center gap-2">
          {secondaryLabel && (
            <McButton
              variant="secondary"
              size="xl"
              onClick={() => {
                onSecondary?.()
                onOpenChange(false)
              }}
            >
              {secondaryLabel}
            </McButton>
          )}
          <McButton
            size="xl"
            onClick={() => {
              onAction?.()
              onOpenChange(false)
            }}
          >
            {actionLabel}
          </McButton>
        </div>
      </McDialogContent>
    </McDialog>
  )
}
