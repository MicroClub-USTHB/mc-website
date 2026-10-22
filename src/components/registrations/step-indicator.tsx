"use client"

import type { LucideIcon } from "lucide-react"

import {
  useRegistration,
  useRegistrationSelector,
} from "@/components/registrations/state/registration-context"
import { STUDENT_ID_FIELD } from "@/components/registrations/state/registration-focus"
import { REGISTRATION_STEPS } from "@/const/registrations"
import { STEP_FIELDS, type RegistrationField } from "@/lib/registrations/schema"
import { cn } from "@/lib/utils"

type StepState = "default" | "selected" | "done"

/** Questions of each step: its fields (the phone's country is part of the phone), plus the ID. */
const QUESTIONS = STEP_FIELDS.map((fields, step) => [
  ...fields.filter((field) => field !== "phoneCountry"),
  ...(step === 0 ? [STUDENT_ID_FIELD] : []),
])

/** Circumference of the 62px ring (radius 31). */
const RING = 2 * Math.PI * 31

/**
 * Circle of a step (Figma "indicators"): a plain 52px circle, the glazed one when reached. The
 * current step sits in a dashed 62px ring, one dash per question of the step (answered ones lit).
 * Finishing the step closes the ring (Figma "Animation"): the dashes stretch round into a full
 * circle as it turns, then it shrinks onto the circle and fades. Going back opens it again.
 * Transforms, opacity and the dash pattern only: nothing laid out again.
 */
function Indicator({
  state,
  icon: Icon,
  questions,
  answered,
}: {
  state: StepState
  icon: LucideIcon
  questions: number
  answered: number
}) {
  const selected = state === "selected"
  const done = state === "done"
  const dash = RING / (questions * 2)

  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center",
        selected ? "size-[62px]" : "size-13",
      )}
    >
      <span
        className={cn(
          "grid size-13 place-items-center rounded-full transition-colors duration-300 ease-out-quart",
          state === "default"
            ? "border border-border bg-input text-muted-foreground"
            : "text-[color-mix(in_srgb,var(--color-primary)_17%,var(--color-primary-foreground))] glaze",
        )}
      >
        <Icon
          className={state === "default" ? "size-[27.267px]" : "size-[28.364px]"}
          strokeWidth={2}
          aria-hidden
        />
      </span>
      <svg
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 left-1/2 size-16 -translate-1/2 overflow-visible motion-reduce:transition-none",
          selected && "-rotate-90 opacity-100 transition-[opacity,rotate] duration-300",
          // Closes as it turns a third of a turn, then shrinks onto the circle (46px) and fades.
          done &&
            "scale-[0.74] rotate-30 opacity-0 transition-[rotate,scale,opacity] delay-[0ms,550ms,550ms] duration-[700ms,450ms,450ms] ease-in-out-quart",
          state === "default" && "-rotate-90 opacity-0",
        )}
      >
        <circle
          cx="32"
          cy="32"
          r="31"
          className={cn(
            "transition-[stroke-dasharray,stroke-opacity] duration-700 ease-in-out-quart motion-reduce:transition-none",
            done
              ? "stroke-primary"
              : "stroke-[color-mix(in_srgb,var(--color-primary)_17%,var(--color-primary-foreground))] [stroke-opacity:0.7]",
          )}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={done ? `${RING / questions} 0` : `${dash} ${dash}`}
        />
        {/* The answered questions' dashes, lit in turn. */}
        <circle
          cx="32"
          cy="32"
          r="31"
          className={cn(
            "stroke-primary transition-[stroke-dasharray,opacity] duration-500 ease-out-quart",
            !selected && "opacity-0",
          )}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={[
            ...Array(selected ? answered : 0).fill(`${dash} ${dash}`),
            `0 ${RING}`,
          ].join(" ")}
        />
      </svg>
    </span>
  )
}

/**
 * Step navigation (Figma "Step Navigation"): three steps joined by progress lines. A step you
 * already reached is a button that jumps back to it. The current step is told with `aria-current`.
 */
export function StepIndicator() {
  const { goToStep, studentId } = useRegistration()
  const current = useRegistrationSelector((state) => state.step)
  const furthestStep = useRegistrationSelector((state) => state.furthestStep)
  // Questions of the current step with an answer: its ring's lit dashes and the line after it.
  const filled = useRegistrationSelector(
    (state) =>
      QUESTIONS[state.step].filter((field) => {
        if (field === STUDENT_ID_FIELD) return false
        const value = state.values[field as RegistrationField]
        return Array.isArray(value) ? value.length > 0 : value.trim() !== ""
      }).length,
  )
  const answered = filled + (current === 0 && studentId ? 1 : 0)
  const questions = QUESTIONS[current].length

  return (
    <nav aria-label="Registration progress" className="w-full">
      <ol className="flex w-full items-start">
        {REGISTRATION_STEPS.map((item, index) => {
          const state: StepState =
            index === current ? "selected" : index < current ? "done" : "default"
          const reachable = index <= furthestStep && index !== current

          return (
            <li key={item.name} className="contents">
              <div
                className={cn(
                  "flex flex-col items-center",
                  // The current step is 10px taller (62px ring): the others sit 5px lower, as in Figma.
                  index === current ? "mt-0" : "mt-[5px]",
                )}
              >
                <button
                  type="button"
                  disabled={!reachable}
                  onClick={() => goToStep(index)}
                  aria-label={`Step ${index + 1}: ${item.name}`}
                  aria-current={index === current ? "step" : undefined}
                  className={cn(
                    "group flex flex-col items-center gap-4 rounded-lg outline-none focus-visible:ring-4 focus-visible:ring-ring disabled:cursor-default",
                    reachable && "cursor-pointer",
                  )}
                >
                  <Indicator
                    state={state}
                    icon={item.icon}
                    questions={QUESTIONS[index].length}
                    answered={index === current ? answered : 0}
                  />
                  <span className="text-sm leading-5 font-medium text-muted-foreground">
                    STEP {index + 1}
                  </span>
                </button>
                {/* Phones: the three names would not fit, the current one shows under the steps. */}
                <span
                  aria-hidden
                  className="hidden text-base leading-6 font-medium text-foreground sm:block"
                >
                  {item.name}
                </span>
              </div>

              {/* A line to the next step, lit by the glossy bar: full once passed, filling as
                  the current step's questions are answered. */}
              {index < REGISTRATION_STEPS.length - 1 && (
                <div
                  aria-hidden
                  className="relative mt-[25.5px] flex h-1.5 min-w-3 flex-1 items-center"
                >
                  <div className="h-[3px] w-full rounded-full bg-border" />
                  <div
                    style={{
                      scale: `${index < current ? 1 : index === current ? answered / questions : 0} 1`,
                    }}
                    className="absolute inset-0 origin-left rounded-full glaze-bar transition-[scale] duration-500 ease-out-expo"
                  />
                </div>
              )}
            </li>
          )
        })}
      </ol>
      <p className="mt-4 text-center text-base leading-6 font-medium text-foreground sm:hidden">
        {REGISTRATION_STEPS[current].name}
      </p>
    </nav>
  )
}
