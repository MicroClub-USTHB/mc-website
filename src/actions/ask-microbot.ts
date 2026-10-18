"use server"

import "server-only"

import { headers } from "next/headers"

import { MICROBOT_ERRORS, MICROBOT_MAX_LENGTH, type MicroBotEvent } from "@/const/microbot"
import { streamAnswer } from "@/lib/microbot-api"
import { isRateLimited } from "@/lib/rate-limit"

/** Questions per visitor: plenty for a conversation, too few to drain the shared LLM quota. */
const RATE_LIMIT = { limit: 10, windowMs: 60 * 1000 }
/** Conversation ids are the API's UUIDs: anything else is dropped (a new conversation starts). */
const CONVERSATION_ID = /^[\w-]{1,100}$/

/**
 * Asks Micro Bot a question and streams its answer back to the chat: `delta` events as the answer
 * is written, then `done` with the full answer and the conversation id to send with the next
 * question, or a single `error` with a message to show.
 *
 * A Server Action, so the API key never leaves the server (it only lives in `lib/microbot-api`,
 * a `server-only` module) and only this site can call it: Next.js rejects requests whose
 * `Origin` is not this host. Like any action it is still a public endpoint, so its input is
 * validated and each visitor's IP is rate limited before the API (and its LLM quota) is reached.
 */
export async function askMicroBot(
  question: unknown,
  conversationId?: unknown,
): Promise<ReadableStream<MicroBotEvent>> {
  const message = typeof question === "string" ? question.trim() : ""
  if (!message || message.length > MICROBOT_MAX_LENGTH) return single(MICROBOT_ERRORS.failed)

  const requestHeaders = await headers()
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (isRateLimited(`microbot:${ip}`, RATE_LIMIT.limit, RATE_LIMIT.windowMs)) {
    return single(MICROBOT_ERRORS.busy)
  }

  const conversation =
    typeof conversationId === "string" && CONVERSATION_ID.test(conversationId)
      ? conversationId
      : undefined
  const events = streamAnswer(message, conversation)

  return new ReadableStream<MicroBotEvent>({
    async pull(controller) {
      const { done, value } = await events.next()
      if (done) return controller.close()
      if (value.type === "error") {
        // Details stay in the server logs; the visitor gets a plain sentence.
        controller.enqueue({
          type: "error",
          message: value.status === 429 ? MICROBOT_ERRORS.busy : MICROBOT_ERRORS.failed,
        })
        return controller.close()
      }
      controller.enqueue(value)
    },
    // The visitor left or closed the chat: stop reading the API's answer.
    async cancel() {
      await events.return(undefined)
    },
  })
}

/** A stream of one error event, for answers refused before reaching the API. */
function single(message: string) {
  return new ReadableStream<MicroBotEvent>({
    start(controller) {
      controller.enqueue({ type: "error", message })
      controller.close()
    },
  })
}
