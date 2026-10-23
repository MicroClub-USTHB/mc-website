import { XIcon, type LucideIcon } from "lucide-react"

import type { FeedbackModalProps } from "@/components/feedback-modal/types"
import { McButton } from "@/components/ui/mc-button"
import {
  McDialog,
  McDialogClose,
  McDialogContent,
  McDialogDescription,
  McDialogTitle,
} from "@/components/ui/mc-dialog"
import { cn } from "@/lib/utils"

/** Figma "Buttons" of the modals (McButton): 165px wide, 40px high, 14px medium label. */
const BUTTON =
  "h-10 min-w-0 flex-1 basis-0 px-4 py-2.5 text-sm leading-5 shadow-none sm:max-w-[165px]"

/**
 * The card all feedback modals share (Figma "Modals", 387px wide): tinted icon, bold uppercase
 * title, lowercase message, close button in the corner, then the buttons. On narrow screens the
 * card keeps a 16px margin and its buttons share its width.
 */
export function FeedbackModalFrame({
  open,
  onOpenChange,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  icon: Icon,
  tone,
}: FeedbackModalProps & {
  icon: LucideIcon
  /** Icon colors: `bg-*-foreground` disc, `text-*` icon. */
  tone: string
}) {
  return (
    <McDialog open={open} onOpenChange={onOpenChange}>
      <McDialogContent
        showCloseButton={false}
        className="flex w-[min(387px,calc(100%-2rem))] flex-col gap-6 rounded-xl border-border bg-card p-6 shadow-[0_4px_12px_-4px_rgb(0_0_0/0.08)] sm:min-h-0"
      >
        <div className="relative flex flex-col items-center gap-2 text-center">
          <span className={cn("grid size-[45.278px] place-items-center rounded-full", tone)}>
            <Icon className="size-[26px]" strokeWidth={2} aria-hidden />
          </span>
          <McDialogTitle className="text-lg leading-7 font-bold text-foreground uppercase">
            {title}
          </McDialogTitle>
          {description && (
            <McDialogDescription className="max-w-[285px] text-sm leading-5 text-muted-foreground lowercase">
              {description}
            </McDialogDescription>
          )}
          <McDialogClose
            aria-label="Close"
            className="absolute -top-[3px] right-0 grid size-[27px] cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring"
          >
            <XIcon className="size-[27px]" strokeWidth={1.5} aria-hidden />
          </McDialogClose>
        </div>
        <div className="flex justify-center gap-2">
          {secondaryLabel && (
            <McButton
              variant="secondary"
              onClick={() => {
                onSecondary?.()
                onOpenChange(false)
              }}
              className={cn(BUTTON, "border-border text-primary")}
            >
              {secondaryLabel}
            </McButton>
          )}
          <McButton
            onClick={() => {
              onAction?.()
              onOpenChange(false)
            }}
            className={cn(BUTTON, "text-secondary", !secondaryLabel && "max-w-[165px]")}
          >
            {actionLabel}
          </McButton>
        </div>
      </McDialogContent>
    </McDialog>
  )
}
