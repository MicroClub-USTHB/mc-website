"use client"

import { useState } from "react"

import { McInput } from "@/components/ui/mc-input"
import {
  McSelect,
  McSelectContent,
  McSelectItem,
  McSelectLabel,
  McSelectTrigger,
  McSelectValue,
} from "@/components/ui/mc-select"

export type Interviewer = { id: string; name: string }

const UNASSIGNED = ""

/**
 * The interview's date and host, both optional: the host can be another HR member than the one
 * asking for the interview. Read from the form as `interviewAt` and `interviewerId`.
 */
export function InterviewScheduleFields({
  interviewers,
  defaultAt = "",
  defaultInterviewerId = "",
  error,
}: {
  interviewers: Interviewer[]
  /** A `datetime-local` value in club time. */
  defaultAt?: string
  defaultInterviewerId?: string
  error?: string
}) {
  const [interviewerId, setInterviewerId] = useState(defaultInterviewerId)
  const items = [
    { value: UNASSIGNED, label: "Not assigned yet" },
    ...interviewers.map((user) => ({ value: user.id, label: user.name })),
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <McInput
        label="Date and time (optional)"
        name="interviewAt"
        type="datetime-local"
        step={300}
        defaultValue={defaultAt}
        error={error}
        description="Algiers time."
      />
      <div className="flex flex-col gap-1.5">
        <input type="hidden" name="interviewerId" value={interviewerId} />
        <McSelect
          items={items}
          value={interviewerId}
          onValueChange={(value) => setInterviewerId(String(value ?? UNASSIGNED))}
        >
          <McSelectLabel>Interviewer (optional)</McSelectLabel>
          <McSelectTrigger className="w-full" aria-label="Interviewer">
            <McSelectValue placeholder="Not assigned yet" />
          </McSelectTrigger>
          <McSelectContent
            className="h-auto max-h-(--available-height) w-(--anchor-width)"
            alignItemWithTrigger={false}
            scrollbar
            data-lenis-prevent
          >
            {items.map((item) => (
              <McSelectItem key={item.value || "none"} value={item.value}>
                {item.label}
              </McSelectItem>
            ))}
          </McSelectContent>
        </McSelect>
      </div>
    </div>
  )
}
