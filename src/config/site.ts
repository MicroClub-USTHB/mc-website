export const siteConfig = {
  name: "Micro Club",
  /** Title of the landing page in search results and shared previews (under 60 characters). */
  title: "Micro Club | First Student Scientific Club in Algeria",
  /** Search results and shared previews cut a description past about 155 characters. */
  description:
    "Micro Club, the first student scientific club in Algeria (USTHB, 1985): workshops, hackathons, events and projects in development, games, robotics and design.",
  url: "https://www.microclub.info",
  /** Founding year, for structured data. */
  foundingDate: "1985",
} as const

/** Pages other than the landing page. */
export const siteRoutes = {
  registrations: "/registrations",
} as const

/**
 * Pages drawn without the in-page "MICRO CLUB" wordmark (Figma shows only the toggle and the compact
 * logo). Their route group has its own layout, without footer and chatbot.
 */
export function isBarePage(pathname: string) {
  return pathname === siteRoutes.registrations
}

/**
 * Landing page sections, in display order.
 * `id` is the DOM anchor of each section (`/#id`).
 */
export const homeSections = [
  { id: "hero", label: "Home" },
  { id: "about", label: "About Us" },
  { id: "statistics", label: "Statistics" },
  { id: "club-sections", label: "Our Sections" },
  { id: "featured-projects", label: "What We've Built" },
  { id: "departments", label: "Our Departments" },
  { id: "featured-events", label: "Featured Events" },
  { id: "trusted-by", label: "Trusted By" },
  { id: "community", label: "MC Community" },
  { id: "contact", label: "Contact Us" },
] as const

export type HomeSectionId = (typeof homeSections)[number]["id"]

/** Hamburger menu links (Figma "Menu Bar"), in display order. */
export const menuLinks: { id: HomeSectionId; label: string }[] = [
  { id: "about", label: "About Us" },
  { id: "club-sections", label: "Our Sections" },
  { id: "departments", label: "Our Departments" },
  { id: "featured-projects", label: "Hall of Projects" },
  { id: "featured-events", label: "Event Hub" },
  { id: "contact", label: "Contact Us" },
]

/** Footer "Navigation" column links (Figma "Footer"), in display order. */
export const footerLinks: { id: HomeSectionId; label: string }[] = [
  { id: "hero", label: "Home" },
  { id: "about", label: "About Us" },
  { id: "statistics", label: "Statistics" },
  { id: "featured-events", label: "Our Events" },
  { id: "featured-projects", label: "Our Projects" },
  { id: "community", label: "MC Community" },
  { id: "club-sections", label: "Our Sections" },
  { id: "departments", label: "Our Departments" },
]
