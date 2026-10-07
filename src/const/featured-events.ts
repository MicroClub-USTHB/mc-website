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

type Link = {
  label: string
  href: string
}

export type FeaturedEvent = {
  /** Stable key, also used for DOM ids. */
  id: string
  /** Short name, in the event list, the cursor badge and at the top right of the card. */
  name: string
  category: EventCategory
  /** Event photo: slanted slice in the chain and left half of the card. */
  cover: EventSizedImage
  /** Logo at the top left of the card (see `logo()`), `null` if the event has none. */
  logo: EventSizedImage | null
  /** Card text, left empty until written (the card then skips it). */
  description: string
  /** Links at the bottom of the card, in order; a link whose `href` is empty is skipped. */
  link: Link[]
}

/** Event photos exported from Figma (`public/EventsHub/<file>.svg`), all 251×282. */
function cover(file: string, alt: string): EventSizedImage {
  return { src: `/EventsHub/${file}.svg`, alt, width: 251, height: 282 }
}

/**
 * Event logos (`public/EventsHub/logos/<file>`), with their intrinsic size in px.
 * Example: `logo: logo("GHCTF.svg", "Green Hat CTF", 94, 34)` (file names are case-sensitive).
 */
export function logo(file: string, alt: string, width: number, height: number): EventSizedImage {
  return { src: `/EventsHub/logos/${file}`, alt, width, height }
}

/**
 * Events shown in the Featured Events section, in display order (first = top right of the chain,
 * same order as the Figma event list). Fill in `logo`, `description` and `link.href` per event.
 */
