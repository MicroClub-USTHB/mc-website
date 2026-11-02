import Form from "next/form"
import Link from "next/link"
import { SearchIcon, XIcon } from "lucide-react"

import { McButton } from "@/components/ui/mc-button"
import { McInput } from "@/components/ui/mc-input"
import { adminRoutes } from "@/config/admin"
import {
  DEFAULT_LIST_PARAMS,
  listQuery,
  type RegistrationListParams,
} from "@/lib/registrations/list-params"
import {
  REGISTRATION_STATUSES,
  REGISTRATION_STATUS_LABELS,
  type RegistrationStatus,
} from "@/lib/registrations/status"
import { cn } from "@/lib/utils"

type StatusCounts = Record<RegistrationStatus | "all", number>

/**
 * Search (submitted with Enter, back to page 1) and the status filter with its counts. Plain
 * links and a GET form: the server renders every state from the URL.
 */
export function RegistrationsToolbar({
  params,
  counts,
}: {
  params: RegistrationListParams
  counts: StatusCounts
}) {
  const filters: { status: RegistrationStatus | null; label: string; count: number }[] = [
    { status: null, label: "All", count: counts.all },
    ...REGISTRATION_STATUSES.map((status) => ({
      status,
      label: REGISTRATION_STATUS_LABELS[status],
      count: counts[status],
    })),
  ]
  const keepSort =
    params.sort !== DEFAULT_LIST_PARAMS.sort || params.order !== DEFAULT_LIST_PARAMS.order

  return (
    <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const active = params.status === filter.status
          return (
            <Link
              key={filter.label}
              href={`${adminRoutes.registrations}${listQuery(params, { status: filter.status, page: 1 })}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 paragraph-sm font-medium transition-colors outline-none focus-visible:ring-4 focus-visible:ring-ring",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {filter.label}
              <span className={cn("tabular-nums", active ? "opacity-80" : "text-foreground")}>
                {filter.count}
              </span>
            </Link>
          )
        })}
      </nav>

      <Form
        action={adminRoutes.registrations}
        className="flex w-full gap-2 lg:max-w-md"
        key={params.q}
      >
        {params.status && <input type="hidden" name="status" value={params.status} />}
        {keepSort && (
          <>
            <input type="hidden" name="sort" value={params.sort} />
            <input type="hidden" name="order" value={params.order} />
          </>
        )}
        <McInput
          type="search"
          name="q"
          defaultValue={params.q}
          placeholder="Name, email or Discord"
          aria-label="Search registrations"
          className="flex-1"
          addonStart={<SearchIcon className="size-4" />}
          addonEnd={
            params.q ? (
              <Link
                href={`${adminRoutes.registrations}${listQuery(params, { q: "", page: 1 })}`}
                aria-label="Clear the search"
                className="text-muted-foreground hover:text-foreground"
              >
                <XIcon className="size-4" />
              </Link>
            ) : undefined
          }
        />
        <McButton type="submit" variant="secondary">
          Search
        </McButton>
      </Form>
    </div>
  )
}
