import type { NextRequest } from "next/server"

import { ABOUT_QUESTIONS } from "@/const/registrations"
import { requireStaff } from "@/lib/auth/session"
import { toCsv } from "@/lib/csv"
import { formatClubTime } from "@/lib/dates"
import { parseListParams } from "@/lib/registrations/list-params"
import { recommendationTargetName } from "@/lib/registrations/recommendations"
import { exportRegistrations } from "@/lib/registrations/review"
import { REGISTRATION_STATUS_LABELS, isRegistrationStatus } from "@/lib/registrations/status"
import { currentRecommendation, currentReviews } from "@/lib/registrations/timeline"

/** Stored profile links (`links` on the registration), in the form's order. */
const LINKS = [
  { key: "portfolio", label: "Portfolio" },
  { key: "behance", label: "Behance" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "github", label: "GitHub" },
] as const

/**
 * The registrations list as a CSV file: the search, status tab and sort of the URL, every page.
 * Linked from the registrations page with its current filters.
 */
export async function GET(request: NextRequest) {
  await requireStaff({ permissions: { registration: ["review"] } })

  const params = parseListParams(Object.fromEntries(request.nextUrl.searchParams))
  const registrations = await exportRegistrations(params)
  const date = (value: Date) => formatClubTime(new Date(value), "yyyy-MM-dd HH:mm")

  const header = [
    "First name",
    "Last name",
    "Email",
    "Discord",
    "Phone",
    "Birth date",
    "Field of study",
    "Year of study",
    "University",
    "Status",
    "Reviews",
    "Recommended to",
    "Recommended by",
    "Recommendation note",
    "Skills",
    ...LINKS.map((link) => link.label),
    ...ABOUT_QUESTIONS.map((question) => question.label),
    "Submitted at",
  ]
  const rows = registrations.map((registration) => {
    const reviews = currentReviews(registration.timeline)
    const recommendation = currentRecommendation(registration.timeline)
    return [
      registration.firstName,
      registration.lastName,
      registration.email,
      registration.discord,
      registration.phone,
      formatClubTime(new Date(registration.birthDate), "yyyy-MM-dd"),
      registration.fieldOfStudy,
      registration.yearOfStudy,
      registration.university,
      isRegistrationStatus(registration.status)
        ? REGISTRATION_STATUS_LABELS[registration.status]
        : registration.status,
      reviews.map((review) => `${review.actorName}: ${review.state}`).join("; "),
      recommendation ? recommendationTargetName(recommendation.target) : "",
      recommendation?.actorName,
      recommendation?.note,
      registration.skills.join(", "),
      ...LINKS.map((link) => registration.links?.[link.key]),
      ...ABOUT_QUESTIONS.map((question) => registration.answers?.[question.field]),
      date(registration.createdAt),
    ]
  })

  const filename = `registrations-${params.status ?? "all"}-${formatClubTime(new Date(), "yyyy-MM-dd")}.csv`
  return new Response(toCsv(header, rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  })
}
