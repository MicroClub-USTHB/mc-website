"use client"

import { RegistrationInput } from "@/components/registrations/fields/registration-input"
import { SkillsField } from "@/components/registrations/fields/skills-field"
import { PROFILE_LINKS } from "@/const/registrations"

/** Step 3: optional profile links, then the skills typed in (the only required field here). */
export function StepAdditional() {
  return (
    <div className="flex flex-col gap-5">
      {PROFILE_LINKS.map(({ field, label }) => (
        <RegistrationInput
          key={field}
          field={field}
          type="url"
          inputMode="url"
          label={label}
          placeholder="Paste your link here (optional)"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
        />
      ))}
      <SkillsField />
    </div>
  )
}
