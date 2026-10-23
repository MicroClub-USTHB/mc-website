import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { connection } from "next/server"

import { RegistrationFlow } from "@/components/registrations/registration-flow"
import { siteRoutes } from "@/config/site"
import { areRegistrationsOpen } from "@/lib/registrations/window"

export const metadata: Metadata = {
  title: "Registrations",
  description:
    "Join Micro Club: fill in the registration form to become a member of the USTHB student scientific club.",
  alternates: { canonical: siteRoutes.registrations },
  openGraph: {
    title: "Micro Club registrations",
    description: "Join Micro Club, the first student scientific club in Algeria, at USTHB.",
    url: siteRoutes.registrations,
  },
}

/**
 * Registrations page (Figma "Registation Form"): a three step form, personal information, about
 * you and the club, additional information. The title is server rendered, the form is a client
 * island (`RegistrationFlow`) that holds the state. Outside the registrations window
 * (`src/config/registrations.ts`) the page does not exist: a 404, checked on each request.
 */
export default async function RegistrationsPage() {
  await connection()
  if (!areRegistrationsOpen()) notFound()

  return (
    <div className="px-4 pt-[calc(var(--menu-top)+var(--menu-size)+2rem)] pb-24 sm:px-6 lg:pb-40">
      <div className="mx-auto flex w-full max-w-250 flex-col items-center gap-[54px]">
        <h1 className="text-center font-heading text-[2rem] leading-10 font-medium tracking-[-0.02em] whitespace-pre-wrap text-foreground uppercase sm:text-5xl sm:leading-tight lg:text-[3.75rem] lg:leading-[4.5rem]">
          {"MICROCLUB  REGISTRATIONS"}
        </h1>
        <RegistrationFlow />
      </div>
    </div>
  )
}
