import type { RegistrationRow } from "@/lib/registrations/review"

/**
 * The application's recommendation, in the registrations table: who made it and where to (a
 * section or department), on two lines so the table keeps to the page width.
 */
export function RecommendedBy({
  recommendation,
}: {
  recommendation: RegistrationRow["recommendation"]
}) {
  if (!recommendation) return <span className="text-muted-foreground">None</span>
  return (
    <span className="flex flex-col whitespace-nowrap">
      <span className="font-medium text-foreground">{recommendation.name}</span>
      <span className="text-muted-foreground">→ {recommendation.target}</span>
    </span>
  )
}
