import { MailIcon, MapPinIcon } from "lucide-react"

import {
  DiscordIcon,
  FacebookIcon,
  GitHubIcon,
  InstagramIcon,
  LinkedInIcon,
  MediumIcon,
  TikTokIcon,
} from "@/components/site-footer/brand-icons"
import type { ContactTile as ContactTileData, ContactTileId } from "@/const/site-footer"
import { cn } from "@/lib/utils"

/** Tile color and icon, as in Figma: chart blues for the club channels, cyan for the address. */
const TILE_STYLES: Record<
  ContactTileId,
  {
    className: string
    Icon: React.ComponentType<{ className?: string }>
  }
> = {
  instagram: {
    className: "bg-chart-1 text-muted",
    Icon: InstagramIcon,
  },
  facebook: {
    className: "bg-chart-3 text-muted",
    Icon: FacebookIcon,
  },
  tiktok: {
    className: "bg-chart-4 text-muted",
    Icon: TikTokIcon,
  },
  discord: {
    className: "bg-chart-5 text-muted",
    Icon: DiscordIcon,
  },
  linkedin: {
    className: "bg-chart-4 text-muted",
    Icon: LinkedInIcon,
  },
  github: {
    className: "bg-chart-1 text-muted",
    Icon: GitHubIcon,
  },
  medium: {
    className: "bg-chart-3 text-muted",
    Icon: MediumIcon,
  },
  email: { className: "bg-chart-2 text-muted", Icon: MailIcon },
  location: {
    className: "bg-accent-foreground text-accent",
    Icon: MapPinIcon,
  },
}

const NEW_TAB = " (opens in a new tab)"

/**
 * One footer contact tile (Figma: about 102px tall, 14.5px radius): a square icon tile for the
 * social and professional profiles, a wide icon + text tile for the email and the address. The
 * text is `header-sm` (Plus Jakarta Sans, medium).
 *
 * Sized in Figma px, scaled by `--u` (one Figma px) set by the footer, so the tiles shrink to fit
 * narrower screens. Marked `data-tile` for `FallingTiles`.
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
      className={cn(
        "flex h-[calc(101.83*var(--u))] items-center rounded-[calc(14.547*var(--u))] outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        tile.text
          ? "gap-[calc(9.698*var(--u))] px-[calc(29.095*var(--u))]"
          : "w-[calc(101.83*var(--u))] justify-center",
        className,
      )}
    >
      {tile.text ? (
        <>
          <Icon className="size-[calc(41.217*var(--u))] shrink-0" />
          <span className="p-[calc(12.123*var(--u))] font-heading text-[calc(30*var(--u))] leading-[calc(38.793*var(--u))] font-medium whitespace-nowrap">
            {tile.text}
            {tile.external && <span className="sr-only">{NEW_TAB}</span>}
          </span>
        </>
      ) : (
        <Icon className="size-[calc(53.34*var(--u))]" />
      )}
    </a>
  )
}
