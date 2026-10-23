"use client"

import { TEXTAREA_FIELD_CLASS } from "@/components/registrations/fields/field-styles"
import { useRegistrationField } from "@/components/registrations/state/registration-context"
import { McTextarea, type McTextareaProps } from "@/components/ui/mc-textarea"
import { ANSWER_MAX_LENGTH } from "@/const/registrations"
import type { TextField } from "@/lib/registrations/schema"
import { cn } from "@/lib/utils"

type RegistrationTextareaProps = Omit<
  McTextareaProps,
  "value" | "onChange" | "onBlur" | "error"
> & {
  field: TextField
}

/** Textarea bound to one registration field: value, error and validation timing come from context. */
export function RegistrationTextarea({ field, className, ...props }: RegistrationTextareaProps) {
  const { id, value, error, onValueChange, onBlur } = useRegistrationField(field)

  return (
    <div className="relative">
      <McTextarea
        id={id}
        value={value}
        error={error}
        maxLength={ANSWER_MAX_LENGTH}
        onChange={(event) => onValueChange(event.target.value)}
        onBlur={onBlur}
        className={cn(TEXTAREA_FIELD_CLASS, className)}
        {...props}
      />
      {value.length > 0 && (
        <span
          aria-hidden
          className="pointer-events-none absolute top-43 right-3.5 text-sm leading-5 text-muted-foreground"
        >
          {value.length}/{ANSWER_MAX_LENGTH}
        </span>
      )}
    </div>
  )
}
