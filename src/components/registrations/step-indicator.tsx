"use client"

import type { LucideIcon } from "lucide-react"

import { useRegistration } from "@/components/registrations/registration-context"
import { REGISTRATION_STEPS } from "@/const/registrations"
import { cn } from "@/lib/utils"

type StepState = "default" | "selected" | "done"

/**
 * Circle of a step (Figma "indicators"): a plain 52px circle, a filled one when done, and a filled
 * one inside a dashed 62px ring when it is the current step.
 */
function Indicator({ state, icon: Icon }: { state: StepState; icon: LucideIcon }) {
  const selected = state === "selected"

  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center",
        // The ring makes the current step 62px, the others stay 52px.
        selected ? "size-[62px]" : "size-13",
      )}
    >
      <span
        className={cn(
          "grid size-13 place-items-center rounded-full transition-colors duration-300 ease-out-quart",
          state === "default"
            ? "border border-border bg-input text-muted-foreground"
            : "bg-secondary-foreground text-primary-foreground",
        )}
      >
        <Icon
          className={state === "default" ? "size-[27.267px]" : "size-[28.364px]"}
          strokeWidth={2}
          aria-hidden
        />
      </span>
      {selected && (
        <svg
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden
          className="absolute -inset-px size-[64px] overflow-visible text-secondary-foreground motion-safe:animate-[spin_30s_linear_infinite]"
        >
          <circle
            cx="32"
            cy="32"
            r="31"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="8 8"
          />
        </svg>
      )}
    </span>
  )
}

/**
 * Step navigation (Figma "Step Navigation"): three steps joined by progress lines. A step you
 * already reached is a button that jumps back to it. The current step is told with `aria-current`.
 */
export function StepIndicator() {
  const { step: current, furthestStep, goToStep } = useRegistration()

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
                  <Indicator state={state} icon={item.icon} />
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

              {index < REGISTRATION_STEPS.length - 1 && (
                <div
                  aria-hidden
                  className="mt-7 h-[3px] min-w-3 flex-1 overflow-hidden rounded-full bg-border"
                >
                  <div
                    className={cn(
                      "h-full origin-left rounded-full bg-secondary-foreground transition-transform duration-500 ease-out-expo",
                      index < current ? "scale-x-100" : "scale-x-0",
                    )}
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
