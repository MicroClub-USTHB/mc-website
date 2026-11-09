import type { Metadata } from "next"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { UsersIcon } from "lucide-react"

import { MilestoneBanner } from "@/components/admin/team/milestone-banner"
import {
  DecisionsProgressCard,
  TeamProgressCard,
} from "@/components/admin/team/review-progress-cards"
import { McBadge } from "@/components/ui/mc-badge"
import {
  McDataTableCard,
  McDataTableEmpty,
  McDataTableHeader,
  McTable,
  McTableBody,
  McTableCell,
  McTableHead,
  McTableHeader,
  McTableRow,
} from "@/components/ui/mc-data-table"
import { adminRoutes } from "@/config/admin"
import { requireStaff } from "@/lib/auth/session"
import { getTeamActivity } from "@/lib/registrations/place-store"
import { reachedMilestone } from "@/lib/registrations/review-progress"
import { getReviewProgress } from "@/lib/registrations/review-progress-store"
import {
  recommendationsQuery,
  DEFAULT_RECOMMENDATION_PARAMS,
} from "@/lib/registrations/recommendation-params"

export const metadata: Metadata = { title: "Team" }

const COUNTS = [
  { key: "interview", label: "Interview" },
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Rejected" },
] as const

/**
 * What each HR member decided: their current review of every registration (a changed review
 * counts once, as its latest state) and the recommendations standing in their name.
 */
export default async function TeamPage() {
  const { user } = await requireStaff({ permissions: { registration: ["review"] } })
  const [members, progress] = await Promise.all([getTeamActivity(), getReviewProgress(user.id)])
  const now = new Date()

  return (
    <div className="mx-auto flex w-full max-w-site flex-col gap-6 px-4 py-12 sm:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="header-md font-heading text-foreground">Team</h1>
        <p className="paragraph-md text-muted-foreground">
          Each HR member&apos;s decisions as they stand now: a changed review counts once, as its
          latest state.
        </p>
      </div>

      <MilestoneBanner milestone={reachedMilestone(progress.team.percent)} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TeamProgressCard progress={progress} now={now} />
        <DecisionsProgressCard progress={progress} now={now} />
      </div>

      <McDataTableCard>
        <McDataTableHeader title="HR members" badge={members.length} />
        {members.length > 0 ? (
          <div className="overflow-x-auto">
            <McTable>
              <McTableHeader>
                <McTableRow>
                  <McTableHead>Member</McTableHead>
                  {COUNTS.map((count) => (
                    <McTableHead key={count.key} className="text-right">
                      {count.label}
                    </McTableHead>
                  ))}
                  <McTableHead className="text-right">Reviewed</McTableHead>
                  <McTableHead className="text-right">Recommended</McTableHead>
                  <McTableHead>Last active</McTableHead>
                </McTableRow>
              </McTableHeader>
              <McTableBody>
                {members.map((member) => (
                  <McTableRow key={member.actorId}>
                    <McTableCell>
                      <span className="flex max-w-64 items-center gap-2">
                        <span className="truncate font-medium text-foreground" title={member.name}>
                          {member.name}
                        </span>
                        {member.actorId === user.id && (
                          <McBadge variant="outline" size="sm">
                            You
                          </McBadge>
                        )}
                      </span>
                    </McTableCell>
                    {COUNTS.map((count) => (
                      <McTableCell key={count.key} className="text-right tabular-nums">
                        {member[count.key]}
                      </McTableCell>
                    ))}
                    <McTableCell className="text-right font-medium text-foreground tabular-nums">
                      {member.interview + member.accepted + member.rejected}
                    </McTableCell>
                    <McTableCell className="text-right tabular-nums">
                      {member.recommended > 0 ? (
                        <Link
                          href={`${adminRoutes.recommendations}${recommendationsQuery(DEFAULT_RECOMMENDATION_PARAMS, { by: [member.actorId] })}`}
                          className="rounded-sm font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-4 focus-visible:ring-ring"
                        >
                          {member.recommended}
                        </Link>
                      ) : (
                        0
                      )}
                    </McTableCell>
                    <McTableCell>
                      {formatDistanceToNow(member.lastActiveAt, { addSuffix: true })}
                    </McTableCell>
                  </McTableRow>
                ))}
              </McTableBody>
            </McTable>
          </div>
        ) : (
          <McDataTableEmpty
            icon={<UsersIcon />}
            title="No decision yet"
            description="HR members appear here after their first review or recommendation."
          />
        )}
      </McDataTableCard>
    </div>
  )
}
