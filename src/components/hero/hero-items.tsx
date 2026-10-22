import { Activities } from "@/components/hero/activities"
import { ArCard } from "@/components/hero/ar-card"
import { Headline } from "@/components/hero/headline"
import { LevelUp } from "@/components/hero/level-up"
import { Photobooth } from "@/components/hero/photobooth"
import { VoiceNote } from "@/components/hero/voice-note"
import { Wins } from "@/components/hero/wins"
import { StickyNote } from "@/components/hero/sticky-note"
import { Playground } from "@/components/hero/playground"
import { Robotics } from "@/components/hero/robotics"
import { Stickers } from "@/components/hero/stickers"
import { TodoList } from "@/components/hero/todo-list"
import { HERO_ITEMS, type HeroCanvasItemId } from "@/const/hero"

const ITEMS: Partial<Record<HeroCanvasItemId, React.ComponentType>> = {
  "sticky-note": StickyNote,
  "todo-list": TodoList,
  photobooth: Photobooth,
  "voice-note": VoiceNote,
  "ar-card": ArCard,
  activities: Activities,
  wins: Wins,
  "level-up": LevelUp,
  robotics: Robotics,
  headline: Headline,
  playground: Playground,
  stickers: Stickers,
}

/** The canvas elements, each at its place from `HERO_ITEMS`. */
export function HeroItems() {
  return HERO_ITEMS.map(({ id, x, y, rotate = 0 }) => {
    const Item = ITEMS[id]
    if (!Item) return null
    return (
      <div
        key={id}
        className="absolute"
        style={{
          left: x,
          top: y,
          rotate: rotate ? `${rotate}deg` : undefined,
          transformOrigin: "0 0",
        }}
      >
        <Item />
      </div>
    )
  })
}
