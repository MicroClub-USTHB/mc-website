"use client"

import { useEffect, useState } from "react"
import { useLenis } from "lenis/react"
import { ExternalLinkIcon, FileTextIcon, PencilIcon, XIcon } from "lucide-react"

import {
  useRegistration,
  useRegistrationSelector,
} from "@/components/registrations/state/registration-context"
import { McButton } from "@/components/ui/mc-button"
import {
  McDialog,
  McDialogClose,
  McDialogContent,
  McDialogDescription,
  McDialogTitle,
} from "@/components/ui/mc-dialog"
import {
  ABOUT_QUESTIONS,
  PHONE_COUNTRIES,
  PROFILE_LINKS,
  REGISTRATION_STEPS,
} from "@/const/registrations"
import { cn } from "@/lib/utils"

/** Label of an answer (small, muted), above its value. */
const LABEL = "text-xs leading-5 font-medium text-muted-foreground uppercase"
const VALUE = "text-sm leading-6 break-words text-foreground"
/** Optional answers left empty. */
const EMPTY = "text-sm leading-6 text-muted-foreground italic"

/** Preview of the chosen student ID (images only), read as a data URL like the upload field. */
function useImagePreview(file: File | null) {
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null)
  useEffect(() => {
    if (!file?.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = () => setPreview({ file, url: String(reader.result) })
    reader.readAsDataURL(file)
    return () => {
      reader.onload = null
      reader.abort()
    }
  }, [file])
  return preview?.file === file ? preview.url : null
}

/** A step's block: its glazed icon (as in the step indicator), name and Edit button, then its answers. */
function StepSection({
  index,
  onEdit,
  children,
}: {
  index: number
  onEdit: () => void
  children: React.ReactNode
}) {
  const { name, icon: Icon } = REGISTRATION_STEPS[index]
  const headingId = `review-step-${index}`

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full text-[color-mix(in_srgb,var(--color-primary)_17%,var(--color-primary-foreground))] glaze">
          <Icon className="size-5" strokeWidth={2} aria-hidden />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-xs leading-4 font-medium text-muted-foreground">
            STEP {index + 1}
          </span>
          <h3 id={headingId} className="truncate text-base leading-6 font-semibold text-foreground">
            {name}
          </h3>
        </div>
        <McButton
          variant="secondary"
          size="sm"
          icon="leading"
          iconDefinition={<PencilIcon />}
          onClick={onEdit}
          aria-label={`Edit ${name}`}
          className="shrink-0"
        >
          Edit
        </McButton>
      </div>
      <div className="rounded-xl border border-border bg-input">{children}</div>
    </section>
  )
}

/**
 * Last look before sending (opens on SUBMIT, after every step validated): the answers of the three
 * steps, each with an Edit button that jumps back to its step. The header and the buttons stay in
 * place while the answers scroll between them. Phones and short landscape screens get the whole
 * screen (the answers are long), larger screens a card.
 */
