import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { SearchXIcon, StarIcon } from "lucide-react"

import { ListPagination } from "@/components/admin/registrations/list-pagination"
import { RecommendationsTable } from "@/components/admin/registrations/recommendations-table"
import { RecommendationsToolbar } from "@/components/admin/registrations/recommendations-toolbar"
import { McDataTableCard, McDataTableEmpty, McDataTableHeader } from "@/components/ui/mc-data-table"
import { adminRoutes } from "@/config/admin"
import { requireStaff } from "@/lib/auth/session"
import {
  listRecommendations,
  recommendationsOverview,
} from "@/lib/registrations/recommendation-list"
import {
  parseRecommendationParams,
  recommendationsQuery,
} from "@/lib/registrations/recommendation-params"

export const metadata: Metadata = { title: "Recommendations" }

/** Who was recommended where, searched, filtered, sorted and paged on the server from the URL. */
export default async function RecommendationsPage({
  searchParams,
}: PageProps<"/admin/recommendations">) {
  await requireStaff({ permissions: { registration: ["review"] } })

  const params = parseRecommendationParams(await searchParams)
  const [page, overview] = await Promise.all([
    listRecommendations(params),
    recommendationsOverview(),
  ])
  // A page past the end (e.g. after a search) shows the last one, at its own URL.
  if (page.page !== params.page) {
    redirect(`${adminRoutes.recommendations}${recommendationsQuery(params, { page: page.page })}`)
  }
  const filtered = Boolean(params.q || params.to.length > 0 || params.by.length > 0)

  return (
    <div className="mx-auto flex w-full max-w-site flex-col gap-6 px-4 py-12 sm:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="header-md font-heading text-foreground">Recommendations</h1>
        <p className="paragraph-md text-muted-foreground">
          Applicants HR members recommended to a section or a department. Open one to read their
          registration and the note.
        </p>
      </div>

      <McDataTableCard>
        <McDataTableHeader
          title="Recommendations"
          badge={overview.total}
          description="Search with Enter. Click a column title to sort by it."
        />
        <RecommendationsToolbar params={params} recommenders={overview.recommenders} />
        {page.rows.length > 0 ? (
          <>
            <RecommendationsTable params={params} rows={page.rows} />
            <ListPagination
              page={page.page}
              pageCount={page.pageCount}
              total={page.total}
              href={(target) =>
                `${adminRoutes.recommendations}${recommendationsQuery(params, { page: target })}`
              }
            />
          </>
        ) : filtered ? (
          <McDataTableEmpty
            icon={<SearchXIcon />}
            title="No recommendation matches"
            description="Check the spelling, or try other filters."
          />
        ) : (
          <McDataTableEmpty
            icon={<StarIcon />}
            title="No recommendation yet"
            description="Recommendations appear here as soon as an HR member makes one."
          />
        )}
      </McDataTableCard>
    </div>
  )
}
