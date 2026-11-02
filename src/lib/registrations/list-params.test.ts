import { describe, expect, it } from "vitest"

import {
  DEFAULT_LIST_PARAMS,
  listQuery,
  MAX_QUERY_LENGTH,
  nextOrder,
  parseListParams,
} from "@/lib/registrations/list-params"

describe("parseListParams", () => {
  it("reads a valid table state", () => {
    expect(
      parseListParams({ q: " ana ", status: "accepted", sort: "status", order: "asc", page: "3" }),
    ).toEqual({ q: "ana", status: "accepted", sort: "status", order: "asc", page: 3 })
  })

  it("falls back to the defaults on anything invalid", () => {
    expect(parseListParams({ status: "maybe", sort: "password", order: "up", page: "-2" })).toEqual(
      DEFAULT_LIST_PARAMS,
    )
  })

  it("ignores the order of an unknown column", () => {
    expect(parseListParams({ sort: "nope", order: "asc" }).order).toBe(DEFAULT_LIST_PARAMS.order)
  })

  it("takes the first of repeated values and caps the search", () => {
    const params = parseListParams({ q: ["x".repeat(500), "y"], page: ["2", "9"] })
    expect(params.q).toHaveLength(MAX_QUERY_LENGTH)
    expect(params.page).toBe(2)
  })
})

describe("listQuery", () => {
  it("is empty for the default state", () => {
    expect(listQuery(DEFAULT_LIST_PARAMS)).toBe("")
  })

  it("keeps only what differs from the defaults", () => {
    expect(listQuery(DEFAULT_LIST_PARAMS, { q: "ana", page: 2 })).toBe("?q=ana&page=2")
  })

  it("round-trips through parseListParams", () => {
    const params = {
      q: "ana b",
      status: "conflict",
      sort: "university",
      order: "asc",
      page: 4,
    } as const
    const query = Object.fromEntries(new URLSearchParams(listQuery(params)))
    expect(parseListParams(query)).toEqual(params)
  })
})

describe("nextOrder", () => {
  it("toggles the current column and starts others ascending", () => {
    expect(nextOrder({ sort: "status", order: "asc" }, "status")).toBe("desc")
    expect(nextOrder({ sort: "status", order: "desc" }, "status")).toBe("asc")
    expect(nextOrder({ sort: "status", order: "desc" }, "submitted")).toBe("asc")
  })
})
