import { describe, expect, it } from "vitest"

import { placeListQuery } from "@/lib/registrations/place"

describe("placeListQuery", () => {
  it("keeps the registrations list state", () => {
    expect(placeListQuery("?status=pending&page=3")).toBe("?status=pending&page=3")
  })

  it("keeps the recommendations list state and its origin", () => {
    expect(placeListQuery("?to=dev&to=it&from=recommendations")).toBe(
      "?to=dev&to=it&from=recommendations",
    )
  })

  it("drops unknown and invalid values", () => {
    expect(placeListQuery("?status=nope&page=-2&evil=1")).toBe("")
    expect(placeListQuery("")).toBe("")
  })
})
