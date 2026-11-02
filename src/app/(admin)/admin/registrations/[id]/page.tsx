import type { Metadata } from "next"
import { differenceInYears, format } from "date-fns"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react"

import { CopyButton } from "@/components/admin/registrations/copy-button"
import { RecommendDialog } from "@/components/admin/registrations/recommend-dialog"
import { RegistrationTimeline } from "@/components/admin/registrations/registration-timeline"
import { ReviewActions } from "@/components/admin/registrations/review-actions"
import { StatusBadge } from "@/components/admin/registrations/status-badge"
import { StudentIdPreview } from "@/components/admin/registrations/student-id-preview"
import { McBadge } from "@/components/ui/mc-badge"
import { adminRoutes } from "@/config/admin"
import { ABOUT_QUESTIONS } from "@/const/registrations"
import { requireStaff } from "@/lib/auth/session"
import { listQuery, parseListParams } from "@/lib/registrations/list-params"
import { getRegistration } from "@/lib/registrations/review"
import { isRegistrationStatus } from "@/lib/registrations/status"
import {
  MAX_REVIEWERS,
  currentRecommendation,
  currentReviews,
  hasReviewed,
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

/** One registration in full, as submitted. The back link returns to the list as it was. */
export default async function RegistrationPage({
  params,
  searchParams,
}: PageProps<"/admin/registrations/[id]">) {
  const { user } = await requireStaff({ permissions: { registration: ["review"] } })

  const { id } = await params
  const registration = await getRegistration(id)
  if (!registration) notFound()

  const back = `${adminRoutes.registrations}${listQuery(parseListParams(await searchParams))}`
  const name = `${registration.firstName} ${registration.lastName}`
  const status = isRegistrationStatus(registration.status) ? registration.status : "pending"
  const submittedAt = new Date(registration.createdAt)
  const birthDate = new Date(registration.birthDate)
  const links = LINKS.filter((link) => registration.links?.[link.key])
  const studentIdSrc = `${adminRoutes.registrations}/${id}/student-id`
  const { timeline } = registration
  const reviews = currentReviews(timeline)
  const ownReview = reviews.find((review) => review.actorId === user.id)
  const recommendation = currentRecommendation(timeline, user.id)

  return (
    <div className="mx-auto flex w-full max-w-site flex-col gap-6 px-4 py-12 sm:px-8">
      <Link
        href={back}
        className="inline-flex w-fit items-center gap-1.5 rounded-sm paragraph-sm font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring"
      >
        <ArrowLeftIcon className="size-4" aria-hidden />
        Back to registrations
      </Link>

      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="header-md font-heading text-foreground">{name}</h1>
          <StatusBadge status={status} />
        </div>
        <p className="paragraph-md text-muted-foreground">
          Submitted on{" "}
          <time dateTime={submittedAt.toISOString()}>
            {format(submittedAt, "d MMMM yyyy 'at' HH:mm")}
          </time>
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
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
          {ownReview || reviews.length < MAX_REVIEWERS ? (
            <ReviewActions
              registrationId={id}
              applicant={name}
              current={ownReview?.state ?? "pending"}
              reasonRequired={!hasReviewed(timeline, user.id)}
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
                }
              }
            />
          </div>
        </Section>

        <Section title="Timeline">
          <RegistrationTimeline timeline={timeline} />
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Personal information">
          <dl className="grid gap-4 sm:grid-cols-2">
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
              {format(birthDate, "d MMMM yyyy")} ({differenceInYears(new Date(), birthDate)} years)
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

      <div className="grid gap-6 lg:grid-cols-2">
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
              <li key={skill}>
                <McBadge variant="outline" size="md">
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
