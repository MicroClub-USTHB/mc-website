"use client"

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react"
import { useLenis } from "lenis/react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { XIcon } from "@/components/icons/x"
import { MessageInput } from "@/components/microbot/message-input"
import { MicroBotLauncher } from "@/components/microbot/microbot-launcher"
import { SuggestionChip } from "@/components/microbot/suggestion-chip"
import { ThinkingStatus } from "@/components/microbot/thinking-status"
import { MICROBOT_ERROR_ANSWER, MICROBOT_NAME, type MicroBotMessage } from "@/const/microbot"
import { EASE_OUT_EXPO } from "@/lib/easing"
import { ask } from "@/lib/microbot"
import { cn } from "@/lib/utils"

/** Below `sm` the panel covers the whole screen, so it behaves as a modal dialog. */
const PHONE_QUERY = "(width < 40rem)"

function subscribePhone(onChange: () => void) {
  const query = window.matchMedia(PHONE_QUERY)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

const isPhone = () => window.matchMedia(PHONE_QUERY).matches

/** Elements the Tab key can reach inside the panel. */
const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'

type MicroBotWidgetProps = {
  greeting: string
  placeholder: string
  suggestions: string[]
  maxFollowUps: number
}

/**
 * Client island of the Ask MicroBot assistant: open state, conversation and answer loading. Fixed
 * bottom right: launcher, and the panel above it, in a complementary
 * landmark outside `<main>`. The panel only renders while open, so the chat never adds content to
 * the page that search engines index.
 *
 * On phones the open panel covers the whole screen and is a modal dialog: focus stays inside it
 * and Lenis is stopped, so the page behind does not scroll (like the Event Hub card). Larger
 * screens keep it as a non-modal panel next to the page.
 */
export function MicroBotWidget({
  greeting,
  placeholder,
  suggestions,
  maxFollowUps,
}: MicroBotWidgetProps) {
  const panelId = useId()
  const reduceMotion = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<MicroBotMessage[]>([])
  const [loading, setLoading] = useState(false)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const nextId = useRef(0)
  const wasOpen = useRef(false)
  const lenis = useLenis()
  const phone = useSyncExternalStore(subscribePhone, isPhone, () => false)
  const modal = open && phone

  const close = useCallback(() => setOpen(false), [])

  // Back to the launcher once closed (after the render that shows it again on phones).
  useEffect(() => {
    if (!open && wasOpen.current) launcherRef.current?.focus()
    wasOpen.current = open
  }, [open])

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus({ preventScroll: true })
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, close])

  // Modal on phones: page scroll stopped, Tab cycles inside the panel.
  useEffect(() => {
    if (!modal) return
    lenis?.stop()
    const onKeyDown = (e: KeyboardEvent) => {
      const panel = panelRef.current
      if (e.key !== "Tab" || !panel) return
      // `:disabled` too: a disabled McButton keeps its `tabindex`.
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => !element.matches(":disabled"),
      )
      const first = focusable[0]
      const last = focusable.at(-1)
      if (!first || !last) return
      const inside = panel.contains(document.activeElement)
      if (e.shiftKey && (document.activeElement === first || !inside)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      lenis?.start()
    }
  }, [modal, lenis])

  useEffect(() => {
    const el = scrollRef.current
    el?.scrollTo({ top: el.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" })
  }, [messages, loading, open, reduceMotion])

  const send = async (question: string) => {
    const text = question.trim()
    if (!text || loading) return
    setMessages((m) => [...m, { id: nextId.current++, role: "user", text }])
    setLoading(true)
    let answer: string
    try {
      answer = await ask(text)
    } catch {
      answer = MICROBOT_ERROR_ANSWER
    }
    setMessages((m) => [...m, { id: nextId.current++, role: "bot", text: answer }])
    setLoading(false)
  }

  const asked = new Set(messages.filter((m) => m.role === "user").map((m) => m.text))
  const chips = suggestions
    .filter((s) => !asked.has(s))
    .slice(0, messages.length ? maxFollowUps : undefined)
  const showChips = !loading && chips.length > 0

  return (
    <aside
      aria-label={MICROBOT_NAME}
      className={cn(
        "pointer-events-none fixed right-4 bottom-4 z-30 flex flex-col items-end gap-7.5 sm:right-6 sm:bottom-6 lg:right-20 lg:bottom-16",
        open && "max-sm:z-60",
      )}
    >
      <AnimatePresence>
        {open && (
          <motion.section
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal={modal || undefined}
            aria-label={`${MICROBOT_NAME} assistant`}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
            style={{ transformOrigin: "bottom right" }}
            className={cn(
              "pointer-events-auto flex flex-col overflow-hidden rounded-[0.875rem] border bg-linear-to-b from-secondary to-background to-[87.6%]",
              "h-162.25 max-h-[calc(100dvh-11rem)] w-[min(30.9375rem,calc(100vw-2rem))] sm:w-[min(30.9375rem,calc(100vw-3rem))]",
              "max-sm:fixed max-sm:inset-0 max-sm:h-auto max-sm:max-h-none max-sm:w-auto max-sm:rounded-none max-sm:border-0",
            )}
          >
            <div
              ref={scrollRef}
              data-lenis-prevent
              role="log"
              aria-live="polite"
              aria-relevant="additions"
              className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 pt-6 pb-3.5 sm:px-6"
            >
              <button
                type="button"
                onClick={close}
                aria-label={`Close ${MICROBOT_NAME}`}
                className="sticky top-0 z-10 ml-auto grid size-6 shrink-0 cursor-pointer place-items-center rounded-sm text-foreground outline-none focus-visible:ring-4 focus-visible:ring-secondary"
              >
                <XIcon size={24} />
              </button>

              <div
                className={cn(
                  "flex flex-col gap-7.75 pt-6",
                  messages.length === 0 ? "mt-auto" : "mt-19",
                )}
              >
                {messages.length === 0 && (
                  <p className="w-78 max-w-full header-xs font-medium text-primary uppercase">
                    {greeting}
                  </p>
                )}

                {messages.map((message) =>
                  message.role === "user" ? (
                    <motion.p
                      key={message.id}
                      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                      className="max-w-[85%] self-end rounded-lg bg-foreground px-3.5 py-2.5 paragraph-md [overflow-wrap:anywhere] text-primary-foreground shadow-xs"
                    >
                      {message.text}
                    </motion.p>
                  ) : (
                    <motion.p
                      key={message.id}
                      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                      className="px-3 paragraph-md [overflow-wrap:anywhere] text-muted-foreground"
                    >
                      {message.text}
                    </motion.p>
                  ),
                )}

                {loading && <ThinkingStatus />}

                {showChips && (
                  <div className="flex flex-col items-start gap-3">
                    {chips.map((question) => (
                      <SuggestionChip key={question} onClick={() => send(question)}>
                        {question}
                      </SuggestionChip>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <MessageInput ref={inputRef} placeholder={placeholder} busy={loading} onSend={send} />
          </motion.section>
        )}
      </AnimatePresence>

      <MicroBotLauncher
        ref={launcherRef}
        onClick={() => (open ? close() : setOpen(true))}
        aria-label={open ? `Close ${MICROBOT_NAME}` : `Open ${MICROBOT_NAME}`}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className={cn("pointer-events-auto", open && "max-sm:hidden")}
      />
    </aside>
  )
}
