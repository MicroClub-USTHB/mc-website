import "server-only"

import { isValidObjectId, type SortOrder as MongooseSortOrder } from "mongoose"

import { connectToDatabase } from "@/lib/mongodb"
import {
  REGISTRATIONS_PER_PAGE,
  type RegistrationListParams,
  type RegistrationSort,
} from "@/lib/registrations/list-params"
import { RegistrationModel } from "@/lib/registrations/model"
import { REGISTRATION_STATUSES, type RegistrationStatus } from "@/lib/registrations/status"
import type { TimelineEntry } from "@/lib/registrations/timeline"

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
}

export type RegistrationPage = {
  rows: RegistrationRow[]
  /** Registrations matching the search and the status filter. */
  total: number
  /** The requested page, or the last one when it was past the end. */
  page: number
  pageCount: number
}

const ROW_FIELDS = "firstName lastName email fieldOfStudy yearOfStudy university status createdAt"

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
const CASE_INSENSITIVE = { locale: "en", strength: 2 }

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** Every word must appear (case-insensitive) in one of the searched fields. */
function searchFilter(query: string) {
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

/** One page of the table, from the search, status filter, sort and page in the URL. */
export async function listRegistrations(params: RegistrationListParams): Promise<RegistrationPage> {
  await connectToDatabase()

  const filter = { ...searchFilter(params.q), ...(params.status && { status: params.status }) }
  const total = await RegistrationModel.countDocuments(filter)
  const pageCount = Math.max(1, Math.ceil(total / REGISTRATIONS_PER_PAGE))
  const page = Math.min(params.page, pageCount)

  const direction: MongooseSortOrder = params.order === "asc" ? 1 : -1
  const sort = Object.fromEntries([
    ...SORT_FIELDS[params.sort].map((field) => [field, direction]),
    ["_id", direction],
  ])

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
    })),
    total,
    page,
    pageCount,
  }
}

/** How many registrations have each status, for the status filter (ignores the search). */
export async function countRegistrationsByStatus() {
  await connectToDatabase()
  const groups = await RegistrationModel.aggregate<{ _id: RegistrationStatus; count: number }>([
    { $group: { _id: "$status", count: { $sum: 1 } } },
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
  }
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
