import Image from "next/image"

import { McButton } from "@/components/ui/mc-button"
import arrow from "@/assets/hero/headline/arrow.svg"

/** Time left before registrations close: zeros until the dates are set. */
const COUNTDOWN = "00D 00H 00M 00S"

/**
 * Figma "Button" (REGISTER BUTTON): "Register now" with the registration countdown pinned on its
 * top right corner, a white label outlined in primary. The button does nothing yet.
 */
export function Registration() {
  return (
    <div className="relative h-[64.275px] w-[259.176px]">
      <McButton
        type="button"
        size="xl"
        icon="trailing"
        iconDefinition={
          <span className="grid size-[19px] place-items-center">
            <Image src={arrow} alt="" unoptimized className="size-[11px] max-w-none -rotate-90" />
          </span>
        }
        className="absolute top-[16.28px] left-0 border-primary px-5 py-3 leading-6 shadow-[0_1px_2px_0_rgb(10_13_18/0.05)]"
      >
        REGISTER NOW
      </McButton>
      <p
        aria-label={`Registrations close in ${COUNTDOWN}`}
        className="pointer-events-none absolute top-0 left-[91.18px] text-[20.479px] leading-[31.855px] font-medium whitespace-nowrap text-primary-foreground [-webkit-text-stroke:13px_var(--color-primary)] [paint-order:stroke_fill]"
      >
        {COUNTDOWN}
      </p>
    </div>
  )
}
