import { format } from "date-fns"
import Link from "next/link"

import { Reviewers } from "@/components/admin/registrations/reviewers"
import { SortHeader } from "@/components/admin/registrations/sort-header"
import { StatusBadge } from "@/components/admin/registrations/status-badge"
import {
  McTable,
  McTableBody,
  McTableCell,
  McTableHead,
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

/** Columns: the sortable ones, and after Status who reviewed the application (unsorted). */
const COLUMNS: ({ sort: RecommendationSort; label: string } | { sort: null; label: string })[] = [
  { sort: "applicant", label: "Applicant" },
  { sort: "by", label: "Recommended by" },
  { sort: "to", label: "Recommended to" },
  { sort: "status", label: "Status" },
  { sort: null, label: "Reviewed by" },
  { sort: "submitted", label: "Submitted" },
]

/**
 * One page of recommendations; the applicant's name opens their registration. "Reviewed by" names
 * the HR members who decided on it and what they decided (see `Reviewers`).
 */
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
          {COLUMNS.map((column) =>
            column.sort === null ? (
              <McTableHead key={column.label}>{column.label}</McTableHead>
            ) : (
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
            ),
          )}
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
            <McTableCell>
              <Reviewers reviewers={row.reviewers} />
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
