import { cn } from "@/lib/utils"

/** A key as printed on the keyboard, e.g. `<Kbd>Ctrl</Kbd>`. Decorative next to its action. */
export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded border border-b-2 border-border bg-muted px-1 font-sans paragraph-xs font-medium text-muted-foreground",
        className,
      )}
    >
      {children}
    </kbd>
  )
}

/** The keys of one shortcut, e.g. `["Ctrl", "A"]`. */
export function Keys({ keys, className }: { keys: string[]; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)} aria-hidden>
      {keys.map((key) => (
        <Kbd key={key}>{key}</Kbd>
      ))}
    </span>
  )
}
