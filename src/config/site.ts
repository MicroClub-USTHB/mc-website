export const siteConfig = {
  name: "Micro Club",
  description:
    "Micro Club is a student scientific club passionate about technology, innovation and community.",
  url: "https://www.microclub.info",
} as const

/** Pages other than the landing page. */
export const siteRoutes = {
  registrations: "/registrations",
} as const

/**
 * Pages drawn without the in-page "MICRO CLUB" wordmark, the footer and the chatbot (Figma: only
 * the toggle and the compact logo). The wordmark still shows while the menu is open.
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
