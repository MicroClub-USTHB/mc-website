import { cn } from "@/lib/utils"

/** Error or confirmation under a form, announced to screen readers. */
export function FormMessage({
  tone = "error",
  children,
}: {
  tone?: "error" | "success"
  children?: React.ReactNode
}) {
  if (!children) return null
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn("paragraph-sm", tone === "error" ? "text-destructive" : "text-foreground")}
    >
      {children}
    </p>
  )
}
