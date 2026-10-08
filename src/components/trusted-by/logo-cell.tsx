import Image from "next/image"

import type { Partner } from "@/const/trusted-by"
import { cn } from "@/lib/utils"

/**
 * One partner tile (Figma 224×172 at 1440px): logo centered at its Figma size, scaled with the
 * tile; accent background and ring border on hover. Its width is the shared `--logo-cell` (see
 * `TrustedBy`).
 *
 * `trackedHover`: in a moving row, CSS `:hover` goes stale (the browser only updates it when the
 * pointer moves), so the row sets `data-hovered` on the tile under the pointer instead.
 */
export function LogoCell({
  partner,
  decorative = false,
  trackedHover = false,
}: {
  partner: Partner
  decorative?: boolean
  trackedHover?: boolean
}) {
  return (
    <li
      // Names the partner in the title while hovered (see `HoveredPartnerName`).
      data-partner={partner.name}
      className={cn(
        "grid aspect-224/172 w-(--logo-cell) shrink-0 place-items-center border border-border bg-background transition-colors duration-300 ease-out-quart",
        trackedHover
          ? "data-hovered:border-ring data-hovered:bg-accent"
          : "hover:border-ring hover:bg-accent",
      )}
    >
      <div
        className="relative"
        style={{
          // Percentages of the tile's inner box (224×172 minus its 1px border).
          width: `${(partner.width / 222) * 100}%`,
          height: `${(partner.height / 170) * 100}%`,
        }}
      >
        <Image
          src={partner.logo}
          alt={decorative ? "" : partner.name}
          fill
          sizes="(min-width: 1024px) 11rem, 40vw"
          className="object-contain"
        />
      </div>
    </li>
  )
}
