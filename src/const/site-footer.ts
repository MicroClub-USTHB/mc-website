export type ContactTileId = "instagram" | "facebook" | "tiktok" | "discord" | "email" | "location"

export type ContactTile = {
  id: ContactTileId
  href: string
  /** Accessible name of the icon-only tiles. */
  label: string
  /** Visible text of the wide tiles (email, address), which also names the link. */
  text?: string
  /** Opens in a new tab (club profiles, maps). */
  external: boolean
}

export type ProfessionalLink = { label: string; href: string }

/** MicroClub was founded in 1985: the copyright counts the years of progress from it. */
export const FOUNDING_YEAR = 1985

export const CONTACT_EMAIL = "microclub.contact@usthb.edu.dz"

const ADDRESS = "CS Faculty, USTHB, BP32, Bab Ezzouar"

// TODO: confirm the Instagram, TikTok and Discord URLs with the club (Facebook is verified).
/** Social icon tiles (Figma "Footer"). */
export const SOCIAL_TILES: ContactTile[] = [
  {
    id: "instagram",
    label: "MicroClub on Instagram",
    href: "https://www.instagram.com/microclub_usthb/",
    external: true,
  },
  {
    id: "facebook",
    label: "MicroClub on Facebook",
    href: "https://www.facebook.com/Micro.Club.USTHB/",
    external: true,
  },
  {
    id: "tiktok",
    label: "MicroClub on TikTok",
    href: "https://www.tiktok.com/@microclub_usthb",
    external: true,
  },
  {
    id: "discord",
    label: "MicroClub on Discord",
    href: "https://discord.gg/microclub",
    external: true,
  },
]

/** Wide contact tiles (Figma "Footer"). */
export const CONTACT_TILES: ContactTile[] = [
  {
    id: "email",
    label: "Email",
    text: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    external: false,
  },
  {
    id: "location",
    label: "Address",
    text: ADDRESS,
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Faculté d'Informatique USTHB, Bab Ezzouar")}`,
    external: true,
  },
]

// TODO: confirm the Medium URL with the club (LinkedIn and GitHub are verified).
/** Footer "Professional Links" column. */
export const PROFESSIONAL_LINKS: ProfessionalLink[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/micro-club-usthb/" },
  { label: "Github", href: "https://github.com/MicroClub-USTHB" },
  { label: "Medium", href: "https://medium.com/@microclub" },
]
