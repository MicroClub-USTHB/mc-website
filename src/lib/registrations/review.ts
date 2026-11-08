import "server-only"

import { isValidObjectId, type SortOrder as MongooseSortOrder } from "mongoose"

import { connectToDatabase } from "@/lib/mongodb"
import {
  REGISTRATIONS_PER_PAGE,
  type RegistrationListParams,
  type RegistrationSort,
} from "@/lib/registrations/list-params"
import { RegistrationModel } from "@/lib/registrations/model"
import type { ListItem } from "@/lib/registrations/list-navigation"
import {
  REGISTRATION_STATUSES,
  type RegistrationFilter,
  type RegistrationStatus,
  type ReviewState,
} from "@/lib/registrations/status"
import { recommendationTargetName } from "@/lib/registrations/recommendations"
import { ONE_REVIEWER_FILTER, decisions, type TimelineEntry } from "@/lib/registrations/timeline"

/** One row of the admin registrations table. */
export type RegistrationRow = {
  id: string
  firstName: string
  lastName: string
  email: string
  fieldOfStudy: string
  yearOfStudy: string
  university: string
  status: RegistrationStatus
  /** ISO date. */
  submittedAt: string
  /** The HR members holding a review place (two at most), their latest decision first. */
  reviewers: { name: string; state: ReviewState }[]
  /** The application's recommendation (the latest one), by whom and where to. */
  recommendation: { name: string; target: string } | null
}

export type RegistrationPage = {
  rows: RegistrationRow[]
  /** Registrations matching the search and the status filter. */
  total: number
  /** The requested page, or the last one when it was past the end. */
  page: number
  pageCount: number
}

/** Columns of a row, and of the timeline only what tells who reviewed it (not the reasons). */
const ROW_FIELDS = [
  "firstName lastName email fieldOfStudy yearOfStudy university status createdAt",
  "timeline.kind timeline.actorId timeline.actorName timeline.state timeline.at",
  "recommendations.actorName recommendations.target",
].join(" ")

/** Fields searched by every word of the query. */
const SEARCH_FIELDS = ["firstName", "lastName", "email", "discord"] as const

/** Sorted fields of each column; `_id` keeps equal values in a stable order across pages. */
const SORT_FIELDS: Record<RegistrationSort, string[]> = {
  applicant: ["lastName", "firstName"],
  fieldOfStudy: ["fieldOfStudy"],
  yearOfStudy: ["yearOfStudy"],
  university: ["university"],
  status: ["status"],
  submitted: ["createdAt"],
}

/** Case-insensitive string order; dates sort without it, so their index stays usable. */
export const CASE_INSENSITIVE = { locale: "en", strength: 2 }

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** Every word must appear (case-insensitive) in one of the searched fields. */
export function searchFilter(query: string) {
  const words = query.split(/\s+/).filter(Boolean).slice(0, 5)
  if (words.length === 0) return {}
  return {
    $and: words.map((word) => ({
      $or: SEARCH_FIELDS.map((field) => ({
        [field]: { $regex: escapeRegExp(word), $options: "i" },
      })),
    })),
  }
}

/** The registrations of a status tab: `second-review` is the pending ones with one reviewer. */
function tabFilter(tab: RegistrationFilter | null) {
  if (tab === "second-review") return { status: "pending" as const, ...ONE_REVIEWER_FILTER }
  return tab ? { status: tab } : {}
}

function listFilter(params: RegistrationListParams) {
  return { ...searchFilter(params.q), ...tabFilter(params.status) }
}

function listSort(params: RegistrationListParams) {
  const direction: MongooseSortOrder = params.order === "asc" ? 1 : -1
  return Object.fromEntries([
    ...SORT_FIELDS[params.sort].map((field) => [field, direction]),
    ["_id", direction],
  ])
}

