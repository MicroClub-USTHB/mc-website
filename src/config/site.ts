export const siteConfig = {
  name: "MicroClub",
  description:
    "MicroClub is a student scientific club passionate about technology, innovation and community.",
  url: "https://www.microclub.info",
} as const

/**
 * Landing page sections, in display order.
 * `id` is the DOM anchor used by the hamburger menu (`/#id`).
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
  { id: "microbot", label: "Ask MicroBot" },
  { id: "contact", label: "Contact Us" },
] as const

export type HomeSectionId = (typeof homeSections)[number]["id"]

/** Standalone pages reachable from the menu. */
export const sitePages = [
  { href: "/projects", label: "Projects" },
  { href: "/events", label: "Events" },
] as const
