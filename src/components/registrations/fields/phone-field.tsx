"use client"

import { INPUT_FIELD_CLASS } from "@/components/registrations/fields/field-styles"
import {
  useRegistration,
  useRegistrationField,
} from "@/components/registrations/state/registration-context"
import { McInput } from "@/components/ui/mc-input"
import {
  McSelect,
  McSelectContent,
  McSelectItem,
  McSelectTrigger,
  McSelectValue,
} from "@/components/ui/mc-select"
import { PHONE_COUNTRIES } from "@/const/registrations"

/** Phone number with the country prefix dropdown inside the input (Figma "ALG" + number). */
export function PhoneField() {
  const { values, setValue } = useRegistration()
  const { id, value, error, onValueChange, onBlur } = useRegistrationField("phone")
  const country =
    PHONE_COUNTRIES.find((candidate) => candidate.code === values.phoneCountry) ??
    PHONE_COUNTRIES[0]

  return (
    <McInput
      id={id}
      type="tel"
      inputMode="tel"
      autoComplete="tel-national"
      label="Phone number"
      placeholder={`(${country.dialCode}) 000-000-000`}
      value={value}
      error={error}
      onChange={(event) => onValueChange(event.target.value)}
      onBlur={onBlur}
      className={INPUT_FIELD_CLASS}
      addonStart={
        <McSelect
          value={country.code}
          onValueChange={(code) => code && setValue("phoneCountry", code)}
        >
          <McSelectTrigger
            aria-label="Country code"
            className="h-auto w-auto gap-0 border-0 bg-transparent py-0 pr-1 pl-1.5 text-base leading-6 shadow-none ring-0 focus-visible:ring-0 data-popup-open:ring-0 data-[size=default]:h-auto [&_svg]:size-5!"
          >
            <McSelectValue className="flex-none text-muted-foreground">
              {country.code}
            </McSelectValue>
          </McSelectTrigger>
          <McSelectContent
            align="start"
            alignItemWithTrigger={false}
            className="h-auto max-h-72 w-64"
          >
            {PHONE_COUNTRIES.map((option) => (
              <McSelectItem key={option.code} value={option.code} supportingText={option.dialCode}>
                {option.name}
              </McSelectItem>
            ))}
          </McSelectContent>
        </McSelect>
      }
    />
  )
}
