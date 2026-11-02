import "server-only"

import type { PipelineStage } from "mongoose"

import { connectToDatabase } from "@/lib/mongodb"
import { REGISTRATIONS_PER_PAGE } from "@/lib/registrations/list-params"
import { RegistrationModel } from "@/lib/registrations/model"
import type {
  RecommendationListParams,
  RecommendationSort,
} from "@/lib/registrations/recommendation-params"
import { CASE_INSENSITIVE, searchFilter } from "@/lib/registrations/review"
import type { RegistrationStatus } from "@/lib/registrations/status"

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

/** One document per recommendation matching the search and the filters. */
function matchingRecommendations(params: RecommendationListParams): PipelineStage[] {
  const filters = {
    ...(params.to.length > 0 && { "recommendations.target": { $in: params.to } }),
    ...(params.by.length > 0 && { "recommendations.actorId": { $in: params.by } }),
  }
  return [
    { $match: { ...searchFilter(params.q), ...filters } },
    { $unwind: "$recommendations" },
    // Again after unwinding: the first match keeps a registration if any recommendation fits.
    { $match: filters },
  ]
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

  const direction = params.order === "asc" ? 1 : -1
  const sort = Object.fromEntries(
    [...SORT_FIELDS[params.sort], "_id", "recommendations.actorId"].map(
      (field): [string, 1 | -1] => [field, direction],
    ),
  )
  const aggregation = RegistrationModel.aggregate<{
    _id: unknown
    firstName: string
    lastName: string
    email: string
    status: RegistrationStatus
    createdAt: Date
    recommendations: { actorId: string; actorName: string; target: string }
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
      submittedAt: new Date(document.createdAt).toISOString(),
    })),
    total,
    page,
    pageCount,
  }
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
