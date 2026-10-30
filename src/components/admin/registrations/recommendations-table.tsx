import { format } from "date-fns"
import Link from "next/link"

import { SortHeader } from "@/components/admin/registrations/sort-header"
import { StatusBadge } from "@/components/admin/registrations/status-badge"
import {
  McTable,
  McTableBody,
  McTableCell,
  McTableHeader,
  McTableRow,
} from "@/components/ui/mc-data-table"
import { adminRoutes, registrationRoute } from "@/config/admin"
import { nextOrder } from "@/lib/registrations/list-params"
import type { RecommendationRow } from "@/lib/registrations/recommendation-list"
import {
  recommendationOriginQuery,
  recommendationsQuery,
  type RecommendationListParams,
  type RecommendationSort,
} from "@/lib/registrations/recommendation-params"
import { recommendationTargetName } from "@/lib/registrations/recommendations"

const COLUMNS: { sort: RecommendationSort; label: string }[] = [
  { sort: "applicant", label: "Applicant" },
  { sort: "by", label: "Recommended by" },
  { sort: "to", label: "Recommended to" },
  { sort: "status", label: "Status" },
  { sort: "submitted", label: "Submitted" },
]

/** One page of recommendations; the applicant's name opens their registration. */
export function RecommendationsTable({
  params,
  rows,
}: {
  params: RecommendationListParams
  rows: RecommendationRow[]
}) {
  const back = recommendationOriginQuery(params)

  return (
    <McTable>
      <McTableHeader>
        <McTableRow>
          {COLUMNS.map((column) => (
            <SortHeader
              key={column.sort}
              label={column.label}
              order={params.sort === column.sort ? params.order : null}
              href={`${adminRoutes.recommendations}${recommendationsQuery(params, {
                sort: column.sort,
                order: nextOrder(params, column.sort),
                page: 1,
              })}`}
            />
          ))}
        </McTableRow>
      </McTableHeader>
      <McTableBody>
        {rows.map((row) => (
          <McTableRow key={`${row.registrationId}-${row.actorId}`}>
            <McTableCell>
              <div className="flex min-w-48 flex-col">
                <Link
                  href={registrationRoute(row.registrationId, back)}
                  className="w-fit rounded-sm font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-4 focus-visible:ring-ring"
                >
                  {row.firstName} {row.lastName}
                </Link>
                <span className="text-muted-foreground">{row.email}</span>
              </div>
            </McTableCell>
            <McTableCell>{row.recommendedBy}</McTableCell>
            <McTableCell>{recommendationTargetName(row.recommendedTo)}</McTableCell>
            <McTableCell>
              <StatusBadge status={row.status} />
            </McTableCell>
            <McTableCell className="whitespace-nowrap">
              <time dateTime={row.submittedAt}>
                {format(new Date(row.submittedAt), "d MMM yyyy")}
              </time>
            </McTableCell>
          </McTableRow>
        ))}
      </McTableBody>
    </McTable>
  )
}
