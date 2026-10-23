import type { Metadata } from "next"

import { requireStaff } from "@/lib/auth/session"

export const metadata: Metadata = { title: "Registrations" }

/** HR home: the registrations review comes in the next feature. The president lands on the users page. */
export default async function AdminHomePage() {
  const { user } = await requireStaff({ permissions: { registration: ["review"] } })

  return (
    <div className="mx-auto flex w-full max-w-site flex-col gap-2 px-4 py-12 sm:px-8">
      <h1 className="header-md font-heading text-foreground">Welcome, {user.name}</h1>
      <p className="paragraph-md text-muted-foreground">
        The registrations review will be available here soon.
      </p>
    </div>
  )
}
