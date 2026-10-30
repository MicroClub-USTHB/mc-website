import { CONTACT } from "@/const/contact"

export type ContactTileId =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "discord"
  | "linkedin"
  | "github"
  | "medium"
  | "email"
  | "location"

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

/** Micro Club was founded in 1985: the footer copyright says since when. */
export const FOUNDING_YEAR = 1985

/** "CS Faculty, USTHB, BP32, Bab Ezzouar", from the club address shared with Contact Us. */
const ADDRESS = `${CONTACT.address.streetAddress}, ${CONTACT.address.addressLocality}`

/** Social icon tiles (Figma "footer"). */
export const SOCIAL_TILES: ContactTile[] = [
  {
    id: "instagram",
    label: "Micro Club on Instagram",
    href: "https://www.instagram.com/microclub_usthb/",
    external: true,
  },
  {
    id: "facebook",
    label: "Micro Club on Facebook",
    href: "https://www.facebook.com/Micro.Club.USTHB/",
    external: true,
  },
  {
    id: "tiktok",
    label: "Micro Club on TikTok",
    href: "https://www.tiktok.com/@microclub_usthb",
    external: true,
  },
  {
    id: "discord",
    label: "Micro Club on Discord",
    href: CONTACT.discord,
    external: true,
  },
]

/** Wide contact tiles (Figma "footer"). */
export const CONTACT_TILES: ContactTile[] = [
  {
    id: "email",
    label: "Email",
    text: CONTACT.email,
    href: `mailto:${CONTACT.email}`,
    external: false,
  },
  {
    id: "location",
    label: "Address",
    text: ADDRESS,
    href: "https://maps.app.goo.gl/a5ErbmFrqt4nEYYP6",
    external: true,
  },
]

/** Professional profile icon tiles (Figma "footer"). */
export const PROFESSIONAL_LINKS: ContactTile[] = [
  {
    id: "linkedin",
    label: "Micro Club on LinkedIn",
    href: "https://www.linkedin.com/company/micro-club-usthb-85/",
    external: true,
  },
  {
    id: "github",
    label: "Micro Club on GitHub",
    href: "https://github.com/MicroClub-USTHB",
    external: true,
  },
  {
    id: "medium",
    label: "Micro Club on Medium",
    href: "https://medium.com/@microclub_usthb",
    external: true,
  },
]
