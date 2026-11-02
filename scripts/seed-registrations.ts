/**
 * Fills the LOCAL database with fake registrations, to test the admin registrations pages.
 * Refuses any database that is not on localhost. Running it again replaces the previous fake
 * registrations (their emails end with `@seed.test`); real ones are never touched.
 *
 *   pnpm db:seed-registrations [--count 40]
 *
 * The fake student IDs do not exist on Cloudinary: their page shows "File unavailable".
 */
import { parseArgs } from "node:util"

import { Types } from "mongoose"

import { connectToDatabase } from "@/lib/mongodb"
import { RegistrationModel } from "@/lib/registrations/model"
import { RECOMMENDATION_TARGETS } from "@/lib/registrations/recommendations"
import type { ReviewState } from "@/lib/registrations/status"
import {
  currentRecommendations,
  registrationStatus,
  type TimelineEntry,
} from "@/lib/registrations/timeline"

import { run } from "./run"

const SEED_EMAIL = /@seed\.test$/

/** Fake HR members: their reviews count, but nobody can sign in as them. */
const REVIEWERS = [
  { actorId: "seed-reviewer-1", actorName: "Meriem Haddad" },
  { actorId: "seed-reviewer-2", actorName: "Sofiane Mansouri" },
]
const RECOMMENDERS = [...REVIEWERS, { actorId: "seed-hr-3", actorName: "Yasmine Boudiaf" }]

/** The reviews of a registration, to get every status. */
const REVIEW_SETS: ReviewState[][] = [
  [],
  [],
  [],
  ["accepted"],
  ["rejected"],
  ["accepted", "accepted"],
  ["rejected", "rejected"],
  ["accepted", "interview"],
  ["rejected", "interview"],
  ["interview", "interview"],
  ["accepted", "rejected"],
]

const REVIEW_REASONS = [
  "Clear motivation and solid answers.",
  "Answers too short to judge.",
  "Strong profile, worth meeting in person.",
  "Interesting background, some doubts about availability.",
]

const FIRST_NAMES = [
  "Sara",
  "Yacine",
  "Amina",
  "Mohamed",
  "Lina",
  "Rayan",
  "Nour",
  "Walid",
  "Ines",
  "Karim",
  "Meriem",
  "Anis",
  "Yasmine",
  "Sofiane",
  "Imene",
  "Ayoub",
  "Lydia",
  "Hamza",
  "Rania",
  "Islam",
]
const LAST_NAMES = [
  "Belkacem",
  "Haddad",
  "Benali",
  "Mansouri",
  "Kaci",
  "Saidi",
  "Brahimi",
  "Zerrouki",
  "Ouali",
  "Cherif",
  "Hamidi",
  "Boudiaf",
  "Meziane",
  "Amrani",
  "Taleb",
  "Larbi",
]
const FIELDS = [
  "Computer Science",
  "Software Engineering",
  "Artificial Intelligence",
  "Electronics",
  "Telecommunications",
  "Mathematics",
  "Physics",
  "Information Systems",
]
const YEARS = ["L1", "L2", "L3", "M1", "M2", "PhD"]
const UNIVERSITIES = ["USTHB", "ESI", "ENSIA", "ENP", "Université d'Alger 1", "ESTIN"]
const SKILLS = [
  "React",
  "Python",
  "UI design",
  "Figma",
  "C++",
  "Machine learning",
  "Public speaking",
  "Video editing",
  "Arduino",
  "Node.js",
  "Unity",
  "Photography",
  "Marketing",
  "Writing",
  "Docker",
]
const SENTENCES = [
  "I love building things and learning from people who are better than me.",
  "I heard about Micro Club from friends who took part in its hackathons.",
  "Being in a club means showing up, sharing what you know and helping events happen.",
  "I can help with design, organizing workshops and welcoming new members.",
  "By the end of the year I want to have shipped a real project with a team.",
  "I expect to meet motivated people and to learn by doing.",
  "I already organized a few events in high school and enjoyed every part of it.",
  "I am curious about robotics and would like to build my first robot here.",
]

