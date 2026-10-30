import {
  MAX_QUERY_LENGTH,
  first,
  type SearchParams,
  type SortOrder,
} from "@/lib/registrations/list-params"
import { isRecommendationTarget } from "@/lib/registrations/recommendations"

/** Columns of the recommendations table the server can sort by. */
export const RECOMMENDATION_SORTS = ["applicant", "by", "to", "status", "submitted"] as const

export type RecommendationSort = (typeof RECOMMENDATION_SORTS)[number]

/** State of the recommendations table, kept in the URL so links, refresh and back work. */
export type RecommendationListParams = {
  /** Search words, all required (first name, last name, email or Discord). */
  q: string
  /** Sections and departments shown; all of them when empty. */
  to: string[]
  /** HR members shown, by account id; all of them when empty. */
  by: string[]
  sort: RecommendationSort
  order: SortOrder
  /** 1-based. */
  page: number
}

export const DEFAULT_RECOMMENDATION_PARAMS: RecommendationListParams = {
  q: "",
  to: [],
  by: [],
  sort: "submitted",
  order: "desc",
  page: 1,
}

/** `from` of a registration opened from this list: its back link returns here. */
export const RECOMMENDATIONS_ORIGIN = "recommendations"

/** Most values kept for one filter: more than every section and department or a real HR team. */
const MAX_FILTER_VALUES = 50

function all(value: string | string[] | undefined) {
  if (value === undefined) return []
  return (Array.isArray(value) ? value : [value]).slice(0, MAX_FILTER_VALUES)
}

/** Reads the table state from the URL; anything invalid falls back to the default. */
export function parseRecommendationParams(searchParams: SearchParams): RecommendationListParams {
  const sort = first(searchParams.sort)
  const order = first(searchParams.order)
  const page = Number.parseInt(first(searchParams.page) ?? "", 10)
  const validSort = RECOMMENDATION_SORTS.includes(sort as RecommendationSort)

  return {
    q: (first(searchParams.q) ?? "").trim().slice(0, MAX_QUERY_LENGTH),
    to: all(searchParams.to).filter(isRecommendationTarget),
    by: all(searchParams.by),
    sort: validSort ? (sort as RecommendationSort) : DEFAULT_RECOMMENDATION_PARAMS.sort,
    order:
      validSort && (order === "asc" || order === "desc")
        ? order
        : DEFAULT_RECOMMENDATION_PARAMS.order,
    page: Number.isFinite(page) && page > 1 ? page : 1,
  }
}

function toQuery(params: RecommendationListParams) {
  const query = new URLSearchParams()
  if (params.q) query.set("q", params.q)
  for (const target of params.to) query.append("to", target)
  for (const actorId of params.by) query.append("by", actorId)
  if (
    params.sort !== DEFAULT_RECOMMENDATION_PARAMS.sort ||
    params.order !== DEFAULT_RECOMMENDATION_PARAMS.order
  ) {
    query.set("sort", params.sort)
    query.set("order", params.order)
  }
  if (params.page > 1) query.set("page", String(params.page))
  return query
}

/** Query string (`?...`, or `""`) of the table state, without the default values. */
export function recommendationsQuery(
  params: RecommendationListParams,
  changes: Partial<RecommendationListParams> = {},
) {
  const text = toQuery({ ...params, ...changes }).toString()
  return text ? `?${text}` : ""
}

/** Query of a registration opened from the table: its back link returns to this state. */
export function recommendationOriginQuery(params: RecommendationListParams) {
  const query = toQuery(params)
  query.set("from", RECOMMENDATIONS_ORIGIN)
  return `?${query}`
}
