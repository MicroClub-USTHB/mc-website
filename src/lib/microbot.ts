import { MICROBOT_ANSWERS, MICROBOT_FALLBACK_ANSWER } from "@/const/microbot"

/**
 * Asks MicroBot a question. Mock: answers from the canned list after a short delay.
 * Replace the body with the real backend call, the UI only depends on this signature.
 */
export async function ask(question: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 1200 + Math.random() * 1000))
  return MICROBOT_ANSWERS[question] ?? MICROBOT_FALLBACK_ANSWER
}
