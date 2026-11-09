import type { Metadata } from "next"
import { differenceInYears } from "date-fns"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react"

import { CopyButton } from "@/components/admin/registrations/copy-button"
import { RecommendDialog } from "@/components/admin/registrations/recommend-dialog"
import { MarkPlaceButton } from "@/components/admin/registrations/mark-place-button"
import { RegistrationPager } from "@/components/admin/registrations/registration-pager"
import {
  InterviewQuestions,
  RegistrationTimeline,
} from "@/components/admin/registrations/registration-timeline"
import { ReviewActions } from "@/components/admin/registrations/review-actions"
import { StatusBadge } from "@/components/admin/registrations/status-badge"
import { StudentIdPreview } from "@/components/admin/registrations/student-id-preview"
import { McBadge } from "@/components/ui/mc-badge"
import { adminRoutes, registrationRoute } from "@/config/admin"
import { ABOUT_QUESTIONS } from "@/const/registrations"
import { requireStaff } from "@/lib/auth/session"
import { formatCalendarDate, formatClubTime } from "@/lib/dates"
import { listNavigation, type ListNeighbor } from "@/lib/registrations/list-navigation"
import { listQuery, parseListParams } from "@/lib/registrations/list-params"
import { recommendationListOrder } from "@/lib/registrations/recommendation-list"
import {
  RECOMMENDATIONS_ORIGIN,
  parseRecommendationParams,
  recommendationOriginQuery,
  recommendationsQuery,
} from "@/lib/registrations/recommendation-params"
import { interviewSchedule, listInterviewers } from "@/lib/registrations/interview-store"
import { isReviewPlace } from "@/lib/registrations/place-store"
import { getRegistration, registrationListOrder } from "@/lib/registrations/review"
import { isRegistrationStatus } from "@/lib/registrations/status"
import {
  MAX_REVIEWERS,
  currentRecommendation,
  currentReviews,
  hasReviewed,
  interviewQuestions,
} from "@/lib/registrations/timeline"

export const metadata: Metadata = { title: "Registration" }

const LINKS = [
  { key: "portfolio", label: "Portfolio" },
  { key: "behance", label: "Behance" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "github", label: "GitHub" },
] as const

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:p-6">
      <h2 className="header-xs font-heading text-foreground">{title}</h2>
      {children}
    </section>
  )
}

function Field({
  label,
  children,
  copy,
}: {
  label: string
  children: React.ReactNode
  copy?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="paragraph-sm text-muted-foreground">{label}</dt>
      <dd className="flex min-h-8 items-center gap-1 paragraph-md break-all text-foreground">
        {children}
        {copy && <CopyButton value={copy} label={label.toLowerCase()} />}
      </dd>
    </div>
  )
}

/**
 * The list the registration was opened from (the registrations or the recommendations list, with
 * its search, filters and sort): the back link and the previous and next arrows, each link
 * carrying the list page its registration is on.
 */
async function listContext(
  id: string,
  search: Awaited<PageProps<"/admin/registrations/[id]">["searchParams"]>,
) {
  if (search.from === RECOMMENDATIONS_ORIGIN) {
    const params = parseRecommendationParams(search)
    const { items, inList } = await recommendationListOrder(params, id)
    const navigation = listNavigation(items, id, inList)
    const target = (neighbor: ListNeighbor | null) =>
      neighbor && {
        name: neighbor.name,
        href: registrationRoute(
          neighbor.id,
          recommendationOriginQuery({ ...params, page: neighbor.page }),
        ),
      }
    return {
      label: "recommendations",
      back: `${adminRoutes.recommendations}${recommendationsQuery(params, { page: navigation.page })}`,
      navigation,
      previous: target(navigation.previous),
      next: target(navigation.next),
    }
  }

  const params = parseListParams(search)
  const { items, inList } = await registrationListOrder(params, id)
  const navigation = listNavigation(items, id, inList)
  const target = (neighbor: ListNeighbor | null) =>
    neighbor && {
      name: neighbor.name,
      href: registrationRoute(neighbor.id, listQuery(params, { page: neighbor.page })),
    }
  return {
    label: "registrations",
    back: `${adminRoutes.registrations}${listQuery(params, { page: navigation.page })}`,
    navigation,
    previous: target(navigation.previous),
    next: target(navigation.next),
  }
}

/**
 * One registration in full, as submitted. The back link returns to its list as it was, and the
 * arrows open the previous and next registrations of that list.
 */
