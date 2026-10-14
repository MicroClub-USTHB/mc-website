import { MicroBotWidget } from "@/components/microbot/microbot-widget"
import {
  MICROBOT_GREETING,
  MICROBOT_MAX_FOLLOW_UPS,
  MICROBOT_PLACEHOLDER,
  MICROBOT_SUGGESTIONS,
} from "@/const/microbot"

/**
 * Ask MicroBot (Figma): chat assistant fixed at the bottom right of every page. Server Component:
 * the content comes from `src/const/microbot.ts`, the client island only holds the chat state.
 */
export function MicroBot() {
  return (
    <MicroBotWidget
      greeting={MICROBOT_GREETING}
      placeholder={MICROBOT_PLACEHOLDER}
      suggestions={MICROBOT_SUGGESTIONS}
      maxFollowUps={MICROBOT_MAX_FOLLOW_UPS}
    />
  )
}
