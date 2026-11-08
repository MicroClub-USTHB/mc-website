import { formatClubTime } from "@/lib/dates"
import Link from "next/link"

import { RecommendedBy } from "@/components/admin/registrations/recommended-by"
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
import {
  listQuery,
  nextOrder,
  type RegistrationListParams,
  type RegistrationSort,
} from "@/lib/registrations/list-params"
import type { RegistrationRow } from "@/lib/registrations/review"

/** Columns: the sortable ones, and after Status who reviewed and who recommended (unsorted). */
const COLUMNS: ({ sort: RegistrationSort; label: string } | { sort: null; label: string })[] = [
  { sort: "applicant", label: "Applicant" },
  { sort: "fieldOfStudy", label: "Field of study" },
  { sort: "yearOfStudy", label: "Year" },
  { sort: "university", label: "University" },
  { sort: "status", label: "Status" },
  { sort: null, label: "Reviewed by" },
  { sort: null, label: "Recommended by" },
  { sort: "submitted", label: "Submitted" },
]

/**
 * One page of registrations; the applicant's name opens their registration. "Reviewed by" names
 * the HR members who decided and what they decided, latest first (see `Reviewers`); "Recommended
 * by" its recommendation, by whom and where to (see `RecommendedBy`).
 */
export function RegistrationsTable({
  params,
  rows,
}: {
  params: RegistrationListParams
  rows: RegistrationRow[]
}) {
  const back = listQuery(params)

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
                href={`${adminRoutes.registrations}${listQuery(params, {
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
          <McTableRow key={row.id}>
            <McTableCell>
              <div className="flex max-w-72 min-w-48 flex-col">
                <Link
                  href={registrationRoute(row.id, back)}
                  className="w-fit max-w-full truncate rounded-sm font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-4 focus-visible:ring-ring"
                >
                  {row.firstName} {row.lastName}
                </Link>
                <span className="truncate text-muted-foreground" title={row.email}>
                  {row.email}
                </span>
              </div>
            </McTableCell>
            <McTableCell>
              <span className="block max-w-56 truncate" title={row.fieldOfStudy}>
                {row.fieldOfStudy}
              </span>
            </McTableCell>
            <McTableCell>{row.yearOfStudy}</McTableCell>
            <McTableCell>
              <span className="block max-w-56 truncate" title={row.university}>
                {row.university}
              </span>
            </McTableCell>
            <McTableCell>
              <StatusBadge status={row.status} />
            </McTableCell>
            <McTableCell>
              <Reviewers reviewers={row.reviewers} />
            </McTableCell>
            <McTableCell>
              <RecommendedBy recommendation={row.recommendation} />
            </McTableCell>
            <McTableCell className="whitespace-nowrap">
              <time dateTime={row.submittedAt}>
                {formatClubTime(new Date(row.submittedAt), "d MMM yyyy")}
              </time>
            </McTableCell>
          </McTableRow>
        ))}
      </McTableBody>
    </McTable>
  )
}
