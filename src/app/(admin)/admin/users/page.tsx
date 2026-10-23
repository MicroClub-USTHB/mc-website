import type { Metadata } from "next"
import { headers } from "next/headers"

import { UsersTable, type HrUserRow } from "@/components/admin/users-table"
import { auth } from "@/lib/auth/auth"
import { requireStaff } from "@/lib/auth/session"

export const metadata: Metadata = { title: "HR members" }

/** President only: the HR accounts, created and managed from here. */
export default async function UsersPage() {
  await requireStaff({ permissions: { user: ["list"] } })

  const { users } = await auth.api.listUsers({
    headers: await headers(),
    query: {
      filterField: "role",
      filterValue: "hr",
      filterOperator: "eq",
      sortBy: "createdAt",
      sortDirection: "desc",
      limit: 500,
    },
  })

  const rows: HrUserRow[] = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    active: !user.banned,
    createdAt: new Date(user.createdAt).toISOString(),
  }))

  return (
    <div className="mx-auto flex w-full max-w-site flex-col gap-6 px-4 py-12 sm:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="header-md font-heading text-foreground">HR members</h1>
        <p className="paragraph-md text-muted-foreground">
          Create the accounts of the HR team, who review the registrations. Each new member gets a
          generated password by email and chooses their own at first sign-in.
        </p>
      </div>
      <UsersTable users={rows} />
    </div>
  )
}
