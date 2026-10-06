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

export type EventCategory = "external" | "internal" | "co-organised"

/** Label shown above the chain for the active event's category. */
export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  external: "External Event",
  internal: "Internal Event",
  "co-organised": "Co-Organised Event",
}

export type FeaturedEvent = {
  /** Stable key, also used for DOM ids. */
  id: string
  /** Short name, in the event list and at the top right of the card (e.g. "GHCTF"). */
  name: string
  category: EventCategory
  /** Event photo: left half of the card and slanted slice in the section. */
  cover: EventSizedImage
  /* Card content (logo at the top left, description, link), optional until each event has it. */
  logo?: EventSizedImage
  description?: string
  link?: {
    label: string
    href: string
  }
}

/** Event photos exported from Figma (`public/EventsHub/<file>.svg`), all 251×282. */
function cover(file: string, alt: string): EventSizedImage {
  return { src: `/EventsHub/${file}.svg`, alt, width: 251, height: 282 }
}

const GHCTF: FeaturedEvent = {
  id: "ghctf",
  name: "GHCTF",
  category: "internal",
  cover: cover("GHCTF", "Participants solving challenges on their laptops during Green Hat CTF"),
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
 * Events shown in the Featured Events section, in display order (first = top right of the chain,
 * same order as the Figma event list).
 */
export const FEATURED_EVENTS: FeaturedEvent[] = [
  { id: "agc", name: "AGC", category: "external", cover: cover("AGC", "AGC event photo") },
  {
    id: "micro-hack",
    name: "Micro Hack",
    category: "external",
    cover: cover("MicroHack", "Micro Hack event photo"),
  },
  {
    id: "tatweer",
    name: "Tatweer",
    category: "external",
    cover: cover("Tatweer", "Tatweer event photo"),
  },
  { id: "dcf", name: "DCF", category: "external", cover: cover("DCF", "DCF event photo") },
  { id: "mctf", name: "MCTF", category: "co-organised", cover: cover("MCTF", "MCTF event photo") },
  { id: "mgv", name: "MGV", category: "external", cover: cover("MGV", "MGV event photo") },
  {
    id: "hackiwha",
    name: "Hackiwha",
    category: "internal",
    cover: cover("Hackiwha", "Hackiwha event photo"),
  },
  {
    id: "micro-code",
    name: "Micro Code",
    category: "internal",
    cover: cover("MicroCode", "Micro Code event photo"),
  },
  GHCTF,
  {
    id: "brandiha",
    name: "Brandiha",
    category: "internal",
    cover: cover("Brandiha", "Brandiha event photo"),
  },
  {
    id: "microjam",
    name: "MicroJam",
    category: "internal",
    cover: cover("MicroJam", "MicroJam event photo"),
  },
  { id: "msrc", name: "MSRC", category: "internal", cover: cover("MSRC", "MSRC event photo") },
  {
    id: "visual-crew",
    name: "Visual Crew",
    category: "internal",
    cover: cover("VisualCrew", "Visual Crew event photo"),
  },
  {
    id: "algeria-2-0",
    name: "Algeria 2.0",
    category: "co-organised",
    cover: cover("Algeria2.0", "Algeria 2.0 event photo"),
  },
  {
    id: "educktech",
    name: "Educteck",
    category: "co-organised",
    cover: cover("Educktech", "Educteck event photo"),
  },
  {
    id: "ict-africa-summit",
    name: "ICT Africa Summit",
    category: "co-organised",
    cover: cover("ICT", "ICT Africa Summit event photo"),
  },
  {
    id: "formatech-expo",
    name: "Formatech Expo",
    category: "co-organised",
    cover: cover("FormaTech", "Formatech Expo event photo"),
  },
]
