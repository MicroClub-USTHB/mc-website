import Image from "next/image"
import Link from "next/link"

import { AdminNav } from "@/components/admin/admin-nav"
import { SignOutButton } from "@/components/admin/sign-out-button"
import { McBadge } from "@/components/ui/mc-badge"
import { roleNav } from "@/config/admin"
import { isStaffRole } from "@/lib/auth/permissions"
import { getSession, homeFor } from "@/lib/auth/session"

const ROLE_LABEL: Record<string, string> = { president: "President", hr: "HR" }

/** Navy bar with the logo and the signed-in user, above the links to their role's pages. */
export async function AdminHeader() {
  const session = await getSession()
  const user = session?.user
  const links = user && !user.mustChangePassword && isStaffRole(user.role) ? roleNav[user.role] : []

  return (
    <header className="bg-primary text-primary-foreground">
      <div className="mx-auto flex h-16 max-w-site items-center justify-between gap-4 px-4 sm:px-8">
        <Link
          href={user ? homeFor(user) : "/"}
          className="flex items-center gap-3 rounded-sm outline-none focus-visible:ring-4 focus-visible:ring-ring"
        >
          <Image src="/brand/mc-logo.svg" alt="" width={40} height={28} className="h-7 w-auto" />
          <span className="header-xs font-heading">Admin</span>
        </Link>
        {user && (
          <div className="flex items-center gap-3">
            <span className="hidden paragraph-sm sm:inline">{user.name}</span>
            {user.role && ROLE_LABEL[user.role] && (
              <McBadge variant="secondary">{ROLE_LABEL[user.role]}</McBadge>
            )}
            <SignOutButton />
          </div>
        )}
      </div>
      {links.length > 0 && <AdminNav links={links} />}
    </header>
  )
}
