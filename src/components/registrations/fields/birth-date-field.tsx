"use client"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"

import { INPUT_FIELD_CLASS } from "@/components/registrations/fields/field-styles"
import { useRegistrationField } from "@/components/registrations/state/registration-context"
import { McCalendar } from "@/components/ui/mc-calendar"
import { McInput } from "@/components/ui/mc-input"
import { McPopover, McPopoverContent, McPopoverTrigger } from "@/components/ui/mc-popover"
import { parseBirthDate } from "@/lib/registrations/schema"

const pad = (value: number) => String(value).padStart(2, "0")

/** `dd/mm/yyyy` from what was typed: digits only, slashes added as the visitor goes. */
function maskDate(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 8)
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join("/")
}

function toDisplay(date: Date) {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
}

/** Local date of a `dd/mm/yyyy` value, the calendar works with local dates. */
function toCalendarDate(value: string) {
  const parsed = parseBirthDate(value)
  return parsed
    ? new Date(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate())
    : undefined
}

const today = new Date()
const OLDEST_YEAR = today.getFullYear() - 100
/** The calendar opens on someone around the typical first-year age when nothing is picked yet. */
const DEFAULT_MONTH = new Date(today.getFullYear() - 18, 0)

/** Date of birth: type `dd/mm/yyyy` or pick it in the calendar, with year and month dropdowns. */
export function BirthDateField() {
  const { id, value, error, onValueChange, onBlur } = useRegistrationField("birthDate")
  const [open, setOpen] = useState(false)
  const selected = toCalendarDate(value)

  return (
    <McInput
      id={id}
      inputMode="numeric"
      autoComplete="bday"
      label="Date of birth"
      placeholder="dd/mm/yyyy"
      value={value}
      error={error}
      onChange={(event) => onValueChange(maskDate(event.target.value))}
      onBlur={onBlur}
      className={INPUT_FIELD_CLASS}
      addonEnd={
        <McPopover open={open} onOpenChange={setOpen}>
          <McPopoverTrigger
            aria-label="Open the calendar"
            className="grid size-7 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring"
          >
            <CalendarIcon className="size-5" aria-hidden />
          </McPopoverTrigger>
          <McPopoverContent align="end" sideOffset={8} className="gap-0 p-2">
            <McCalendar
              mode="single"
              selected={selected}
              defaultMonth={selected ?? DEFAULT_MONTH}
              startMonth={new Date(OLDEST_YEAR, 0)}
              endMonth={today}
              disabled={{ after: today }}
              onSelect={(date) => {
                if (!date) return
                onValueChange(toDisplay(date))
                setOpen(false)
              }}
            />
          </McPopoverContent>
        </McPopover>
      }
    />
  )
}
