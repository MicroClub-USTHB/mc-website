import Link from "next/link"
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"

import { McButton } from "@/components/ui/mc-button"
import { adminRoutes } from "@/config/admin"
import {
  REGISTRATIONS_PER_PAGE,
  listQuery,
  type RegistrationListParams,
} from "@/lib/registrations/list-params"
import { cn } from "@/lib/utils"

/** Page numbers around the current one, with `null` for the gaps (1 … 4 5 6 … 20). */
function pageItems(page: number, pageCount: number): (number | null)[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1)
  if (page <= 4) return [1, 2, 3, 4, 5, null, pageCount]
  if (page >= pageCount - 3)
    return [1, null, ...Array.from({ length: 5 }, (_, index) => pageCount - 4 + index)]
  return [1, null, page - 1, page, page + 1, null, pageCount]
}

/** "Showing 21–40 of 312", then Previous, the page numbers and Next, all as links. */
export function RegistrationsPagination({
  params,
  page,
  pageCount,
  total,
}: {
  params: RegistrationListParams
  page: number
  pageCount: number
  total: number
}) {
  const href = (target: number) =>
    `${adminRoutes.registrations}${listQuery(params, { page: target })}`
  const from = (page - 1) * REGISTRATIONS_PER_PAGE + 1
  const to = Math.min(page * REGISTRATIONS_PER_PAGE, total)

  return (
    <nav
      aria-label="Pages"
      className="flex flex-col items-center gap-3 border-t border-border px-4 py-3 sm:flex-row sm:justify-between sm:px-6"
    >
      <p className="paragraph-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">
          {from}–{to}
        </span>{" "}
        of <span className="font-medium text-foreground">{total}</span>
      </p>
      {pageCount > 1 && (
        <div className="flex items-center gap-1">
          <McButton
            variant="secondary"
            size="sm"
            icon="leading"
            iconDefinition={<ArrowLeftIcon className="size-4" />}
            disabled={page === 1}
            nativeButton={false}
            render={page === 1 ? <span /> : <Link href={href(page - 1)} />}
          >
            Previous
          </McButton>
          <ol className="flex items-center gap-1">
            {pageItems(page, pageCount).map((item, index) =>
              item === null ? (
                <li key={`gap-${index}`} aria-hidden className="px-2 text-muted-foreground">
                  …
                </li>
              ) : (
                <li key={item}>
                  <Link
                    href={href(item)}
                    aria-current={item === page ? "page" : undefined}
                    aria-label={`Page ${item}`}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-lg paragraph-sm font-medium tabular-nums outline-none focus-visible:ring-4 focus-visible:ring-ring",
                      item === page
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {item}
                  </Link>
                </li>
              ),
            )}
          </ol>
          <McButton
            variant="secondary"
            size="sm"
            icon="trailing"
            iconDefinition={<ArrowRightIcon className="size-4" />}
            disabled={page === pageCount}
            nativeButton={false}
            render={page === pageCount ? <span /> : <Link href={href(page + 1)} />}
          >
            Next
          </McButton>
        </div>
      )}
    </nav>
  )
}
