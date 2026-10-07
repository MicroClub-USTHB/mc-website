import Image from "next/image"

import type { Partner } from "@/const/trusted-by"

/**
 * One partner tile (Figma 224×170 at 1440px): logo centered and contained in a box of the same
 * proportions for every partner, so wide and square logos weigh alike; light accent on hover.
 * Its width is the shared `--logo-cell` (see `TrustedBy`).
 */
export function LogoCell({
  partner,
  decorative = false,
}: {
  partner: Partner
  decorative?: boolean
}) {
  return (
    <li className="grid aspect-224/170 w-(--logo-cell) shrink-0 place-items-center border border-border bg-background transition-colors duration-300 ease-out-quart hover:bg-accent">
      <div className="relative h-[46%] w-[72%]">
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
