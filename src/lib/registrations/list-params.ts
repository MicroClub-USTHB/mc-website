import { isRegistrationStatus, type RegistrationStatus } from "@/lib/registrations/status"

/** Columns of the admin registrations table the server can sort by. */
export const REGISTRATION_SORTS = [
  "applicant",
  "fieldOfStudy",
  "yearOfStudy",
  "university",
  "status",
  "submitted",
] as const

export type RegistrationSort = (typeof REGISTRATION_SORTS)[number]
export type SortOrder = "asc" | "desc"

/** State of the admin registrations table, kept in the URL so links, refresh and back work. */
export type RegistrationListParams = {
  /** Search words, all required (first name, last name, email or Discord). */
  q: string
  status: RegistrationStatus | null
  sort: RegistrationSort
  order: SortOrder
  /** 1-based. */
  page: number
}

export const REGISTRATIONS_PER_PAGE = 20

export const DEFAULT_LIST_PARAMS: RegistrationListParams = {
  q: "",
  status: null,
  sort: "submitted",
  order: "desc",
  page: 1,
}

/** Longest search kept: the query becomes one regex per word. */
export const MAX_QUERY_LENGTH = 100

export type SearchParams = Record<string, string | string[] | undefined>

export function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

/** Reads the table state from the URL; anything invalid falls back to the default. */
export function parseListParams(searchParams: SearchParams): RegistrationListParams {
  const sort = first(searchParams.sort)
  const order = first(searchParams.order)
  const status = first(searchParams.status)
  const page = Number.parseInt(first(searchParams.page) ?? "", 10)
  const validSort = REGISTRATION_SORTS.includes(sort as RegistrationSort)

  return {
    q: (first(searchParams.q) ?? "").trim().slice(0, MAX_QUERY_LENGTH),
    status: isRegistrationStatus(status) ? status : null,
    sort: validSort ? (sort as RegistrationSort) : DEFAULT_LIST_PARAMS.sort,
    order: validSort && (order === "asc" || order === "desc") ? order : DEFAULT_LIST_PARAMS.order,
    page: Number.isFinite(page) && page > 1 ? page : 1,
  }
}

/** Query string (`?...`, or `""`) of the table state, without the default values. */
export function listQuery(
  params: RegistrationListParams,
  changes: Partial<RegistrationListParams> = {},
) {
  const next = { ...params, ...changes }
  const query = new URLSearchParams()
  if (next.q) query.set("q", next.q)
  if (next.status) query.set("status", next.status)
  if (next.sort !== DEFAULT_LIST_PARAMS.sort || next.order !== DEFAULT_LIST_PARAMS.order) {
    query.set("sort", next.sort)
    query.set("order", next.order)
  }
  if (next.page > 1) query.set("page", String(next.page))
  const text = query.toString()
  return text ? `?${text}` : ""
}

/** Order after clicking a column header: toggles the current column, starts others ascending. */
export function nextOrder<Sort extends string>(
  params: { sort: Sort; order: SortOrder },
  sort: Sort,
): SortOrder {
  if (params.sort !== sort) return "asc"
  return params.order === "asc" ? "desc" : "asc"
}
