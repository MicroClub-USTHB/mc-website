import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { DownloadIcon, InboxIcon, SearchXIcon } from "lucide-react"

import { ListPagination } from "@/components/admin/registrations/list-pagination"
import { MilestoneBanner } from "@/components/admin/team/milestone-banner"
import { NeedYouBanner } from "@/components/admin/team/need-you-banner"
import { ResumeBanner } from "@/components/admin/registrations/resume-banner"
import { RegistrationsTable } from "@/components/admin/registrations/registrations-table"
import { RegistrationsToolbar } from "@/components/admin/registrations/registrations-toolbar"
import { McButton } from "@/components/ui/mc-button"
import { McDataTableCard, McDataTableEmpty, McDataTableHeader } from "@/components/ui/mc-data-table"
import { adminRoutes } from "@/config/admin"
import { requireStaff } from "@/lib/auth/session"
import { listQuery, parseListParams } from "@/lib/registrations/list-params"
import { countRegistrationsByStatus, listRegistrations } from "@/lib/registrations/review"
import { reachedMilestone } from "@/lib/registrations/review-progress"
import { getReviewProgress } from "@/lib/registrations/review-progress-store"

export const metadata: Metadata = { title: "Registrations" }

/** HR home: every registration, searched, filtered, sorted and paged on the server from the URL. */
export default async function RegistrationsPage({
  searchParams,
}: PageProps<"/admin/registrations">) {
  const { user } = await requireStaff({ permissions: { registration: ["review"] } })

  const params = parseListParams(await searchParams)
  const [page, counts, progress] = await Promise.all([
    listRegistrations(params),
    countRegistrationsByStatus(),
    getReviewProgress(user.id),
  ])
  // A page past the end (e.g. after a search) shows the last one, at its own URL.
  if (page.page !== params.page) {
    redirect(`${adminRoutes.registrations}${listQuery(params, { page: page.page })}`)
  }
  const filtered = Boolean(params.q || params.status)

  return (
    <div className="mx-auto flex w-full max-w-site flex-col gap-6 px-4 py-12 sm:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="header-md font-heading text-foreground">Registrations</h1>
        <p className="paragraph-md text-muted-foreground">
          Everyone who applied to join the club. Open a registration to read it in full.
        </p>
      </div>

      <MilestoneBanner milestone={reachedMilestone(progress.team.percent)} />
      <ResumeBanner userId={user.id} />
      <NeedYouBanner count={progress.team.needYou} />

      <McDataTableCard>
        <McDataTableHeader
          title="Applications"
          badge={counts.all}
          description="Search with Enter. Click a column title to sort by it."
          actions={
            // Every page of the current search, tab and sort; a plain link, so the browser downloads.
            <McButton
              variant="secondary"
              size="sm"
              icon="leading"
              iconDefinition={<DownloadIcon className="size-4" />}
              nativeButton={false}
              render={
                <a
                  href={`${adminRoutes.registrations}/export${listQuery(params, { page: 1 })}`}
                  download
                />
              }
            >
              Export CSV{filtered ? ` (${page.total})` : ""}
            </McButton>
          }
        />
        <RegistrationsToolbar params={params} counts={counts} />
        {page.rows.length > 0 ? (
          <>
            <RegistrationsTable params={params} rows={page.rows} />
            <ListPagination
              page={page.page}
              pageCount={page.pageCount}
              total={page.total}
              href={(target) =>
                `${adminRoutes.registrations}${listQuery(params, { page: target })}`
              }
            />
          </>
        ) : filtered ? (
          <McDataTableEmpty
            icon={<SearchXIcon />}
            title="No registration matches"
            description="Check the spelling, or search with fewer words or another status."
          />
        ) : (
          <McDataTableEmpty
            icon={<InboxIcon />}
            title="No registration yet"
            description="Registrations appear here as soon as they are submitted."
          />
        )}
      </McDataTableCard>
    </div>
  )
}
