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
  { id: "agc", name: "AGC", cover: cover("AGC", "AGC event photo") },
  { id: "micro-hack", name: "Micro Hack", cover: cover("MicroHack", "Micro Hack event photo") },
  { id: "tatweer", name: "Tatweer", cover: cover("Tatweer", "Tatweer event photo") },
  { id: "dcf", name: "DCF", cover: cover("DCF", "DCF event photo") },
  { id: "mctf", name: "MCTF", cover: cover("MCTF", "MCTF event photo") },
  { id: "mgv", name: "MGV", cover: cover("MGV", "MGV event photo") },
  { id: "hackiwha", name: "Hackiwha", cover: cover("Hackiwha", "Hackiwha event photo") },
  { id: "micro-code", name: "Micro Code", cover: cover("MicroCode", "Micro Code event photo") },
  GHCTF,
  { id: "brandiha", name: "Brandiha", cover: cover("Brandiha", "Brandiha event photo") },
  { id: "microjam", name: "MicroJam", cover: cover("MicroJam", "MicroJam event photo") },
  { id: "msrc", name: "MSRC", cover: cover("MSRC", "MSRC event photo") },
  { id: "visual-crew", name: "Visual Crew", cover: cover("VisualCrew", "Visual Crew event photo") },
  { id: "algeria-2-0", name: "Algeria 2.0", cover: cover("Algeria2.0", "Algeria 2.0 event photo") },
  { id: "educktech", name: "Educteck", cover: cover("Educktech", "Educteck event photo") },
  {
    id: "ict-africa-summit",
    name: "ICT Africa Summit",
    cover: cover("ICT", "ICT Africa Summit event photo"),
  },
  {
    id: "formatech-expo",
    name: "Formatech Expo",
    cover: cover("FormaTech", "Formatech Expo event photo"),
  },
]
