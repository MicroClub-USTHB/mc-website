"use client"

import { INPUT_FIELD_CLASS } from "@/components/registrations/fields/field-styles"
import { useRegistrationField } from "@/components/registrations/state/registration-context"
import { McInput } from "@/components/ui/mc-input"
import { PHONE_COUNTRIES } from "@/const/registrations"

const [ALGERIA] = PHONE_COUNTRIES

/** Phone number, Algerian only: "ALG" before the number (Figma), no country to pick. */
export function PhoneField() {
  const { id, value, error, onValueChange, onBlur } = useRegistrationField("phone")

  return (
    <McInput
      id={id}
      type="tel"
      inputMode="tel"
      autoComplete="tel-national"
      label="Phone number"
      placeholder={`(${ALGERIA.dialCode}) 000-000-000`}
      value={value}
      error={error}
      onChange={(event) => onValueChange(event.target.value)}
      onBlur={onBlur}
      className={INPUT_FIELD_CLASS}
      addonStart={
        <span
          className="pr-1 pl-1.5 text-base leading-6 text-muted-foreground"
          aria-label="Algeria, +213"
        >
          {ALGERIA.code}
        </span>
      }
    />
  )
}
