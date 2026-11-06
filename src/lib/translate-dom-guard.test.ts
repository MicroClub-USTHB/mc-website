import { describe, expect, it } from "vitest"

import { guardDomAgainstTranslation } from "@/lib/translate-dom-guard"

type FakeNode = { name: string; parentNode: FakeNode | null }

const node = (name: string, parentNode: FakeNode | null = null): FakeNode => ({ name, parentNode })

/** A prototype whose native methods only record the calls they get, guarded. */
function guardedProto() {
  const calls: string[] = []
  const proto = {
    insertBefore(this: FakeNode, added: FakeNode, child: FakeNode | null) {
      calls.push(`insert ${added.name} into ${this.name} before ${child?.name ?? "end"}`)
      return added
    },
    removeChild(this: FakeNode, child: FakeNode) {
      calls.push(`remove ${child.name} from ${this.name}`)
      return child
    },
  }
  guardDomAgainstTranslation(proto as unknown as Pick<Node, "insertBefore" | "removeChild">)
  return { calls, proto }
}

describe("guardDomAgainstTranslation", () => {
  it("leaves calls on nodes still in place unchanged", () => {
    const { calls, proto } = guardedProto()
    const button = node("button")
    const label = node("label", button)
    const spinner = node("spinner")

    proto.insertBefore.call(button, spinner, label)
    proto.insertBefore.call(button, spinner, null)
    proto.removeChild.call(button, label)

    expect(calls).toEqual([
      "insert spinner into button before label",
      "insert spinner into button before end",
      "remove label from button",
    ])
  })

  it("inserts before the wrapper that now holds the reference node", () => {
    const { calls, proto } = guardedProto()
    const button = node("button")
    const font = node("font", button)
    const label = node("label", node("inner font", font))

    proto.insertBefore.call(button, node("spinner"), label)

    expect(calls).toEqual(["insert spinner into button before font"])
  })

  it("appends when the reference node left the page (replaced by the translation)", () => {
    const { calls, proto } = guardedProto()

    proto.insertBefore.call(node("button"), node("spinner"), node("label"))

    expect(calls).toEqual(["insert spinner into button before end"])
  })

  it("removes the wrapper that now holds the node", () => {
    const { calls, proto } = guardedProto()
    const dd = node("dd")
    const font = node("font", dd)
    const text = node("text", font)

    expect(proto.removeChild.call(dd, text)).toBe(text)
    expect(calls).toEqual(["remove font from dd"])
  })

  it("does nothing when the node to remove already left the page", () => {
    const { calls, proto } = guardedProto()
    const text = node("text")

    expect(proto.removeChild.call(node("dd"), text)).toBe(text)
    expect(calls).toEqual([])
  })

  it("guards a prototype only once", () => {
    const { calls, proto } = guardedProto()
    guardDomAgainstTranslation(proto as unknown as Pick<Node, "insertBefore" | "removeChild">)

    proto.insertBefore.call(node("button"), node("spinner"), node("label"))

    expect(calls).toEqual(["insert spinner into button before end"])
  })
})
