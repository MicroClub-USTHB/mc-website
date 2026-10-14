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

/** Canned answers of the mock `ask()`, keyed by suggested question. */
export const MICROBOT_ANSWERS: Record<string, string> = {
  [MICROBOT_SUGGESTIONS[0]]:
    "Micro Club brings students together around technology: IT, robotics and game development projects, workshops, events and a community to learn and build with.",
  [MICROBOT_SUGGESTIONS[1]]:
    "Yes. You do not need to know IT to join, Micro Club is also a place to learn from other members while working on projects.",
  [MICROBOT_SUGGESTIONS[2]]:
    "Reach out to the team through the Contact Us section and they will tell you how it works.",
  [MICROBOT_SUGGESTIONS[3]]:
    "In registrations, you can join us by pressing the JOIN button on top and filling the form.",
}

export const MICROBOT_FALLBACK_ANSWER =
  "I can't answer that yet. Please reach out to the team through the Contact Us section."

export const MICROBOT_ERROR_ANSWER = "Something went wrong. Please try again in a moment."

export type MicroBotMessage = {
  id: number
  role: "user" | "bot"
  text: string
}