/** One page of the table, from the search, status filter, sort and page in the URL. */
export async function listRegistrations(params: RegistrationListParams): Promise<RegistrationPage> {
  await connectToDatabase()

  const filter = listFilter(params)
  const total = await RegistrationModel.countDocuments(filter)
  const pageCount = Math.max(1, Math.ceil(total / REGISTRATIONS_PER_PAGE))
  const page = Math.min(params.page, pageCount)
  const sort = listSort(params)

  let query = RegistrationModel.find(filter)
    .select(ROW_FIELDS)
    .sort(sort)
    .skip((page - 1) * REGISTRATIONS_PER_PAGE)
    .limit(REGISTRATIONS_PER_PAGE)
  if (params.sort !== "submitted") query = query.collation(CASE_INSENSITIVE)
  const documents = await query.lean()

  return {
    rows: documents.map((document) => ({
      id: String(document._id),
      firstName: document.firstName,
      lastName: document.lastName,
      email: document.email,
      fieldOfStudy: document.fieldOfStudy,
      yearOfStudy: document.yearOfStudy,
      university: document.university,
      status: document.status as RegistrationStatus,
      submittedAt: new Date(document.createdAt).toISOString(),
      reviewers: decisions((document.timeline ?? []) as TimelineEntry[]),
      recommendation: document.recommendations?.[0]
        ? {
            name: document.recommendations[0].actorName,
            target: recommendationTargetName(document.recommendations[0].target),
          }
        : null,
    })),
    total,
    page,
    pageCount,
  }
}

/** How many registrations each status tab holds, for the status filter (ignores the search). */
export async function countRegistrationsByStatus() {
  await connectToDatabase()
  const [groups, secondReview] = await Promise.all([
    RegistrationModel.aggregate<{ _id: RegistrationStatus; count: number }>([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    RegistrationModel.countDocuments(tabFilter("second-review")),
  ])
  const counts = Object.fromEntries(REGISTRATION_STATUSES.map((status) => [status, 0])) as Record<
    RegistrationStatus,
    number
  >
  for (const group of groups) {
    if (group._id in counts) counts[group._id] = group.count
  }
  return {
    all: Object.values(counts).reduce((sum, count) => sum + count, 0),
    ...counts,
    "second-review": secondReview,
  }
}

/**
 * The whole list the table shows (search, tab and sort), as ids and names, for the previous and
 * next arrows of a registration. `id` is always in it, at its place in the order, even when it no
 * longer matches (e.g. just reviewed out of its tab): `inList` tells.
 */
export async function registrationListOrder(params: RegistrationListParams, id: string) {
  await connectToDatabase()
  const filter = listFilter(params)
  let query = RegistrationModel.find({ $or: [filter, { _id: id }] })
    .select("firstName lastName")
    .sort(listSort(params))
  if (params.sort !== "submitted") query = query.collation(CASE_INSENSITIVE)
  const [documents, matches] = await Promise.all([
    query.lean(),
    RegistrationModel.countDocuments({ ...filter, _id: id }),
  ])
  const items: ListItem[] = documents.map((document) => ({
    id: String(document._id),
    name: `${document.firstName} ${document.lastName}`,
  }))
  return { items, inList: matches > 0 }
}

/** A full registration, or `null` when the id is malformed or unknown. */
export async function getRegistration(id: string) {
  if (!isValidObjectId(id)) return null
  await connectToDatabase()
  const registration = await RegistrationModel.findById(id).lean()
  // Registrations submitted before the timeline existed have no such field.
  return (
    registration && { ...registration, timeline: (registration.timeline ?? []) as TimelineEntry[] }
  )
}

/**
 * Every registration of the list as the table filters and sorts it (search, tab and sort, every
 * page), in full, for the CSV export. Student IDs stay out: they are served one by one only.
 */
export async function exportRegistrations(params: RegistrationListParams) {
  await connectToDatabase()
  let query = RegistrationModel.find(listFilter(params))
    .select("-studentId -recommendations")
    .sort(listSort(params))
  if (params.sort !== "submitted") query = query.collation(CASE_INSENSITIVE)
  const documents = await query.lean()
  return documents.map((document) => ({
    ...document,
    id: String(document._id),
    timeline: (document.timeline ?? []) as TimelineEntry[],
  }))
}
