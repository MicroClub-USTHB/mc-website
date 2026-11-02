"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useOptimistic, useTransition } from "react"

import {
  McSelect,
  McSelectContent,
  McSelectItem,
  McSelectTrigger,
  McSelectValue,
} from "@/components/ui/mc-select"

/**
 * A list filter kept in the URL as a repeated parameter (`?to=dev&to=design`). Changing it goes
 * back to page 1; everything else in the URL stays.
 */
export function MultiSelectFilter({
  label,
  param,
  options,
  selected,
}: {
  label: string
  param: string
  options: { value: string; label: string }[]
  selected: string[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [values, setValues] = useOptimistic(selected)

  function onValueChange(next: string[]) {
    const query = new URLSearchParams(searchParams)
    query.delete(param)
    query.delete("page")
    for (const value of next) query.append(param, value)
    const text = query.toString()

    startTransition(() => {
      setValues(next)
      router.push(text ? `${pathname}?${text}` : pathname, { scroll: false })
    })
  }

  return (
    <McSelect multiple items={options} value={values} onValueChange={onValueChange}>
      <McSelectTrigger className="w-full lg:w-64" size="sm" aria-label={label}>
        <McSelectValue>
          {(current: string[]) => {
            if (current.length === 0) return `${label}: all`
            if (current.length > 1) return `${label}: ${current.length}`
            const option = options.find((item) => item.value === current[0])
            return `${label}: ${option?.label ?? current[0]}`
          }}
        </McSelectValue>
      </McSelectTrigger>
      <McSelectContent className="h-auto max-h-80 w-(--anchor-width)" alignItemWithTrigger={false}>
        {options.map((option) => (
          <McSelectItem key={option.value} value={option.value}>
            {option.label}
          </McSelectItem>
        ))}
      </McSelectContent>
    </McSelect>
  )
}
