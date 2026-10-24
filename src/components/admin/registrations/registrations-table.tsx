import { format } from "date-fns"
import Link from "next/link"
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react"

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

const COLUMNS: { sort: RegistrationSort; label: string }[] = [
  { sort: "applicant", label: "Applicant" },
  { sort: "fieldOfStudy", label: "Field of study" },
  { sort: "yearOfStudy", label: "Year" },
  { sort: "university", label: "University" },
  { sort: "status", label: "Status" },
  { sort: "submitted", label: "Submitted" },
]

/** Column header linking to the table sorted by it: ascending first, then toggling. */
function SortHeader({
  params,
  sort,
  label,
}: {
  params: RegistrationListParams
  sort: RegistrationSort
  label: string
}) {
  const active = params.sort === sort
  const Icon = !active ? ArrowUpDownIcon : params.order === "asc" ? ArrowUpIcon : ArrowDownIcon
  return (
    <McTableHead
      aria-sort={active ? (params.order === "asc" ? "ascending" : "descending") : undefined}
    >
      <Link
        href={`${adminRoutes.registrations}${listQuery(params, { sort, order: nextOrder(params, sort), page: 1 })}`}
        className="inline-flex items-center gap-1 rounded-sm outline-none hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring aria-[current=true]:text-foreground"
        aria-current={active || undefined}
      >
        {label}
        <Icon className={active ? "size-3.5" : "size-3.5 opacity-40"} aria-hidden />
      </Link>
    </McTableHead>
  )
}

/** One page of registrations; the applicant's name opens their registration. */
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
          {COLUMNS.map((column) => (
            <SortHeader key={column.sort} params={params} {...column} />
          ))}
        </McTableRow>
      </McTableHeader>
      <McTableBody>
        {rows.map((row) => (
          <McTableRow key={row.id}>
            <McTableCell>
              <div className="flex min-w-48 flex-col">
                <Link
                  href={registrationRoute(row.id, back)}
                  className="w-fit rounded-sm font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-4 focus-visible:ring-ring"
                >
                  {row.firstName} {row.lastName}
                </Link>
                <span className="text-muted-foreground">{row.email}</span>
              </div>
            </McTableCell>
            <McTableCell>{row.fieldOfStudy}</McTableCell>
            <McTableCell>{row.yearOfStudy}</McTableCell>
            <McTableCell>{row.university}</McTableCell>
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