/** Same fake data on every run: a small seeded random generator (mulberry32). */
function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function assertLocalDatabase() {
  const uri = process.env.MONGODB_URI ?? ""
  const host = /^mongodb(?:\+srv)?:\/\/(?:[^@/]*@)?([^:/?,]+)/.exec(uri)?.[1]
  if (host !== "localhost" && host !== "127.0.0.1") {
    throw new Error(
      `Refusing to seed ${host ?? "an unknown database"}: only a local MONGODB_URI is allowed.`,
    )
  }
}

run(async () => {
  assertLocalDatabase()
  const { values } = parseArgs({ options: { count: { type: "string", default: "40" } } })
  const count = Math.min(Math.max(Number.parseInt(values.count, 10) || 40, 1), 500)

  const next = random(2026)
  const pick = <T>(items: readonly T[]) => items[Math.floor(next() * items.length)]
  const answer = () =>
    Array.from({ length: 1 + Math.floor(next() * 4) }, () => pick(SENTENCES)).join(" ")

  await connectToDatabase()
  const collection = RegistrationModel.collection
  const removed = await collection.deleteMany({ email: SEED_EMAIL })

  const now = Date.now()
  const documents = Array.from({ length: count }, (_, index) => {
    const firstName = pick(FIRST_NAMES)
    const lastName = pick(LAST_NAMES)
    const createdAt = new Date(now - Math.floor(next() * 21 * 24 * 60 * 60 * 1000))
    const timeline = pick(REVIEW_SETS).map((state, position): TimelineEntry => ({
      kind: "review",
      ...REVIEWERS[position],
      at: new Date(createdAt.getTime() + (position + 1) * 60 * 60 * 1000),
      state,
      reason: pick(REVIEW_REASONS),
    }))
    for (const recommender of RECOMMENDERS) {
      if (next() < 0.3) {
        timeline.push({
          kind: "recommendation",
          ...recommender,
          at: new Date(createdAt.getTime() + 3 * 60 * 60 * 1000),
          target: pick(RECOMMENDATION_TARGETS).id,
        })
      }
    }
    const isPdf = index % 4 === 0
    return {
      _id: new Types.ObjectId(),
      firstName,
      lastName,
      discord: `${firstName.toLowerCase()}_${index}`,
      phone: `+2135${String(Math.floor(next() * 1e8)).padStart(8, "0")}`,
      birthDate: new Date(
        Date.UTC(
          1998 + Math.floor(next() * 9),
          Math.floor(next() * 12),
          1 + Math.floor(next() * 28),
        ),
      ),
      email: `${firstName}.${lastName}.${index}@seed.test`.toLowerCase(),
      fieldOfStudy: pick(FIELDS),
      yearOfStudy: pick(YEARS),
      university: pick(UNIVERSITIES),
      studentId: {
        url: "",
        publicId: `microclub/registrations/student-ids/seed-${index}`,
        resourceType: "image",
        format: isPdf ? "pdf" : "jpg",
        bytes: 250_000,
      },
      answers: {
        aboutYou: answer(),
        knowAboutClub: answer(),
        beingInClub: answer(),
        canBring: answer(),
        yearGoals: answer(),
        expectations: answer(),
      },
      links: {
        portfolio: next() < 0.4 ? `https://${firstName.toLowerCase()}.dev` : "",
        behance: next() < 0.2 ? `https://www.behance.net/${firstName.toLowerCase()}${index}` : "",
        linkedin:
          next() < 0.6
            ? `https://www.linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`
            : "",
        github: next() < 0.5 ? `https://github.com/${firstName.toLowerCase()}${index}` : "",
      },
      skills: [...new Set(Array.from({ length: 1 + Math.floor(next() * 5) }, () => pick(SKILLS)))],
      status: registrationStatus(timeline),
      timeline,
      recommendations: currentRecommendations(timeline),
      createdAt,
      updatedAt: createdAt,
    }
  })

  await collection.insertMany(documents)
  await RegistrationModel.syncIndexes()
  console.info(
    `Inserted ${count} fake registrations${removed.deletedCount ? ` (replaced ${removed.deletedCount})` : ""}.`,
  )
})
