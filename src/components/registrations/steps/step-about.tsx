"use client"

import { RegistrationTextarea } from "@/components/registrations/fields/registration-textarea"
import { ABOUT_QUESTIONS } from "@/const/registrations"

/** Step 2 (Figma "Textarea input field" x6): one long answer per question. */
export function StepAbout() {
  return (
    <div className="flex flex-col gap-5">
      {ABOUT_QUESTIONS.map(({ field, label }) => (
        <RegistrationTextarea
          key={field}
          field={field}
          label={label}
          placeholder="Enter your answer here ..."
        />
      ))}
    </div>
  )
}
