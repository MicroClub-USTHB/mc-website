import { cn } from "@/lib/utils"

/** Suggested question (Figma "message" chip). */
export function SuggestionChip({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "cursor-pointer rounded-lg border bg-background px-3.5 py-2.5 text-left paragraph-md text-foreground shadow-xs transition-colors duration-300 ease-out-quart outline-none hover:bg-secondary focus-visible:ring-4 focus-visible:ring-secondary motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  )
}
