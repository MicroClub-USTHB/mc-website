import { describe, expect, it } from "vitest"

import { listNavigation, type ListItem } from "@/lib/registrations/list-navigation"
import { REGISTRATIONS_PER_PAGE } from "@/lib/registrations/list-params"

function list(count: number): ListItem[] {
  return Array.from({ length: count }, (_, index) => ({ id: `r${index}`, name: `Name ${index}` }))
}

describe("listNavigation", () => {
  it("gives the neighbors and the place of a registration in its list", () => {
    expect(listNavigation(list(5), "r2", true)).toEqual({
      previous: { id: "r1", name: "Name 1", page: 1 },
      next: { id: "r3", name: "Name 3", page: 1 },
      position: 3,
      total: 5,
      page: 1,
    })
  })

  it("has no previous on the first registration and no next on the last", () => {
    expect(listNavigation(list(3), "r0", true).previous).toBeNull()
    expect(listNavigation(list(3), "r2", true).next).toBeNull()
  })

  it("follows the list across its pages", () => {
    const last = `r${REGISTRATIONS_PER_PAGE - 1}`
    const navigation = listNavigation(list(REGISTRATIONS_PER_PAGE + 5), last, true)
    expect(navigation.page).toBe(1)
    expect(navigation.next).toMatchObject({ id: `r${REGISTRATIONS_PER_PAGE}`, page: 2 })
  })

  it("keeps the neighbors of a registration that left the list, without its place", () => {
    const navigation = listNavigation(list(5), "r2", false)
    expect(navigation.previous?.id).toBe("r1")
    expect(navigation.next?.id).toBe("r3")
    expect(navigation.position).toBeNull()
    expect(navigation.total).toBe(4)
  })

  it("counts the pages of a list the current registration left", () => {
    // r20 is not in the list: r21 is the 21st registration of the list, the first of page 2.
    const navigation = listNavigation(list(30), `r${REGISTRATIONS_PER_PAGE}`, false)
    expect(navigation.previous?.page).toBe(1)
    expect(navigation.next?.page).toBe(2)
  })

  it("lists a registration once, at its first place", () => {
    const items = [...list(3), { id: "r1", name: "Name 1" }]
    expect(listNavigation(items, "r2", true)).toMatchObject({ next: null, total: 3, position: 3 })
  })

  it("has no neighbors when the registration is missing", () => {
    expect(listNavigation(list(3), "nope", true)).toMatchObject({
      previous: null,
      next: null,
      position: null,
    })
  })
})
