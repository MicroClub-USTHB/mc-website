"use client"

import {
  useRegistration,
  useRegistrationSelector,
} from "@/components/registrations/state/registration-context"
import { McButton } from "@/components/ui/mc-button"
import {
  McDialog,
  McDialogContent,
  McDialogDescription,
  McDialogHeader,
  McDialogTitle,
} from "@/components/ui/mc-dialog"
import {
  ABOUT_QUESTIONS,
  PHONE_COUNTRIES,
  PROFILE_LINKS,
  REGISTRATION_STEPS,
} from "@/const/registrations"
import type { RegistrationValues } from "@/lib/registrations/schema"

type Row = { label: string; value: string }

/** The answers of each step, as shown for review. */
function summarize(values: RegistrationValues, studentIdName: string | undefined): Row[][] {
  const dialCode = PHONE_COUNTRIES.find((c) => c.code === values.phoneCountry)?.dialCode ?? ""
  return [
    [
      { label: "Name", value: `${values.firstName} ${values.lastName}` },
      { label: "Discord", value: values.discord },
      { label: "Phone", value: `${dialCode} ${values.phone}` },
      { label: "Date of birth", value: values.birthDate },
      { label: "Email", value: values.email },
      { label: "Field of study", value: values.fieldOfStudy },
      { label: "Year of study", value: values.yearOfStudy },
      { label: "University / School", value: values.university },
      { label: "Student ID", value: studentIdName ?? "" },
    ],
    ABOUT_QUESTIONS.map(({ field, label }) => ({ label, value: values[field] })),
    [
      ...PROFILE_LINKS.map(({ field, label }) => ({ label, value: values[field] })),
      { label: "Skills", value: values.skills.join(", ") },
    ],
  ]
}

/**
 * Last look before sending (opens on SUBMIT, after every step validated): the answers of the three
 * steps, each with an Edit button that jumps back to its step.
 */
export function ReviewDialog() {
  const { reviewing, closeReview, confirmSubmit, goToStep, studentId, submitting } =
    useRegistration()
  const values = useRegistrationSelector((state) => state.values)
  const groups = reviewing ? summarize(values, studentId?.name) : []

  return (
    <McDialog open={reviewing} onOpenChange={(open) => !open && closeReview()}>
      <McDialogContent
        showCloseButton={false}
        className="max-h-[85dvh] w-[min(40rem,calc(100%-2rem))] content-start overflow-y-auto sm:min-h-0"
      >
        <McDialogHeader>
          <McDialogTitle>Review your registration</McDialogTitle>
          <McDialogDescription>
            Check your answers before sending. You can still edit any step.
          </McDialogDescription>
        </McDialogHeader>

        <div className="flex flex-col gap-5">
          {groups.map((rows, index) => (
            <section
              key={REGISTRATION_STEPS[index].name}
              aria-label={REGISTRATION_STEPS[index].name}
            >
              <div className="mb-2 flex items-center justify-between gap-4">
                <h3 className="text-base leading-6 font-semibold text-foreground">
                  {REGISTRATION_STEPS[index].name}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    closeReview()
                    goToStep(index)
                  }}
                  className="cursor-pointer rounded-md px-1 text-sm leading-5 font-medium text-primary underline underline-offset-2 outline-none hover:text-accent-foreground focus-visible:ring-4 focus-visible:ring-ring"
                >
                  Edit
                </button>
              </div>
              <dl className="divide-y divide-border rounded-lg border border-border bg-input">
                {rows.map(({ label, value }) => (
                  <div
                    key={label}
                    className="grid gap-1 px-3.5 py-2.5 sm:grid-cols-[11rem_1fr] sm:gap-4"
                  >
                    <dt className="text-sm leading-5 font-medium text-muted-foreground">{label}</dt>
                    <dd className="text-sm leading-5 break-words whitespace-pre-wrap text-foreground">
                      {value || "—"}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <McButton variant="secondary" size="xl" onClick={closeReview}>
            Keep editing
          </McButton>
          <McButton size="xl" isLoading={submitting} onClick={confirmSubmit}>
            Confirm and submit
          </McButton>
        </div>
      </McDialogContent>
    </McDialog>
  )
}
