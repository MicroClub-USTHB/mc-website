/** About Us paragraphs, in scroll order. They alternate left / right of the photo spiral. */
export const ABOUT_PARAGRAPHS: string[] = [
  "Founded in 1985 at USTHB, MicroClub stands out as the first scientific club in Algeria, recognized by the President as the best in 2024.",
  "Created by a group of passionate, curious and fun loving students who are dedicated to their craft.",
  "As a non-profit organization, MicroClub's vibrant community strives to make computer science accessible and exciting for all, hosting engaging events and providing targeted training.",
]

/** Club photos wrapped around the spiral, top to bottom (900 × 600 WebP, metadata stripped). */
export const ABOUT_PHOTOS: string[] = [
  "presidential-award",
  "faculty-group",
  "coding-night",
  "foosball",
  "micro-craft",
  "members",
  "laptop-code",
  "chess",
  "team-badges",
  "game-dev",
  "community-table",
  "choose-your-character",
  "3d-modeling",
  "team-outdoor",
  "club-room",
].map((name) => `/about/${name}.webp`)
