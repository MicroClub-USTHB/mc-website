import { MailIcon, MapPinIcon } from "lucide-react"

import {
  DiscordIcon,
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
} from "@/components/site-footer/brand-icons"
import type { ContactTile as ContactTileData, ContactTileId } from "@/const/site-footer"
import { cn } from "@/lib/utils"

/** Tile color and icon, as in Figma: chart blues for the club channels, cyan for the address. */
const TILE_STYLES: Record<
  ContactTileId,
  { className: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  instagram: { className: "bg-chart-1 text-muted", Icon: InstagramIcon },
  facebook: { className: "bg-chart-3 text-muted", Icon: FacebookIcon },
  tiktok: { className: "bg-chart-4 text-muted", Icon: TikTokIcon },
  discord: { className: "bg-chart-5 text-muted", Icon: DiscordIcon },
  email: { className: "bg-chart-2 text-muted", Icon: MailIcon },
  location: { className: "bg-accent-foreground text-accent", Icon: MapPinIcon },
}

const NEW_TAB = " (opens in a new tab)"

/**
 * One footer contact tile (Figma: 84px tall, 12px radius): a square icon tile for the social
 * profiles, a wide icon + text tile for the email and the address.
 *
 * Sized and placed at its `pile` place in Figma px, scaled by `--u` (one Figma px) and offset by
 * `--pile-top`, both set by the footer, so the whole pile shrinks to fit phones. Text and icons
 * are `header-xs` and 36/44px at full size. Marked `data-tile` for `FallingTiles`.
 */
export function ContactTile({ tile }: { tile: ContactTileData }) {
  const { className, Icon } = TILE_STYLES[tile.id]

  return (
    <a
      href={tile.href}
      data-tile
      draggable={false}
      aria-label={tile.text ? undefined : `${tile.label}${tile.external ? NEW_TAB : ""}`}
      {...(tile.external && { target: "_blank", rel: "noopener noreferrer" })}
      style={{
        left: `calc(${tile.pile.x} * var(--u))`,
        top: `calc(var(--pile-top) + ${tile.pile.y} * var(--u))`,
      }}
      className={cn(
        "absolute flex h-[calc(84*var(--u))] items-center rounded-xl outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        tile.text
          ? "gap-[calc(16*var(--u))] pr-[calc(32*var(--u))] pl-[calc(24*var(--u))]"
          : "w-[calc(84*var(--u))] justify-center",
        className,
      )}
    >
      {tile.text ? (
        <>
          <Icon className="size-[calc(36*var(--u))] shrink-0" />
          <span className="font-heading text-[calc(24*var(--u))] leading-[calc(32*var(--u))] font-medium whitespace-nowrap">
            {tile.text}
            {tile.external && <span className="sr-only">{NEW_TAB}</span>}
          </span>
        </>
      ) : (
        <Icon className="size-[calc(44*var(--u))]" />
      )}
    </a>
  )
}