export function ReviewDialog() {
  const { reviewing, closeReview, confirmSubmit, goToStep, studentId, submitting } =
    useRegistration()
  const values = useRegistrationSelector((state) => state.values)
  const preview = useImagePreview(reviewing ? studentId : null)
  const lenis = useLenis()

  // Lenis takes the wheel and touch scrolls for the page: the page stays still while the answers
  // scroll (`data-lenis-prevent` on their list hands those scrolls back to the browser).
  useEffect(() => {
    if (!reviewing) return
    lenis?.stop()
    return () => lenis?.start()
  }, [reviewing, lenis])

  const edit = (step: number) => {
    closeReview()
    goToStep(step)
  }

  return (
    <McDialog open={reviewing} onOpenChange={(open) => !open && closeReview()}>
      <McDialogContent
        showCloseButton={false}
        className={cn(
          "flex flex-col gap-0 overflow-hidden rounded-xl border-border bg-card p-0 shadow-[0_4px_12px_-4px_rgb(0_0_0/0.08)] sm:min-h-0",
          "h-auto max-h-[min(52rem,calc(100dvh-3rem))] w-[min(44rem,calc(100%-3rem))]",
          // Phones and short landscape screens: the whole screen.
          "max-sm:top-0 max-sm:left-0 max-sm:h-dvh max-sm:max-h-none max-sm:w-full max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none max-sm:border-0",
          "short:top-0 short:left-0 short:h-dvh short:max-h-none short:w-full short:translate-x-0 short:translate-y-0 short:rounded-none short:border-0",
        )}
      >
        <header className="flex shrink-0 items-start gap-4 border-b border-border px-5 pt-5 pb-4 max-sm:pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6 sm:pt-6 short:py-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <McDialogTitle className="text-lg leading-7 font-bold text-foreground uppercase">
              Review your registration
            </McDialogTitle>
            <McDialogDescription className="text-sm leading-5 text-muted-foreground short:hidden compact:hidden">
              Check your answers before sending them. Edit takes you back to a step.
            </McDialogDescription>
          </div>
          <McDialogClose
            aria-label="Close"
            className="-mt-0.5 -mr-1 grid size-9 shrink-0 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring"
          >
            <XIcon className="size-6" strokeWidth={1.5} aria-hidden />
          </McDialogClose>
        </header>

        <div
          data-lenis-prevent
          className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 short:py-4"
        >
          <StepSection index={0} onEdit={() => edit(0)}>
            <dl className="grid gap-x-6 gap-y-3 p-4 sm:grid-cols-2">
              {[
                { label: "Name", value: `${values.firstName} ${values.lastName}` },
                { label: "Discord", value: values.discord },
                {
                  label: "Phone",
                  value: `${PHONE_COUNTRIES.find((c) => c.code === values.phoneCountry)?.dialCode ?? ""} ${values.phone}`,
                },
                { label: "Date of birth", value: values.birthDate },
                { label: "Email", value: values.email },
                { label: "University / School", value: values.university },
                { label: "Field of study", value: values.fieldOfStudy },
                { label: "Year of study", value: values.yearOfStudy },
              ].map(({ label, value }) => (
                <div key={label} className="flex min-w-0 flex-col">
                  <dt className={LABEL}>{label}</dt>
                  <dd className={VALUE}>{value}</dd>
                </div>
              ))}
              <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
                <dt className={LABEL}>Student ID</dt>
                <dd className="flex min-w-0 items-center gap-3">
                  {preview ? (
                    // A local data URL: next/image cannot optimize it.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={preview}
                      alt=""
                      className="h-12 w-19 shrink-0 rounded-md border border-border object-cover"
                    />
                  ) : (
                    <span className="grid h-12 w-19 shrink-0 place-items-center rounded-md border border-border bg-card">
                      <FileTextIcon
                        className="size-5 text-muted-foreground"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                    </span>
                  )}
                  <span className={cn(VALUE, "min-w-0 truncate")} title={studentId?.name}>
                    {studentId?.name}
                  </span>
                </dd>
              </div>
            </dl>
          </StepSection>

          <StepSection index={1} onEdit={() => edit(1)}>
            <dl className="divide-y divide-border">
              {ABOUT_QUESTIONS.map(({ field, label }) => (
                <div key={field} className="flex flex-col gap-1 p-4">
                  <dt className="text-sm leading-5 font-medium text-muted-foreground">{label}</dt>
                  <dd className={cn(VALUE, "whitespace-pre-wrap")}>{values[field]}</dd>
                </div>
              ))}
            </dl>
          </StepSection>

          <StepSection index={2} onEdit={() => edit(2)}>
            <dl className="flex flex-col gap-3 p-4">
              <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {PROFILE_LINKS.map(({ field, label }) => (
                  <div key={field} className="flex min-w-0 flex-col">
                    <dt className={LABEL}>{label.replace(/ link$/, "")}</dt>
                    <dd className="min-w-0">
                      {values[field] ? (
                        <a
                          href={values[field]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex max-w-full items-center gap-1 rounded-sm text-sm leading-6 text-primary underline underline-offset-2 outline-none hover:text-accent-foreground focus-visible:ring-4 focus-visible:ring-ring"
                        >
                          <span className="truncate">
                            {values[field].replace(/^https?:\/\/(www\.)?/, "")}
                          </span>
                          <ExternalLinkIcon className="size-3.5 shrink-0" aria-hidden />
                          <span className="sr-only">(opens in a new tab)</span>
                        </a>
                      ) : (
                        <span className={EMPTY}>Not added</span>
                      )}
                    </dd>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1.5 border-t border-border pt-3">
                <dt className={LABEL}>Skills</dt>
                <dd>
                  <ul className="flex flex-wrap gap-1.5">
                    {values.skills.map((skill) => (
                      <li
                        key={skill}
                        className="max-w-full truncate rounded-full border border-border bg-card px-3 py-0.5 text-sm leading-6 text-foreground"
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </StepSection>
        </div>

        <footer className="grid shrink-0 grid-cols-2 gap-2 border-t border-border px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex sm:justify-end sm:px-6 sm:pb-5 short:py-3">
          <McButton variant="secondary" size="xl" className="h-12" onClick={closeReview}>
            KEEP EDITING
          </McButton>
          <McButton size="xl" className="h-12" isLoading={submitting} onClick={confirmSubmit}>
            SUBMIT
          </McButton>
        </footer>
      </McDialogContent>
    </McDialog>
  )
}
