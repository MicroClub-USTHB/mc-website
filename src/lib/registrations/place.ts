import {
  RECOMMENDATIONS_ORIGIN,
  parseRecommendationParams,
  recommendationOriginQuery,
} from "@/lib/registrations/recommendation-params"
import { listQuery, parseListParams, type SearchParams } from "@/lib/registrations/list-params"

/**
 * An HR member's place: the registration they last reviewed, recommended or marked, and the list
 * they were walking through, so the registrations page can take them back to it.
 */
export type PlaceSource = "review" | "recommendation" | "mark"

/** Where a place came from, in the resume banner ("you reviewed it 5 minutes ago"). */
export const PLACE_SOURCE_LABELS: Record<PlaceSource, string> = {
  review: "You reviewed",
  recommendation: "You recommended",
  mark: "You marked",
}

/**
 * The list query of a registration page (`location.search`), rebuilt from its valid values only:
 * it comes from the browser and is stored, then put back in a link.
 */
export function placeListQuery(search: string) {
  const params: SearchParams = {}
  for (const [key, value] of new URLSearchParams(search.slice(0, 2000))) {
    const previous = params[key]
    params[key] = previous === undefined ? value : [previous, value].flat()
  }
  if (params.from === RECOMMENDATIONS_ORIGIN) {
    return recommendationOriginQuery(parseRecommendationParams(params))
  }
  return listQuery(parseListParams(params))
}
