"use client"

import { FIELD_LABEL_CLASS } from "@/components/registrations/fields/field-styles"
import {
  useRegistration,
  useRegistrationField,
} from "@/components/registrations/state/registration-context"
import { McBadge } from "@/components/ui/mc-badge"
import {
  McSelect,
  McSelectContent,
  McSelectItem,
  McSelectTrigger,
  McSelectValue,
} from "@/components/ui/mc-select"
import { REGISTRATION_SKILLS } from "@/const/registrations"

const PLACEHOLDER = "Select at least 1 skill"

/** Multiple choice of skills (Figma "Skills" select), the picked ones show as chips. */
export function SkillsField() {
  const { setValue } = useRegistration()
  const { id, value, error, onBlur } = useRegistrationField("skills")
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={FIELD_LABEL_CLASS}>
        Skills
      </label>

      <McSelect
        multiple
        value={value}
        onValueChange={(skills) => setValue("skills", skills as typeof value)}
        onOpenChange={(open) => !open && onBlur()}
      >
        <McSelectTrigger
          id={id}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? errorId : undefined}
          className="h-auto min-h-11 w-full py-2 text-base leading-6 text-foreground shadow-xs data-[size=default]:h-auto"
        >
          <McSelectValue>
            {(selected: string[]) =>
              selected.length === 0 ? (
                PLACEHOLDER
              ) : (
                <span className="flex flex-wrap gap-1.5">
                  {selected.map((skill) => (
                    <McBadge key={skill} variant="secondary" size="md">
                      {skill}
                    </McBadge>
                  ))}
                </span>
              )
            }
          </McSelectValue>
        </McSelectTrigger>

        <McSelectContent
          align="start"
          alignItemWithTrigger={false}
          className="h-auto max-h-80 w-(--anchor-width)"
        >
          {REGISTRATION_SKILLS.map((skill) => (
            <McSelectItem key={skill} value={skill}>
              {skill}
            </McSelectItem>
          ))}
        </McSelectContent>
      </McSelect>

      {error && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
