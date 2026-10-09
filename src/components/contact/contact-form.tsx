"use client"

import { useActionState, useState, type FormEvent } from "react"
import { CircleIcon, MailIcon, UserRoundIcon } from "lucide-react"

import { sendContactMessage, type ContactState } from "@/actions/send-contact-message"
import { McButton } from "@/components/ui/mc-button"
import { McInput } from "@/components/ui/mc-input"
import { McTextarea } from "@/components/ui/mc-textarea"
import {
  CONTACT_LIMITS,
  HONEYPOT_FIELD,
  readContactValues,
  validateContact,
  type ContactErrors,
} from "@/lib/contact-validation"

const INITIAL_STATE: ContactState = { status: "idle" }

/** Figma fields are 16px (`paragraph-md`), the mcoli-ui defaults are 14px. */
const FIELD_CLASSNAME =
  "[&_[data-slot=input-label]]:paragraph-md [&_[data-slot=textarea-label]]:paragraph-md [&_[data-slot=input]]:h-10.5 [&_[data-slot=input]]:paragraph-md [&_[data-slot=textarea]]:paragraph-md [&_[data-slot=textarea]]:h-30.5"

/** Contact form: validates on submit, then sends through the `sendContactMessage` Server Action. */
export function ContactForm() {
  const [state, formAction, pending] = useActionState(sendContactMessage, INITIAL_STATE)
  const [clientErrors, setClientErrors] = useState<ContactErrors>({})

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const errors = validateContact(readContactValues(new FormData(event.currentTarget)))
    setClientErrors(errors)
    if (Object.keys(errors).length > 0) event.preventDefault()
  }

  const errors = { ...state.errors, ...clientErrors }
  const values = state.values

  return (
    <form
      // Remount on success so the fields start empty again.
      key={state.status === "success" ? "sent" : "editing"}
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-7.5"
    >
      {/* Honeypot: hidden from people and screen readers, filled by bots. */}
      <div aria-hidden className="absolute -left-2499.75 h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-col gap-3.75">
        <McInput
          className={FIELD_CLASSNAME}
          label="Full Name"
          name="name"
          autoComplete="name"
          placeholder="Micro club"
          maxLength={CONTACT_LIMITS.name}
          required
          defaultValue={values?.name}
          error={errors.name}
          addonStart={<UserRoundIcon className="size-5" />}
        />
        <McInput
          className={FIELD_CLASSNAME}
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="youremail@gmail.com"
          maxLength={CONTACT_LIMITS.email}
          required
          defaultValue={values?.email}
          error={errors.email}
          addonStart={<MailIcon className="size-5" />}
        />
        <McTextarea
          className={FIELD_CLASSNAME}
          label="Your Message"
          name="message"
          placeholder="Write here...."
          maxLength={CONTACT_LIMITS.message}
          required
          defaultValue={values?.message}
          error={errors.message}
        />
      </div>

      <div className="flex flex-col gap-3">
        <McButton
          type="submit"
          size="lg"
          icon="trailing"
          iconDefinition={<CircleIcon />}
          isLoading={pending}
          className="w-full border-0"
        >
          Submit Form
        </McButton>
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={
            state.status === "error"
              ? "paragraph-sm text-destructive empty:hidden"
              : "paragraph-sm text-success empty:hidden"
          }
        >
          {state.status === "idle" || state.errors ? null : state.message}
        </p>
      </div>
    </form>
  )
}