export const FEATURED_EVENTS: FeaturedEvent[] = [
  {
    id: "agc",
    name: "AGC",
    category: "external",
    cover: cover("AGC", "AGC event photo"),
    logo: logo("AGC.svg", "AGC", 85, 33),
    description: "Algeria Game Challenge is a national game development competition, launched in 2010 as the XNA Challenge with Microsoft. Now in its 10th edition, AGC is fully organized by MicroClub, bringing together game developers, gamers, and industry professionals through networking, gaming zones, and industry talks.",
    link: [{ label: "AGC Recap Reel", href: "#" }],
  },
  {
    id: "micro-hack",
    name: "Micro Hack",
    category: "external",
    cover: cover("MicroHack", "Micro Hack event photo"),
    logo: logo("MicroHack.svg", "Micro Hack", 77, 56),
    description: "MicroHack is a 3 day event now in its 3rd edition featuring activities, challenges, workshops, and a hackathon where participants from different fields collaborate to build digital solutions",
    link: [{ label: "Micro Hack Movie", href: "#" }, { label: "Microhack3.0", href: "#" }],
  },
  {
    id: "tatweer",
    name: "Tatweer",
    category: "external",
    cover: cover("Tatweer", "Tatweer event photo"),
    logo: logo("Tatweer.svg", "Tatweer", 94, 51),
    description: "Tatweer is a 4-day event organized by Micro Club and Freightmee, combining a logistics-focused hackathon, industry talks, pitching sessions, and a closing ceremony to inspire innovation and collaboration.",
    link: [{ label: "Tatweer Recap Reel Link", href: "#" },{ label: "Tatweer interview", href: "#" },{ label: "Tatweer Website", href: "#" }],
  },
  {
    id: "dcf",
    name: "DCF",
    category: "external",
    cover: cover("DCF", "DCF event photo"),
    logo: logo("DCF.svg", "DCF", 86, 25),
    description: "Djezzy Code Fest is a unique online hackathon organized by Micro Club in partnership with Djezzy. Held during Ramadan, participants code, innovate, and celebrate at a festive Iftar. ",
    link: [{ label: "Relive DCF Recap Reel", href: "#" },{ label: "DCF Website", href: "#" }],
  },
  {
    id: "mctf",
    name: "MCTF",
    category: "co-organised",
    cover: cover("MCTF", "MCTF event photo"),
    logo: logo("MCTF.svg", "MCTF", 79, 56),
    description: "MCTF is Micro Club’s flagship cybersecurity competition, featuring research-driven challenges in web exploitation, forensics, reverse engineering, and more, simulating real-world security scenarios for students and enthusiasts.",
    link: [{ label: "MCTF5.0 Website", href: "#" }],
  },
  {
    id: "mgv",
    name: "MGV",
    category: "external",
    cover: cover("MGV", "MGV event photo"),
    logo: logo("MGV.svg", "MGV", 74, 44),
    description: "MGV is Micro Club's ultimate design competition, uniting digital artists, motion designers, graphic designers, 3D artists, and UI/UX designers for an immersive creative experience.",
    link: [{ label: "Relive MGV Recap Post", href: "#" },{ label: "MGV Website", href: "#" }],
  },
  {
    id: "hackiwha",
    name: "Hackiwha",
    category: "internal",
    cover: cover("Hackiwha", "Hackiwha event photo"),
    logo: logo("Hackiwha.svg", "Hackiwha", 161, 27),
    description: "Hackiwha is an internal hackathon organized by Micro Club now in its 2nd edition . Over 3 days, teams innovate and develop digital solutions for a given problem statement. ",
    link: [{ label: "Relive Hackiwha Recap Reel", href: "#" }],
  },
  {
    id: "micro-code",
    name: "Micro Code",
    category: "internal",
    cover: cover("MicroCode", "Micro Code event photo"),
    logo: logo("MicroCode.svg", "Micro Code", 90, 38),
    description: "MicroCode is a coding competition now in its 2nd edition. Participants solve daily coding challenges, earn points on a live leaderboard, and compete for a spot at the IRL Finale. ",
    link: [{ label: "Relive Micro Code Recap Reel", href: "MicroCode Platform" }],
  },
  {
    id: "ghctf",
    name: "GHCTF",
    category: "internal",
    cover: cover("GHCTF", "Participants solving challenges on their laptops during Green Hat CTF"),
    logo: logo("GHCTF.svg", "Green Hat CTF", 94, 34),
    description:
      "Green Hat CTF is MicroClub's internal cybersecurity competition. Participants solve hands-on challenges in pwning, reverse engineering, web exploitation, cryptography, and forensics. Real skills, real experience.",
    // TODO: real recap URL (club GitHub as a placeholder until then).
    link: [{ label: "Relive GHCTF Recap Reel", href: "https://github.com/MicroClub-USTHB" }],
  },
  {
    id: "brandiha",
    name: "Brandiha",
    category: "internal",
    cover: cover("Brandiha", "Brandiha event photo"),
    logo: logo("BRANDIHA.svg", "Brandiha", 144, 36),
    description: "BRANDIHA is a fun 4-day branding competition created to introduce MC members to our 4 creative departments: Marketing, Multimedia, Design, and Communication. Through intense challenges, team projects, and a final pitch, participants learn the fundamentals of branding while building real skills in brand strategy, graphic design, multimedia production, and content creation.",
    link: [{ label: "Relive Brandiha Recap Reel", href: "#" }],
  },
  {
    id: "microjam",
    name: "MicroJam",
    category: "internal",
    cover: cover("MicroJam", "MicroJam event photo"),
    logo: logo("microjam.svg", "MicroJam", 85, 56),
    description: "MicroJam is an internal event now in its 3rd edition. Game development enthusiasts build their own games .The event ends with an art gallery day, giving game developers a chance to showcase their work and receive feedback. ",
    link: [{ label: "Relive MicroJam Recap Reel", href: "#" }],
  },
  {
    id: "msrc",
    name: "MSRC",
    category: "internal",
    cover: cover("MSRC", "MSRC event photo"),
    logo: logo("MSRC.svg", "MSRC", 112, 30),
    description: "MicroJam is an internal event now in its 3rd edition. Game development enthusiasts build their own games .The event ends with an art gallery day, giving game developers a chance to showcase their work and receive feedback. ",
    link: [{ label: "Relive MSRC Recap Reel", href: "#" }],
  },
  {
    id: "visual-crew",
    name: "Visual Crew",
    category: "internal",
    cover: cover("VisualCrew", "Visual Crew event photo"),
    logo: logo("VisualCrew.svg", "Visual Crew", 70, 52),
    description: "Visual Crew is an internal competition encouraging members of the Multimedia and Design departments . Participants compete across Graphic Design, UI/UX, Motion, and Video Editing. The event concludes with an art gallery day to showcase work and announce winners. ",
    link: [{ label: "Relive Visual Crew Recap Post", href: "#" }],
  },
  {
    id: "algeria-2-0",
    name: "Algeria 2.0",
    category: "co-organised",
    cover: cover("Algeria2.0", "Algeria 2.0 event photo"),
    logo: logo("Algeria2.0.svg", "Algeria 2.0", 93, 31),
    description: "Algeria 2.0 is a five-day event co-organized by Micro Club at Cyberparc Sidi Abdellah. It brings together innovators, industry leaders, and tech enthusiasts to explore digital transformation in AI, IoT, Web 3.0, Blockchain, and more. ",
    link: [{ label: "Relive Algeria 2.0 Recap ", href: "#" }],
  },
  {
    id: "educktech",
    name: "Educteck",
    category: "co-organised",
    cover: cover("Educktech", "Educteck event photo"),
    logo: logo("Educteck.svg", "Educteck", 106, 36),
    description: "EDUCTECK is an education and knowledge technologies fair co-organized by Micro Club at SAFEX. It brings together training professionals, equipment suppliers, and digital solution providers to strengthen Algeria's educational ecosystem in the digital era . ",
    link: [{ label: "Relive Educteck Recap ", href: "#" }],
  },
  {
    id: "ict-africa-summit",
    name: "ICT Africa Summit",
    category: "co-organised",
    cover: cover("ICT", "ICT Africa Summit event photo"),
    logo: logo("ICT.svg", "ICT Africa Summit", 107, 40),
    description: "MicroHack is a 3 day event now in its 3rd edition featuring activities, challenges, workshops, and a hackathon where participants from different fields collaborate to build digital solutions",
    link: [{ label: "Relive ICT Recap ", href: "#" }],
  },
  {
    id: "formatech-expo",
    name: "Formatech Expo",
    category: "co-organised",
    cover: cover("FormaTech", "Formatech Expo event photo"),
    logo: logo("FormaTech.svg", "Formatech Expo", 64, 44),
    description: "FormaTech Expo is an event co-organized by Micro Club that places training at the heart of digital transformation. It brings together companies, training institutions, incubators, startups, and innovators to promote solutions like online learning, ERP, CRM, and immersive technologies. ",
    link: [{ label: "Relive Formatech Expo Recap ", href: "#" }],
  },
]
