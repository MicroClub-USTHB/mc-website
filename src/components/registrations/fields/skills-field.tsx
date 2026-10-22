"use client"

import { XIcon } from "lucide-react"

import { FIELD_LABEL_CLASS } from "@/components/registrations/fields/field-styles"
import { useRegistrationField } from "@/components/registrations/state/registration-context"
import { McBadge } from "@/components/ui/mc-badge"
import { McSelect, McSelectContent, McSelectItem, McSelectTrigger } from "@/components/ui/mc-select"
import { REGISTRATION_SKILLS } from "@/const/registrations"

const PLACEHOLDER = "Enter your skills here ..."

/** Multiple choice of skills (Figma "Skills" select), the picked ones show as chips. */
export function SkillsField() {
  const { id, value, error, onValueChange, onBlur } = useRegistrationField("skills")
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={FIELD_LABEL_CLASS}>
        Skills
      </label>

      <McSelect
        multiple
        value={value}
        onValueChange={(skills) => onValueChange(skills as typeof value)}
        onOpenChange={(open) => !open && onBlur()}
      >
        <McSelectTrigger
          id={id}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? errorId : undefined}
          className="h-auto min-h-11 w-full py-2.5 text-base leading-6 text-foreground shadow-xs data-[size=default]:h-auto [&>svg]:hidden"
        >
          {/* Figma "Filled": the prompt stays, the picked skills line up under it. */}
          <span className="flex min-w-0 flex-1 flex-col items-start gap-2">
            <span className="text-muted-foreground">{PLACEHOLDER}</span>
            {value.length > 0 && (
              <span className="flex flex-wrap gap-2">
                {value.map((skill) => (
                  <McBadge key={skill} size="md" className="gap-1 pr-2 pl-2.5">
                    {skill}
                    {/* Unpicks the skill without opening the list (also in the list itself). */}
                    <span
                      aria-hidden
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={(event) => {
                        event.stopPropagation()
                        onValueChange(value.filter((item) => item !== skill))
                      }}
                      className="grid size-3 cursor-pointer place-items-center"
                    >
                      <XIcon className="size-3" strokeWidth={2} />
                    </span>
                  </McBadge>
                ))}
              </span>
            )}
          </span>
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
