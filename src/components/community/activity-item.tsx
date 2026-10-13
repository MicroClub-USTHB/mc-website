import type { CommunityActivity } from "@/const/community"
import { cn } from "@/lib/utils"

/**
 * One activity row (Figma "MC Community"): number and title. The active row is highlighted and
 * shows its description; the others are cut to a fixed height that only reveals the top of the
 * title. The title button stretches over the whole row (`after:inset-0`).
 */
export function ActivityItem({
  activity,
  index,
  active,
  onOpen,
  onHover,
}: {
  activity: CommunityActivity
  index: number
  active: boolean
  onOpen: () => void
  onHover: (event: React.PointerEvent) => void
}) {
  const panelId = `community-activity-${index}`
  const tone = active ? "text-accent-foreground" : "text-muted-foreground"

  return (
    <li
      onPointerMove={onHover}
      className={cn(
        "relative grid grid-cols-[3rem_1fr] overflow-hidden border-b border-border sm:grid-cols-[8rem_1fr] lg:grid-cols-[12.5rem_1fr]",
        !active && "h-10 sm:h-11 lg:h-18",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "pt-2 header-xs tabular-nums transition-colors duration-300 sm:pt-2.5 sm:header-sm lg:pt-5 lg:header-md",
          tone,
        )}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="min-w-0">
        <h3 className="pt-2 header-sm sm:header-md lg:pt-5 lg:header-lg">
          <button
            type="button"
            aria-expanded={active}
            aria-controls={panelId}
            onClick={onOpen}
            className={cn(
              "cursor-[inherit] text-left transition-colors duration-300 outline-none after:absolute after:inset-0",
              "focus-visible:underline focus-visible:decoration-2 focus-visible:underline-offset-8",
              tone,
            )}
          >
            {activity.title}
          </button>
        </h3>

        <div
          id={panelId}
          inert={!active}
          className={cn(
            "pt-4 pb-4 transition-[opacity,translate] duration-400 ease-out-quart",
            !active && "translate-y-3 opacity-0",
          )}
        >
          <p className="paragraph-md text-foreground lg:max-w-262 lg:paragraph-lg">
            {activity.description}
          </p>
        </div>
      </div>
    </li>
  )
}
