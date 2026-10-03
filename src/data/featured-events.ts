export type ClubEvent = {
  slug: string
  name: string
  description: string
}

/** Events highlighted on the landing page (3-4 max). Full list lives on /events. */
export const featuredEvents: ClubEvent[] = [
  { slug: "tatweer", name: "Tatweer", description: "TODO: short description." },
  { slug: "mctf", name: "MCTF", description: "TODO: short description." },
  { slug: "mgv", name: "MGV", description: "TODO: short description." },
  { slug: "micro-hack", name: "Micro Hack", description: "TODO: short description." },
]
