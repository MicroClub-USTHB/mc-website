import { McBadge } from "@/components/ui/mc-badge"
import { REGISTRATION_STATUS_LABELS, type RegistrationStatus } from "@/lib/registrations/status"

const STYLES: Record<
  RegistrationStatus,
  { variant: "secondary" | "destructive"; className?: string }
> = {
  pending: { variant: "secondary" },
  accepted: { variant: "secondary", className: "bg-success-foreground text-success" },
  rejected: { variant: "destructive" },
}

export function StatusBadge({ status }: { status: RegistrationStatus }) {
  const { variant, className } = STYLES[status]
  return (
    <McBadge variant={variant} className={className}>
      {REGISTRATION_STATUS_LABELS[status]}
    </McBadge>
  )
}
