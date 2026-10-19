export const MICROBOT_NAME = "MicroBot"

export const MICROBOT_GREETING = "This is MicroBot, how can I help you?"

export const MICROBOT_PLACEHOLDER = "Ask MicroBot ..."

/** Suggested questions shown as chips, in display order. */
export const MICROBOT_SUGGESTIONS = [
  "What can we do in Micro Club?",
  "I don't know IT, can I join the Club?",
  "I'm not a USTHB student, can I join the Club?",
  "How can I join the club?",
]

/** Chips shown again under an answer, so the next question is one click away. */
export const MICROBOT_MAX_FOLLOW_UPS = 3

/** Longest question the API accepts. */
export const MICROBOT_MAX_LENGTH = 2000

/** Shown in the chat when an answer cannot be given, by cause. */
export const MICROBOT_ERRORS = {
  busy: "MicroBot is answering a lot of questions right now. Please try again in a minute.",
  failed: "Something went wrong. Please try again in a moment.",
} as const

/** What the chat receives while MicroBot answers (see `askMicroBot`). */
export type MicroBotEvent =
  | { type: "delta"; text: string }
  | { type: "done"; answer: string; conversationId: string }
  | { type: "error"; message: string }

export type MicroBotMessage = {
  id: number
  role: "user" | "bot"
  text: string
  /** The answer is still being written. */
  streaming?: boolean
}
