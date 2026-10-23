"use client"

import {
  EllipsisVerticalIcon,
  KeyRoundIcon,
  Trash2Icon,
  UserCheckIcon,
  UserXIcon,
} from "lucide-react"
import { useState, useTransition } from "react"

import {
  deactivateHrUser,
  deleteHrUser,
  reactivateHrUser,
  resetHrUserPassword,
  type HrUserActionResult,
} from "@/actions/manage-hr-users"
import type { HrUserRow } from "@/components/admin/users-table"
import {
  McAlertDialog,
  McAlertDialogAction,
  McAlertDialogCancel,
  McAlertDialogContent,
  McAlertDialogDescription,
  McAlertDialogFooter,
  McAlertDialogHeader,
  McAlertDialogTitle,
} from "@/components/ui/mc-alert-dialog"
import { McButton } from "@/components/ui/mc-button"
import {
  McDropdownMenu,
  McDropdownMenuContent,
  McDropdownMenuItem,
  McDropdownMenuSeparator,
  McDropdownMenuTrigger,
} from "@/components/ui/mc-dropdown-menu"
import { useFeedbackModal } from "@/providers/feedback-modal-provider"

type ActionId = "deactivate" | "reactivate" | "reset" | "delete"

type ActionConfig = {
  title: string
  description: (name: string) => string
  confirmLabel: string
  destructive?: boolean
  run: (userId: string) => Promise<HrUserActionResult>
}

const ACTIONS: Record<ActionId, ActionConfig> = {
  deactivate: {
    title: "Deactivate this account?",
    description: (name) =>
      `${name} will be signed out and will no longer be able to sign in. You can reactivate the account later.`,
    confirmLabel: "Deactivate",
    destructive: true,
    run: deactivateHrUser,
  },
  reactivate: {
    title: "Reactivate this account?",
    description: (name) => `${name} will be able to sign in again with their current password.`,
    confirmLabel: "Reactivate",
    run: reactivateHrUser,
  },
  reset: {
    title: "Reset the password?",
    description: (name) =>
      `${name} will be signed out and will receive a new generated password by email, to change at the next sign-in.`,
    confirmLabel: "Reset and send",
    run: resetHrUserPassword,
  },
  delete: {
    title: "Delete this account?",
    description: (name) =>
      `The account of ${name} will be deleted for good. To only block sign-in, deactivate it instead.`,
    confirmLabel: "Delete",
    destructive: true,
    run: deleteHrUser,
  },
}

const RESULT_TITLE: Record<ActionId, string> = {
  deactivate: "Account deactivated",
  reactivate: "Account reactivated",
  reset: "Password reset",
  delete: "Account deleted",
}

/** Row menu of the users table; each action asks for confirmation first. */
export function UserActionsMenu({ user }: { user: HrUserRow }) {
  const [confirming, setConfirming] = useState<ActionId | null>(null)
  const [pending, startTransition] = useTransition()
  const { showSuccess, showWarning, showError } = useFeedbackModal()
  const action = confirming ? ACTIONS[confirming] : null

  function confirm() {
    if (!confirming) return
    const id = confirming
    startTransition(async () => {
      const result = await ACTIONS[id].run(user.id)
      setConfirming(null)
      const feedback = { description: result.message, actionLabel: "Done" }
      if (result.status === "success") showSuccess({ title: RESULT_TITLE[id], ...feedback })
      else if (result.status === "warning") showWarning({ title: "Email not sent", ...feedback })
      else showError({ title: "Something went wrong", ...feedback })
    })
  }

  return (
    <>
      <McDropdownMenu>
        <McDropdownMenuTrigger
          render={
            <McButton
              variant="tertiary"
              size="sm"
              icon="only"
              iconDefinition={<EllipsisVerticalIcon className="size-4" />}
              aria-label={`Actions for ${user.name}`}
            />
          }
        />
        <McDropdownMenuContent align="end">
          {user.active ? (
            <McDropdownMenuItem onClick={() => setConfirming("deactivate")}>
              <UserXIcon />
              Deactivate
            </McDropdownMenuItem>
          ) : (
            <McDropdownMenuItem onClick={() => setConfirming("reactivate")}>
              <UserCheckIcon />
              Reactivate
            </McDropdownMenuItem>
          )}
          <McDropdownMenuItem onClick={() => setConfirming("reset")}>
            <KeyRoundIcon />
            Reset password
          </McDropdownMenuItem>
          <McDropdownMenuSeparator />
          <McDropdownMenuItem variant="destructive" onClick={() => setConfirming("delete")}>
            <Trash2Icon />
            Delete
          </McDropdownMenuItem>
        </McDropdownMenuContent>
      </McDropdownMenu>

      <McAlertDialog
        open={confirming !== null}
        onOpenChange={(open) => {
          if (!open && !pending) setConfirming(null)
        }}
      >
        <McAlertDialogContent>
          <McAlertDialogHeader className="mx-6 mt-6">
            <McAlertDialogTitle>{action?.title}</McAlertDialogTitle>
            <McAlertDialogDescription>{action?.description(user.name)}</McAlertDialogDescription>
          </McAlertDialogHeader>
          <McAlertDialogFooter>
            <McAlertDialogCancel disabled={pending}>Cancel</McAlertDialogCancel>
            <McAlertDialogAction
              destructive={action?.destructive}
              isLoading={pending}
              onClick={confirm}
            >
              {action?.confirmLabel}
            </McAlertDialogAction>
          </McAlertDialogFooter>
        </McAlertDialogContent>
      </McAlertDialog>
    </>
  )
}
