import { MicroBotFace } from "@/components/microbot/microbot-face"
import { cn } from "@/lib/utils"

type MicroBotLauncherProps = React.ComponentProps<"button">

/**
 * 72×72 button showing Micro Bot's face: opens and closes the chat panel. No backdrop blur (unlike
 * Figma): the background is opaque, so it would never show, yet it would repaint on every scroll
 * frame of the page behind this fixed button.
 */
export function MicroBotLauncher({ className, ...props }: MicroBotLauncherProps) {
  return (
    <button
      type="button"
      className={cn(
        "relative size-18 shrink-0 cursor-pointer overflow-hidden rounded-[1.125rem] border-[1.113px] border-primary-foreground bg-foreground shadow-[inset_2px_-3px_8.1px_2px_color-mix(in_oklab,var(--primary-foreground)_29%,transparent)] transition-transform duration-300 ease-out-quart outline-none hover:scale-105 focus-visible:ring-4 focus-visible:ring-secondary motion-reduce:transition-none motion-reduce:hover:scale-100",
        className,
      )}
      {...props}
    >
      <MicroBotFace />
    </button>
  )
}
