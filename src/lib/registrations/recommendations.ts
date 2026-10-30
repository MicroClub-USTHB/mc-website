import { CLUB_SECTIONS } from "@/const/club-sections"
import { DEPARTMENTS } from "@/const/departments"

/** Where an HR member can recommend an applicant: every section and department of the club. */
export const RECOMMENDATION_TARGETS = [
  ...CLUB_SECTIONS.map((section) => ({
    id: section.id as string,
    name: section.title,
    label: `${section.title} (sect.)`,
  })),
  ...DEPARTMENTS.map((department) => ({
    id: department.id as string,
    name: department.name,
    label: `${department.name} (dept.)`,
  })),
]

export function isRecommendationTarget(value: string) {
  return RECOMMENDATION_TARGETS.some((target) => target.id === value)
}

/** Name of a stored target; the id itself if that section or department no longer exists. */
export function recommendationTargetName(id: string) {
  return RECOMMENDATION_TARGETS.find((target) => target.id === id)?.name ?? id
}
