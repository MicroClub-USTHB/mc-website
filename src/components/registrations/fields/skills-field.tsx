"use client"

import { useState } from "react"
import { XIcon } from "lucide-react"

import { FIELD_LABEL_CLASS } from "@/components/registrations/fields/field-styles"
import { useRegistrationField } from "@/components/registrations/state/registration-context"
import { McBadge } from "@/components/ui/mc-badge"
import { SKILL_MAX_LENGTH, SKILLS_MAX } from "@/const/registrations"
import { cn } from "@/lib/utils"

/**
 * Skills (Figma "_Select input base"): the visitor types a skill and presses Enter to add it; the
 * added ones line up under the prompt as badges with a remove button (Figma "Filled"). Backspace
 * in the empty input removes the last one.
 */
export function SkillsField() {
  const { id, value, error, onValueChange, onBlur } = useRegistrationField("skills")
  const [draft, setDraft] = useState("")
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  function add() {
    const skill = draft.trim().replace(/\s+/g, " ")
    if (!skill) return
    const known = value.some((item) => item.toLowerCase() === skill.toLowerCase())
    if (!known && value.length < SKILLS_MAX) onValueChange([...value, skill])
    setDraft("")
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={FIELD_LABEL_CLASS}>
        Skills
      </label>

      <div
        data-error={error ? "" : undefined}
        className={cn(
          "flex w-full flex-col items-start justify-center gap-2 rounded-lg border border-border bg-input px-3.5 py-2.5 shadow-[0_1px_1px_rgb(10_13_18/0.05)] transition-shadow",
          "has-focus-visible:ring-4 has-focus-visible:ring-ring data-error:border-destructive",
        )}
      >
        <input
          id={id}
          value={draft}
          maxLength={SKILL_MAX_LENGTH}
          placeholder="Enter your skills here ..."
          autoComplete="off"
          enterKeyHint="enter"
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${errorId} ${hintId}` : hintId}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              // Adds the skill instead of submitting the form.
              event.preventDefault()
              add()
            } else if (event.key === "Backspace" && !draft && value.length > 0) {
              onValueChange(value.slice(0, -1))
            }
          }}
          onBlur={() => {
            add()
            onBlur()
          }}
          className="w-full bg-transparent text-base leading-6 text-foreground outline-none placeholder:text-muted-foreground"
        />
        {value.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Your skills">
            {value.map((skill) => (
              <li key={skill}>
                <McBadge size="md" className="gap-1 pr-2 pl-2.5">
                  {skill}
                  <button
                    type="button"
                    aria-label={`Remove ${skill}`}
                    onClick={() => onValueChange(value.filter((item) => item !== skill))}
                    className="grid size-3 cursor-pointer place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <XIcon className="size-3" strokeWidth={2} aria-hidden />
                  </button>
                </McBadge>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p id={hintId} className="sr-only">
        Press Enter to add each skill.
      </p>
      {error && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
