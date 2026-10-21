"use client"

import { useRef } from "react"
import { AnimatePresence, motion } from "motion/react"

import { FormActions } from "@/components/registrations/form-actions"
import {
  RegistrationProvider,
  useRegistration,
} from "@/components/registrations/registration-context"
import { StepAbout } from "@/components/registrations/step-about"
import { StepAdditional } from "@/components/registrations/step-additional"
import { StepIndicator } from "@/components/registrations/step-indicator"
import { StepPersonal } from "@/components/registrations/step-personal"
import { REGISTRATION_HONEYPOT_FIELD } from "@/lib/registration-schema"
import { EASE_OUT_QUART } from "@/lib/easing"

const STEPS = [StepPersonal, StepAbout, StepAdditional]

/** Progress navigation, the current step and its actions, sharing the registration context. */
export function RegistrationFlow() {
  return (
    <RegistrationProvider>
      <RegistrationSteps />
    </RegistrationProvider>
  )
}

function RegistrationSteps() {
  const { step, restored, announcement, next, submit, startOver } = useRegistration()
  const honeypotRef = useRef<HTMLInputElement>(null)
  const Step = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div id="registration-top" className="flex w-full flex-col gap-16 md:gap-[122px]">
      <div className="flex flex-col gap-6">
        {restored && (
          <p
            role="status"
            className="flex flex-wrap items-center justify-center gap-x-2 text-center text-sm leading-5 text-muted-foreground"
          >
            We restored your progress.
            <button
              type="button"
              onClick={startOver}
              className="cursor-pointer font-medium text-foreground underline underline-offset-2 outline-none hover:text-accent-foreground focus-visible:ring-4 focus-visible:ring-ring"
            >
              Start over
            </button>
          </p>
        )}
        <StepIndicator />
      </div>

      <form
        noValidate
        aria-label="Micro Club registration"
        className="flex flex-col gap-22"
        onSubmit={(event) => {
          event.preventDefault()
          if (isLast) submit(honeypotRef.current?.value ?? "")
          else next()
        }}
      >
        {/* Decoy for bots: invisible and unreachable for people, a filled one gets a fake success. */}
        <input
          ref={honeypotRef}
          type="text"
          name={REGISTRATION_HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="pointer-events-none absolute h-0 w-0 opacity-0"
        />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: EASE_OUT_QUART }}
          >
            <Step />
          </motion.div>
        </AnimatePresence>

        <FormActions />
      </form>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  )
}
