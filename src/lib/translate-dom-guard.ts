type GuardedMethods = Pick<Node, "insertBefore" | "removeChild">

const GUARDED = Symbol.for("mc.translate-dom-guard")

/** The direct child of `parent` that holds `node` (`node` itself or an ancestor), or `null`. */
function childHolding(parent: Node, node: Node): Node | null {
  let current: Node | null = node
  while (current && current.parentNode !== parent) current = current.parentNode
  return current
}

/**
 * Keeps React from crashing on pages rewritten by a browser translator (Chrome's Google Translate).
 * The translator replaces text nodes with its own `<font>` elements, so React later inserts before,
 * or removes, a node that is no longer where it left it, and the DOM throws `NotFoundError`
 * (facebook/react#11538). The page then falls to the error boundary: on the registration form,
 * right after SUBMIT, while the request still goes through.
 *
 * Instead of throwing, both calls fall back on the closest correct move: before (or remove) the
 * child of the parent that still holds the node, else append (or do nothing) when the node left
 * the page. Calls on nodes still in place run unchanged, so pages that are not translated never
 * reach the fallback. A text React updates after the rewrite can stay in its translated form.
 */
export function guardDomAgainstTranslation(proto: GuardedMethods = Node.prototype) {
  const target = proto as GuardedMethods & { [GUARDED]?: true }
  if (target[GUARDED]) return
  target[GUARDED] = true

  const { insertBefore, removeChild } = proto

  proto.insertBefore = function <T extends Node>(this: Node, node: T, child: Node | null): T {
    if (!child || child.parentNode === this) return insertBefore.call(this, node, child) as T
    return insertBefore.call(this, node, childHolding(this, child)) as T
  }

  proto.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode === this) return removeChild.call(this, child) as T
    const holder = childHolding(this, child)
    if (holder) removeChild.call(this, holder)
    return child
  }
}
