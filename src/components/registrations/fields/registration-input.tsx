"use client"

import { INPUT_FIELD_CLASS } from "@/components/registrations/fields/field-styles"
import { useRegistrationField } from "@/components/registrations/state/registration-context"
import { McInput, type McInputProps } from "@/components/ui/mc-input"
import type { TextField } from "@/lib/registrations/schema"
import { cn } from "@/lib/utils"

type RegistrationInputProps = Omit<McInputProps, "value" | "onChange" | "onBlur" | "error"> & {
  field: TextField
}

/** Text input bound to one registration field: value, error and validation timing come from context. */
export function RegistrationInput({ field, className, ...props }: RegistrationInputProps) {
  const { id, value, error, onValueChange, onBlur } = useRegistrationField(field)

  return (
    <McInput
      id={id}
      value={value}
      error={error}
      onChange={(event) => onValueChange(event.target.value)}
      onBlur={onBlur}
      className={cn(INPUT_FIELD_CLASS, className)}
      {...props}
    />
  )
}
