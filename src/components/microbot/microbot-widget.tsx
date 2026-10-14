"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { XIcon } from "lucide-react"

import { MessageInput } from "@/components/microbot/message-input"
import { MicroBotLauncher } from "@/components/microbot/microbot-launcher"
import { SuggestionChip } from "@/components/microbot/suggestion-chip"
import { ThinkingStatus } from "@/components/microbot/thinking-status"
import { MICROBOT_ERROR_ANSWER, MICROBOT_NAME, type MicroBotMessage } from "@/const/microbot"
import { EASE_OUT_EXPO } from "@/lib/easing"
import { ask } from "@/lib/microbot"
import { cn } from "@/lib/utils"

type MicroBotWidgetProps = {
  greeting: string
  placeholder: string
  suggestions: string[]
  maxFollowUps: number
}

/**
 * Client island of the Ask MicroBot assistant: open state, conversation and answer loading. Fixed
 * bottom right: launcher, and the panel above it (full screen on phones).
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
  const nextId = useRef(0)

  const close = useCallback(() => {
    setOpen(false)
    launcherRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus({ preventScroll: true })
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, close])

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
    <div
      className={cn(
        "pointer-events-none fixed right-4 bottom-4 z-30 flex flex-col items-end gap-7.5 sm:right-6 sm:bottom-6 lg:right-20 lg:bottom-16",
        open && "max-sm:z-60",
      )}
    >
      <AnimatePresence>
        {open && (
          <motion.section
            id={panelId}
            role="dialog"
            aria-label={`${MICROBOT_NAME} assistant`}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
            style={{ transformOrigin: "bottom right" }}
            className={cn(
              "pointer-events-auto flex flex-col overflow-hidden rounded-[14px] border bg-linear-to-b from-secondary to-background to-[87.6%]",
              "h-162.25 max-h-[calc(100dvh-11rem)] w-[min(495px,calc(100vw-2rem))] sm:w-[min(495px,calc(100vw-3rem))]",
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
                <XIcon className="size-6" />
              </button>

              <div
                className={cn(
                  "flex flex-col gap-7.75 pt-6",
                  messages.length === 0 ? "mt-auto" : "mt-19",
                )}
              >
                {messages.length === 0 && (
                  <p className="w-78 max-w-full font-heading text-2xl leading-8 font-medium text-primary uppercase">
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
    </div>
  )
}
