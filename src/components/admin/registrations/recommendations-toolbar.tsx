import Form from "next/form"
import Link from "next/link"
import { SearchIcon, XIcon } from "lucide-react"

import { MultiSelectFilter } from "@/components/admin/registrations/multi-select-filter"
import { McButton } from "@/components/ui/mc-button"
import { McInput } from "@/components/ui/mc-input"
import { adminRoutes } from "@/config/admin"
import {
  DEFAULT_RECOMMENDATION_PARAMS,
  recommendationsQuery,
  type RecommendationListParams,
} from "@/lib/registrations/recommendation-params"
import { RECOMMENDATION_TARGETS } from "@/lib/registrations/recommendations"

const TARGET_OPTIONS = RECOMMENDATION_TARGETS.map((target) => ({
  value: target.id,
  label: target.label,
}))

/** Filters by section or department and by HR member, and the search submitted with Enter. */
export function RecommendationsToolbar({
  params,
  recommenders,
}: {
  params: RecommendationListParams
  recommenders: { value: string; label: string }[]
}) {
  const keepSort =
    params.sort !== DEFAULT_RECOMMENDATION_PARAMS.sort ||
    params.order !== DEFAULT_RECOMMENDATION_PARAMS.order
  const filtered = params.to.length > 0 || params.by.length > 0

  return (
    <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <MultiSelectFilter
          label="Recommended to"
          param="to"
          options={TARGET_OPTIONS}
          selected={params.to}
        />
        <MultiSelectFilter
          label="Recommended by"
          param="by"
          options={recommenders}
          selected={params.by}
        />
        {filtered && (
          <Link
            href={`${adminRoutes.recommendations}${recommendationsQuery(params, { to: [], by: [], page: 1 })}`}
            className="w-fit rounded-sm paragraph-sm font-medium whitespace-nowrap text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-4 focus-visible:ring-ring"
          >
            Clear filters
          </Link>
        )}
      </div>

      <Form
        action={adminRoutes.recommendations}
        className="flex w-full gap-2 lg:max-w-md"
        key={params.q}
      >
        {params.to.map((target) => (
          <input key={target} type="hidden" name="to" value={target} />
        ))}
        {params.by.map((actorId) => (
          <input key={actorId} type="hidden" name="by" value={actorId} />
        ))}
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
          aria-label="Search recommendations"
          className="flex-1"
          addonStart={<SearchIcon className="size-4" />}
          addonEnd={
            params.q ? (
              <Link
                href={`${adminRoutes.recommendations}${recommendationsQuery(params, { q: "", page: 1 })}`}
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
