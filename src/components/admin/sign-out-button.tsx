"use client"

import { LogOutIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

import { McButton } from "@/components/ui/mc-button"
import { adminRoutes } from "@/config/admin"
import { authClient } from "@/lib/auth/client"

export function SignOutButton() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <McButton
      variant="tertiary"
      size="sm"
      icon="leading"
      iconDefinition={<LogOutIcon className="size-4" />}
      isLoading={pending}
      onClick={() =>
        startTransition(async () => {
          await authClient.signOut()
          router.replace(adminRoutes.signIn)
          router.refresh()
        })
      }
    >
      Sign out
    </McButton>
  )
}
