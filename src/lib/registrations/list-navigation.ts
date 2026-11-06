import { REGISTRATIONS_PER_PAGE } from "@/lib/registrations/list-params"

/** A registration of an admin list, in the list's order. */
export type ListItem = { id: string; name: string }

/** A registration next to the current one, with the list page it is on. */
export type ListNeighbor = ListItem & { page: number }

export type ListNavigation = {
  previous: ListNeighbor | null
  next: ListNeighbor | null
  /** 1-based place of the current registration, `null` when it is no longer in the list. */
  position: number | null
  /** Registrations in the list, without the current one when it left it. */
  total: number
  /** List page of the current registration, or of where it was: its back link returns there. */
  page: number
}

function pageOf(index: number) {
  return Math.floor(Math.max(index, 0) / REGISTRATIONS_PER_PAGE) + 1
}

/**
 * Previous and next registrations of `currentId` in its list. `items` is the list in its order
 * with the current registration at its place, also when it left the list (`inList: false`, e.g.
 * reviewed out of its tab): the arrows then still lead to the registrations around that place.
 *
 * Scale: `items` is the whole list (ids and names, from `registrationListOrder` and
 * `recommendationListOrder`), loaded on every registration page: about 5 ms for 500 registrations.
 * If it ever gets slow, fetch only the neighbors instead: the first registration before and after
 * the current one's sort values (keyset, `$lt` / `$gt` on each sort field then `_id`, with the
 * list's collation), and the position as the count of those before it. More code per sort, which
 * is why the whole list is loaded while it stays small.
 */
export function listNavigation(
  items: ListItem[],
  currentId: string,
  inList: boolean,
): ListNavigation {
  // A registration listed once per recommendation (older data) keeps its first place.
  const seen = new Set<string>()
  const unique = items.filter((item) => !seen.has(item.id) && seen.add(item.id))
  const index = unique.findIndex((item) => item.id === currentId)
  if (index === -1) {
    return { previous: null, next: null, position: null, total: unique.length, page: 1 }
  }

  // Indexes in the list itself, which only holds the current registration when `inList`.
  const nextIndex = inList ? index + 1 : index
  const previous = unique[index - 1]
  const next = unique[index + 1]
  return {
    previous: previous ? { ...previous, page: pageOf(index - 1) } : null,
    next: next ? { ...next, page: pageOf(nextIndex) } : null,
    position: inList ? index + 1 : null,
    total: inList ? unique.length : unique.length - 1,
    page: pageOf(index),
  }
}
