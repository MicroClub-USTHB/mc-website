import { useEffect, useEffectEvent, useRef } from "react"

import { useFeedbackModal } from "@/providers/feedback-modal-provider"

/** Marks the history entry pushed by the guard, so a second run never pushes another one. */
const HISTORY_MARKER = "mcUnsavedGuard"

/**
 * While `dirty`, stops every way out of the page from losing the visitor's answers by accident:
 * - a click on any link to another page (menu, logo, BACK, footer...) opens the warning modal,
 *   and "Leave anyway" replays the same click, so the link behaves as if nothing stood in between;
 * - the browser back button shows the same modal (the guard keeps one extra history entry);
 * - reload, closing the tab or typing another address shows the browser's own confirmation,
 *   which pages cannot restyle.
 */
export function useUnsavedChangesGuard(dirty: boolean) {
  const { showWarning } = useFeedbackModal()
  const leaving = useRef(false)

  const askToLeave = useEffectEvent((leave: () => void) => {
    showWarning({
      title: "Leave without submitting?",
      description:
        "You have unsaved changes. If you leave this page now your registration will not be sent, and your student ID upload will be lost.",
      actionLabel: "Keep editing",
      secondaryLabel: "Leave anyway",
      onSecondary: () => {
        leaving.current = true
        leave()
      },
    })
  })

  useEffect(() => {
    if (!dirty) return

    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (leaving.current) return
      event.preventDefault()
      // Some browsers only show the confirmation when a return value is set.
      event.returnValue = ""
    }

    function onClick(event: MouseEvent) {
      if (leaving.current || event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]")
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return

      // Other origins are left to the browser confirmation, same page anchors do not leave.
      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return

      // Capture phase on the document: runs before React and Next see the click.
      event.preventDefault()
      event.stopPropagation()
      askToLeave(() => anchor.click())
    }

    function onPopState() {
      if (leaving.current) return
      // Back landed on the entry before the guard's: step forward again and ask first.
      window.history.pushState({ [HISTORY_MARKER]: true }, "", window.location.href)
      askToLeave(() => window.history.go(-2))
    }

    if (!window.history.state?.[HISTORY_MARKER]) {
      window.history.pushState({ [HISTORY_MARKER]: true }, "", window.location.href)
    }

    window.addEventListener("beforeunload", onBeforeUnload)
    document.addEventListener("click", onClick, true)
    window.addEventListener("popstate", onPopState)
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload)
      document.removeEventListener("click", onClick, true)
      window.removeEventListener("popstate", onPopState)
    }
  }, [dirty])
}
