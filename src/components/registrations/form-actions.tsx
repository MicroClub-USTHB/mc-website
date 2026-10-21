"use client"

import Link from "next/link"

import { useRegistration } from "@/components/registrations/registration-context"
import { McButton } from "@/components/ui/mc-button"
import { REGISTRATION_STEPS } from "@/const/registrations"

/**
 * BACK / NEXT row (Figma "Form Actions"). BACK on the first step leaves for the home page, NEXT
 * on the last step is SUBMIT. Both are real buttons inside the form, so Enter in a field advances.
 */
export function FormActions() {
  const { step, back, submitting } = useRegistration()
  const isLast = step === REGISTRATION_STEPS.length - 1

  return (
    <div className="flex items-center justify-between">
      {step === 0 ? (
        <McButton
          variant="secondary"
          size="xl"
          className="h-12"
          nativeButton={false}
          render={<Link href="/" />}
        >
          BACK
        </McButton>
      ) : (
        <McButton
          variant="secondary"
          size="xl"
          className="h-12"
          type="button"
          onClick={back}
          disabled={submitting}
        >
          BACK
        </McButton>
      )}

      <McButton type="submit" size="xl" className="h-12" isLoading={submitting}>
        {isLast ? "SUBMIT" : "NEXT"}
      </McButton>
    </div>
  )
}
