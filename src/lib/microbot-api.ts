import "server-only"

import { MICROBOT_MAX_LENGTH } from "@/const/microbot"

/** Deployed Micro Bot API (github.com/MicroClub-USTHB/micro-bot), overridable for local runs. */
const DEFAULT_API_URL = "https://micro-bot.microclub.info"
/** A whole answer (rewrite, retrieval, generation) rarely takes more than a few seconds. */
const TIMEOUT_MS = 60_000

/** Events of a streamed answer, as the API sends them (Server-Sent Events). */
export type MicroBotApiEvent =
  | { type: "delta"; text: string }
  /** The full answer (authoritative over the deltas) and the conversation to continue. */
  | { type: "done"; answer: string; conversationId: string }
  | { type: "error"; status: number; code: string }

/**
 * Data access layer of the Micro Bot API, the only module that reads its secret (`server-only`:
 * importing it from client code fails the build). Asks a question with `stream: true` and yields
 * the answer as it is written.
 *
 * Errors raised before the stream starts (auth, validation, the API's rate limit) come back as an
 * HTTP status and `{error: {code, message}}`; once streaming, they come as an `error` event. Both
 * end the iteration with one `error` event.
 */
export async function* streamAnswer(
  message: string,
  conversationId: string | undefined,
): AsyncGenerator<MicroBotApiEvent> {
  const apiKey = process.env.MICROBOT_API_KEY
  if (!apiKey) {
    console.error("MicroBot: MICROBOT_API_KEY is missing")
    yield { type: "error", status: 500, code: "not_configured" }
    return
  }
  const url = new URL("/api/v1/chat", process.env.MICROBOT_API_URL || DEFAULT_API_URL)

  let response: Response
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        message: message.slice(0, MICROBOT_MAX_LENGTH),
        conversation_id: conversationId,
        stream: true,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (error) {
    console.error("MicroBot: the API could not be reached", error)
    yield { type: "error", status: 503, code: "unreachable" }
    return
  }

  if (!response.ok || !response.body) {
    const body: unknown = await response.json().catch(() => null)
    const code = errorCode(body) ?? "http_error"
    console.error(`MicroBot: the API answered ${response.status} (${code})`)
    yield { type: "error", status: response.status, code }
    return
  }

  try {
    for await (const { event, data } of readEvents(response.body)) {
      if (event === "delta" && typeof data.text === "string") {
        yield { type: "delta", text: data.text }
      } else if (event === "done") {
        // Sources stay here: the answer already cites them inline as `[Title]`.
        yield {
          type: "done",
          answer: typeof data.answer === "string" ? data.answer : "",
          conversationId: typeof data.conversation_id === "string" ? data.conversation_id : "",
        }
        return
      } else if (event === "error") {
        const code = errorCode(data) ?? "stream_error"
        console.error(`MicroBot: the answer stream failed (${code})`)
        yield { type: "error", status: 502, code }
        return
      }
      // `meta` (the conversation id, repeated in `done`) needs nothing here.
    }
    // The stream ended without `done`: cut by the network or a timeout.
    yield { type: "error", status: 504, code: "incomplete" }
  } catch (error) {
    console.error("MicroBot: reading the answer stream failed", error)
    yield { type: "error", status: 504, code: "incomplete" }
  }
}

/** Parses a Server-Sent Events body into `{event, data}` pairs (`data` parsed as JSON). */
async function* readEvents(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true }).replace(/\r\n?/g, "\n")
    let boundary = buffer.indexOf("\n\n")
    while (boundary !== -1) {
      const block = buffer.slice(0, boundary)
      buffer = buffer.slice(boundary + 2)
      boundary = buffer.indexOf("\n\n")
      let event = "message"
      const data: string[] = []
      for (const line of block.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim()
        else if (line.startsWith("data:")) data.push(line.slice(5).replace(/^ /, ""))
      }
      if (!data.length) continue
      let parsed: unknown
      try {
        parsed = JSON.parse(data.join("\n"))
      } catch {
        continue
      }
      if (parsed && typeof parsed === "object") {
        yield { event, data: parsed as Record<string, unknown> }
      }
    }
  }
}

/** `code` of the API's `{error: {code, message}}` body, if that is what `body` is. */
function errorCode(body: unknown) {
  if (!body || typeof body !== "object" || !("error" in body)) return undefined
  const { error } = body as { error?: { code?: unknown } }
  return typeof error?.code === "string" ? error.code : undefined
}