export default async function RegistrationPage({
  params,
  searchParams,
}: PageProps<"/admin/registrations/[id]">) {
  const { user } = await requireStaff({ permissions: { registration: ["review"] } })

  const { id } = await params
  const registration = await getRegistration(id)
  if (!registration) notFound()

  const [list, marked, interviewers] = await Promise.all([
    listContext(id, await searchParams),
    isReviewPlace(user.id, id),
    listInterviewers(),
  ])
  const interview = interviewSchedule(registration.interview)
  const name = `${registration.firstName} ${registration.lastName}`
  const status = isRegistrationStatus(registration.status) ? registration.status : "pending"
  const submittedAt = new Date(registration.createdAt)
  const birthDate = new Date(registration.birthDate)
  const links = LINKS.filter((link) => registration.links?.[link.key])
  const studentIdSrc = `${adminRoutes.registrations}/${id}/student-id`
  const { timeline } = registration
  const reviews = currentReviews(timeline)
  const ownReview = reviews.find((review) => review.actorId === user.id)
  const recommendation = currentRecommendation(timeline)
  const questions = interviewQuestions(timeline)

  return (
    <div className="mx-auto flex w-full max-w-site flex-col gap-6 px-4 py-12 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={list.back}
          className="inline-flex w-fit items-center gap-1.5 rounded-sm paragraph-sm font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring"
        >
          <ArrowLeftIcon className="size-4" aria-hidden />
          Back to {list.label}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <MarkPlaceButton registrationId={id} marked={marked} />
          <RegistrationPager
            previous={list.previous}
            next={list.next}
            position={list.navigation.position}
            total={list.navigation.total}
          />
        </div>
      </div>

      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="min-w-0 header-md font-heading text-foreground">{name}</h1>
          <StatusBadge status={status} />
        </div>
        <p className="paragraph-md text-muted-foreground">
          Submitted on{" "}
          <time dateTime={submittedAt.toISOString()}>
            {formatClubTime(submittedAt, "d MMMM yyyy 'at' HH:mm")}
          </time>
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="Review">
          {reviews.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {reviews.map((review) => (
                <li key={review.actorId} className="flex items-center gap-2">
                  <span className="paragraph-md text-foreground">{review.actorName}</span>
                  <StatusBadge status={review.state} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="paragraph-sm text-muted-foreground">Nobody reviewed it yet.</p>
          )}
          {questions.length > 0 && (
            <div className="flex flex-col gap-3">
              {questions.map((entry) => (
                <div key={entry.actorId} className="flex flex-col gap-1">
                  <p className="paragraph-sm text-muted-foreground">
                    {entry.actorId === user.id ? "Your" : `${entry.name}'s`} interview questions
                  </p>
                  <InterviewQuestions questions={entry.questions} />
                </div>
              ))}
            </div>
          )}
          {(interview.at || interview.interviewerId) && (
            <div className="flex flex-col gap-1 rounded-lg border border-border bg-secondary/40 p-3">
              <p className="paragraph-sm text-muted-foreground">Interview</p>
              <p className="paragraph-md text-foreground">
                {interview.at
                  ? formatClubTime(interview.at, "EEEE d MMMM yyyy 'at' HH:mm")
                  : "No date yet"}
                {" · "}
                {interview.interviewerId === user.id
                  ? "with you"
                  : interview.interviewerName
                    ? `with ${interview.interviewerName}`
                    : "nobody assigned"}
              </p>
              <Link
                href={adminRoutes.calendar}
                className="w-fit rounded-sm paragraph-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-4 focus-visible:ring-ring"
              >
                Open the calendar
              </Link>
            </div>
          )}
          {ownReview || reviews.length < MAX_REVIEWERS ? (
            <ReviewActions
              registrationId={id}
              applicant={name}
              current={ownReview?.state ?? "pending"}
              questions={ownReview?.state === "interview" ? ownReview.questions : undefined}
              reasonRequired={!hasReviewed(timeline, user.id)}
              interviewers={interviewers}
              interview={interview}
            />
          ) : (
            <p className="paragraph-sm text-muted-foreground">
              Two HR members are already reviewing this application.
            </p>
          )}
          <div>
            <RecommendDialog
              registrationId={id}
              applicant={name}
              recommendation={
                recommendation && {
                  target: recommendation.target,
                  note: recommendation.note ?? "",
                  by: recommendation.actorId === user.id ? "you" : recommendation.actorName,
                }
              }
            />
          </div>
        </Section>

        <Section title="Timeline">
          <RegistrationTimeline timeline={timeline} />
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="Personal information">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Email" copy={registration.email}>
              <a
                href={`mailto:${registration.email}`}
                className="text-primary underline-offset-4 hover:underline"
              >
                {registration.email}
              </a>
            </Field>
            <Field label="Phone" copy={registration.phone}>
              <a
                href={`tel:${registration.phone}`}
                className="text-primary underline-offset-4 hover:underline"
              >
                {registration.phone}
              </a>
            </Field>
            <Field label="Discord" copy={registration.discord}>
              {registration.discord}
            </Field>
            <Field label="Date of birth">
              {formatCalendarDate(birthDate, "d MMMM yyyy")} (
              {differenceInYears(new Date(), birthDate)} years)
            </Field>
            <Field label="Field of study">{registration.fieldOfStudy}</Field>
            <Field label="Year of study">{registration.yearOfStudy}</Field>
            <Field label="University or school">{registration.university}</Field>
          </dl>
        </Section>

        <Section title="Student ID">
          {registration.studentId ? (
            <StudentIdPreview
              src={studentIdSrc}
              isPdf={registration.studentId.format === "pdf"}
              name={name}
            />
          ) : (
            <p className="paragraph-sm text-muted-foreground">File unavailable</p>
          )}
        </Section>
      </div>

      <Section title="About them and the club">
        <dl className="flex flex-col gap-5">
          {ABOUT_QUESTIONS.map((question) => (
            <div key={question.field} className="flex flex-col gap-1.5">
              <dt className="paragraph-sm font-medium text-muted-foreground">{question.label}</dt>
              <dd className="paragraph-md whitespace-pre-line text-foreground">
                {registration.answers?.[question.field]}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="Links">
          {links.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {links.map((link) => (
                <li key={link.key} className="flex flex-col">
                  <span className="paragraph-sm text-muted-foreground">{link.label}</span>
                  <a
                    href={registration.links![link.key]!}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex w-fit items-center gap-1.5 paragraph-md break-all text-primary underline-offset-4 hover:underline"
                  >
                    {registration.links![link.key]}
                    <ExternalLinkIcon className="size-4 shrink-0" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="paragraph-sm text-muted-foreground">No links shared.</p>
          )}
        </Section>

        <Section title="Skills">
          <ul className="flex flex-wrap gap-2">
            {registration.skills.map((skill) => (
              <li key={skill} className="min-w-0">
                <McBadge
                  variant="outline"
                  size="md"
                  className="h-auto max-w-full whitespace-normal"
                >
                  {skill}
                </McBadge>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  )
}
