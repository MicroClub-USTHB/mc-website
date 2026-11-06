import "server-only"

import { Types, type PipelineStage } from "mongoose"

import { connectToDatabase } from "@/lib/mongodb"
import type { ListItem } from "@/lib/registrations/list-navigation"
import { REGISTRATIONS_PER_PAGE } from "@/lib/registrations/list-params"
import { RegistrationModel } from "@/lib/registrations/model"
import type {
  RecommendationListParams,
  RecommendationSort,
} from "@/lib/registrations/recommendation-params"
import { CASE_INSENSITIVE, searchFilter } from "@/lib/registrations/review"
import type { RegistrationStatus, ReviewState } from "@/lib/registrations/status"
import { decisions, type TimelineEntry } from "@/lib/registrations/timeline"

/** One row of the recommendations table: a registration has one per person recommending it. */
export type RecommendationRow = {
  registrationId: string
  actorId: string
  firstName: string
  lastName: string
  email: string
  recommendedBy: string
  /** Id of a `RECOMMENDATION_TARGETS` entry. */
  recommendedTo: string
  status: RegistrationStatus
  /** The HR members holding a review place (two at most), their latest decision first. */
  reviewers: { name: string; state: ReviewState }[]
  /** ISO date. */
  submittedAt: string
}

export type RecommendationPage = {
  rows: RecommendationRow[]
  /** Recommendations matching the search and the filters. */
  total: number
  /** The requested page, or the last one when it was past the end. */
  page: number
  pageCount: number
}

/** Sorted fields of each column; the ids keep equal values in a stable order across pages. */
const SORT_FIELDS: Record<RecommendationSort, string[]> = {
  applicant: ["lastName", "firstName"],
  by: ["recommendations.actorName"],
  to: ["recommendations.target"],
  status: ["status"],
  submitted: ["createdAt"],
}

function recommendationFilters(params: RecommendationListParams) {
  return {
    ...(params.to.length > 0 && { "recommendations.target": { $in: params.to } }),
    ...(params.by.length > 0 && { "recommendations.actorId": { $in: params.by } }),
  }
}

/** One document per recommendation matching the search and the filters. */
function matchingRecommendations(params: RecommendationListParams): PipelineStage[] {
  const filters = recommendationFilters(params)
  return [
    { $match: { ...searchFilter(params.q), ...filters } },
    { $unwind: "$recommendations" },
    // Again after unwinding: the first match keeps a registration if any recommendation fits.
    { $match: filters },
  ]
}

function recommendationSort(params: RecommendationListParams) {
  const direction = params.order === "asc" ? 1 : -1
  return Object.fromEntries(
    [...SORT_FIELDS[params.sort], "_id", "recommendations.actorId"].map(
      (field): [string, 1 | -1] => [field, direction],
    ),
  )
}

/** One page of the table, from the search, filters, sort and page in the URL. */
export async function listRecommendations(
  params: RecommendationListParams,
): Promise<RecommendationPage> {
  await connectToDatabase()

  const stages = matchingRecommendations(params)
  const [count] = await RegistrationModel.aggregate<{ total: number }>([
    ...stages,
    { $count: "total" },
  ])
  const total = count?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / REGISTRATIONS_PER_PAGE))
  const page = Math.min(params.page, pageCount)

  const sort = recommendationSort(params)
  const aggregation = RegistrationModel.aggregate<{
    _id: unknown
    firstName: string
    lastName: string
    email: string
    status: RegistrationStatus
    createdAt: Date
    recommendations: { actorId: string; actorName: string; target: string }
    timeline?: TimelineEntry[]
  }>([
    ...stages,
    { $sort: sort },
    { $skip: (page - 1) * REGISTRATIONS_PER_PAGE },
    { $limit: REGISTRATIONS_PER_PAGE },
    {
      $project: {
        firstName: 1,
        lastName: 1,
        email: 1,
        status: 1,
        createdAt: 1,
        recommendations: 1,
        // Who reviewed it, not the reasons.
        "timeline.kind": 1,
        "timeline.actorId": 1,
        "timeline.actorName": 1,
        "timeline.state": 1,
        "timeline.at": 1,
      },
    },
  ])
  if (params.sort !== "submitted") aggregation.collation(CASE_INSENSITIVE)
  const documents = await aggregation

  return {
    rows: documents.map((document) => ({
      registrationId: String(document._id),
      actorId: document.recommendations.actorId,
      firstName: document.firstName,
      lastName: document.lastName,
      email: document.email,
      recommendedBy: document.recommendations.actorName,
      recommendedTo: document.recommendations.target,
      status: document.status,
      reviewers: decisions(document.timeline ?? []),
      submittedAt: new Date(document.createdAt).toISOString(),
    })),
    total,
    page,
    pageCount,
  }
}

/**
 * The whole list the table shows (search, filters and sort), as registration ids and names, for
 * the previous and next arrows of a registration opened from it. `id` is always in it, at its
 * place in the order, even when its recommendation was removed or no longer matches: `inList`
 * tells.
 */
export async function recommendationListOrder(params: RecommendationListParams, id: string) {
  await connectToDatabase()
  const filters = recommendationFilters(params)
  const current = { _id: new Types.ObjectId(id) }
  const order = RegistrationModel.aggregate<{ _id: unknown; firstName: string; lastName: string }>([
    { $match: { $or: [{ ...searchFilter(params.q), ...filters }, current] } },
    // Kept without a recommendation, so the current registration stays in the order.
    { $unwind: { path: "$recommendations", preserveNullAndEmptyArrays: true } },
    { $match: { $or: [{ recommendations: { $exists: true }, ...filters }, current] } },
    { $sort: recommendationSort(params) },
    { $project: { firstName: 1, lastName: 1 } },
  ])
  if (params.sort !== "submitted") order.collation(CASE_INSENSITIVE)
  const [documents, [match]] = await Promise.all([
    order,
    RegistrationModel.aggregate<{ total: number }>([
      { $match: current },
      ...matchingRecommendations(params),
      { $count: "total" },
    ]),
  ])
  const items: ListItem[] = documents.map((document) => ({
    id: String(document._id),
    name: `${document.firstName} ${document.lastName}`,
  }))
  return { items, inList: (match?.total ?? 0) > 0 }
}

/**
 * Everyone with a recommendation, for the "Recommended by" filter, and the total of the page.
 * Read from the recommendations, so people whose account was deleted can still be filtered.
 */
export async function recommendationsOverview() {
  await connectToDatabase()
  const people = await RegistrationModel.aggregate<{
    _id: string
    name: string
    count: number
  }>([
    { $unwind: "$recommendations" },
    {
      $group: {
        _id: "$recommendations.actorId",
        name: { $first: "$recommendations.actorName" },
        count: { $sum: 1 },
      },
    },
    { $sort: { name: 1, _id: 1 } },
  ])
  return {
    total: people.reduce((sum, person) => sum + person.count, 0),
    recommenders: people.map((person) => ({ value: person._id, label: person.name })),
  }
}
