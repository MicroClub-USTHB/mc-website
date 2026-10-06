export type EventImage = {
  /** Path under `public/`. */
  src: string
  alt: string
}

export type EventSizedImage = EventImage & {
  /** Intrinsic size in px, used to reserve space and keep the aspect ratio. */
  width: number
  height: number
}

export type FeaturedEvent = {
  /** Stable key, also used for DOM ids. */
  id: string
  /** Short name shown at the top right of the card (e.g. "GHCTF"). */
  name: string
  /** Event photo: left half of the card and slanted slice in the section. */
  cover: EventSizedImage
  /** Event logo shown at the top left of the card. */
  logo: EventSizedImage
  description: string
  link: {
    label: string
    href: string
  }
}

const GHCTF: FeaturedEvent = {
  id: "ghctf",
  name: "GHCTF",
  cover: {
    src: "/EventsHub/GHCTF.svg",
    alt: "Participants solving challenges on their laptops during Green Hat CTF",
    width: 251,
    height: 282,
  },
  logo: {
    src: "/EventsHub/ghctf/logo.svg",
    alt: "Green Hat CTF",
    width: 76,
    height: 24,
  },
  description:
    "Green Hat CTF is MicroClub's internal cybersecurity competition. Participants solve hands-on challenges in pwning, reverse engineering, web exploitation, cryptography, and forensics. Real skills, real experience.",
  link: {
    label: "Relive GHCTF Recap Reel",
    href: "https://github.com/MicroClub-USTHB",
  },
}

/**
 * Events shown in the Featured Events section, in display order (first = top right of the chain).
 * TEST PHASE: one event duplicated to build the chain (16 events in Figma); replace with real ones.
 */
export const FEATURED_EVENTS: FeaturedEvent[] = Array.from({ length: 16 }, (_, index) => ({
  ...GHCTF,
  id: `${GHCTF.id}-${index + 1}`,
}))
