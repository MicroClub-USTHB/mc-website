import { McBadge } from "@/components/ui/mc-badge"
import { REGISTRATION_STATUS_LABELS, type RegistrationStatus } from "@/lib/registrations/status"

/** Badge tone of each status (mcoli-ui badge variants, with their own dark theme colors). */
const VARIANTS: Record<
  RegistrationStatus,
  "secondary" | "info" | "warning" | "success" | "destructive"
> = {
  pending: "secondary",
  interview: "info",
  conflict: "warning",
  accepted: "success",
  rejected: "destructive",
}

export function StatusBadge({ status }: { status: RegistrationStatus }) {
  return <McBadge variant={VARIANTS[status]}>{REGISTRATION_STATUS_LABELS[status]}</McBadge>
}
