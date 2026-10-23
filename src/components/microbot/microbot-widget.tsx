"use client"

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react"
import { useLenis } from "lenis/react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { XIcon } from "@/components/icons/x"
import { AnswerText } from "@/components/microbot/answer-text"
import { MessageInput } from "@/components/microbot/message-input"
import { MicroBotLauncher } from "@/components/microbot/microbot-launcher"
import { SuggestionChip } from "@/components/microbot/suggestion-chip"
import { ThinkingStatus } from "@/components/microbot/thinking-status"
import { askMicroBot } from "@/actions/ask-microbot"
import { MICROBOT_ERRORS, MICROBOT_NAME, type MicroBotMessage } from "@/const/microbot"
import { EASE_OUT_EXPO } from "@/lib/easing"
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
 * Client island of the Ask Micro Bot assistant: open state, conversation and answer loading. Answers
 * come from the Micro Bot API through the `askMicroBot` Server Action, streamed as they are
 * written; the conversation id it returns is sent with the next question, so follow-ups keep
 * their context (the API forgets a conversation after 30 idle minutes and starts a new one). Fixed
 * bottom right: launcher, and the panel above it, in a complementary
 * landmark outside `<main>`. The panel only renders while open, so the chat never adds content to
 * the page that search engines index.
 *
 * On phones the open panel covers the whole screen and is a modal dialog: focus stays inside it
 * and the page behind is pinned, so it does not scroll (like the Event Hub card). The panel
 * follows the visual viewport, so the on-screen keyboard shrinks it instead of uncovering the page. Larger
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
  const conversationId = useRef<string | undefined>(undefined)
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

    // The page behind stays put, touch scrolling included (iOS scrolls past `overflow: hidden`
    // on the root): the body is pinned at its scroll position, and put back when closed.
    const scrollY = window.scrollY
    const body = document.body.style
    const saved = { position: body.position, top: body.top, left: body.left, right: body.right }
    Object.assign(body, { position: "fixed", top: `-${scrollY}px`, left: "0", right: "0" })

    // The panel covers what is visible: the visual viewport, which the on-screen keyboard
    // shrinks (and iOS pans) while the layout viewport, that `fixed` follows, does not.
    const viewport = window.visualViewport
    const panel = panelRef.current
    const fit = () => {
      if (!viewport || !panel) return
      panel.style.top = `${viewport.offsetTop}px`
      panel.style.bottom = "auto"
      panel.style.height = `${viewport.height}px`
    }
    fit()
    viewport?.addEventListener("resize", fit)
    viewport?.addEventListener("scroll", fit)

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      viewport?.removeEventListener("resize", fit)
      viewport?.removeEventListener("scroll", fit)
      // Back to the CSS sizes (the panel may stay open past `sm`, as a floating panel).
      if (panel) Object.assign(panel.style, { top: "", bottom: "", height: "" })
      Object.assign(body, saved)
      window.scrollTo(0, scrollY)
      lenis?.start()
    }
  }, [modal, lenis])

  useEffect(() => {
    const el = scrollRef.current
    el?.scrollTo({ top: el.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" })
  }, [messages, loading, open, reduceMotion])

  /** Updates the answer being written (the last message), or starts it. */
  const writeAnswer = (id: number, update: (text: string) => string, streaming: boolean) =>
    setMessages((m) =>
      m.some((message) => message.id === id)
        ? m.map((message) =>
            message.id === id ? { ...message, text: update(message.text), streaming } : message,
          )
        : [...m, { id, role: "bot", text: update(""), streaming }],
    )

  const send = async (question: string) => {
    const text = question.trim()
    if (!text || loading) return
    setMessages((m) => [...m, { id: nextId.current++, role: "user", text }])
    setLoading(true)
    const answerId = nextId.current++
    try {
      const reader = (await askMicroBot(text, conversationId.current)).getReader()
      for (;;) {
        const { done, value: event } = await reader.read()
        if (done) break
        if (event.type === "delta") {
          // The thinking status gives way to the answer as soon as it starts.
          setLoading(false)
          writeAnswer(answerId, (answer) => answer + event.text, true)
        } else if (event.type === "done") {
          conversationId.current = event.conversationId || conversationId.current
          writeAnswer(answerId, () => event.answer, false)
        } else {
          writeAnswer(answerId, () => event.message, false)
        }
      }
    } catch {
      writeAnswer(answerId, () => MICROBOT_ERRORS.failed, false)
    } finally {
      setLoading(false)
    }
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
                      dir="auto"
                      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                      className="max-w-[85%] self-end rounded-lg bg-foreground px-3.5 py-2.5 paragraph-md [overflow-wrap:anywhere] text-primary-foreground shadow-xs"
                    >
                      {message.text}
                    </motion.p>
                  ) : (
                    <motion.div
                      key={message.id}
                      // Announced once complete, not word by word while it is written.
                      aria-busy={message.streaming || undefined}
                      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                      className="px-3"
                    >
                      <AnswerText text={message.text} streaming={message.streaming} />
                    </motion.div>
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
