"use client"

import { format } from "date-fns"
import { UsersRoundIcon } from "lucide-react"

import { CreateUserDialog } from "@/components/admin/create-user-dialog"
import { UserActionsMenu } from "@/components/admin/user-actions-menu"
import { McBadge } from "@/components/ui/mc-badge"
import {
  createMcDataTableColumnHelper,
  McDataTable,
  McDataTableCard,
  McDataTableCellUser,
  McDataTableEmpty,
  McDataTableHeader,
} from "@/components/ui/mc-data-table"

export type HrUserRow = {
  id: string
  name: string
  email: string
  /** `false` once the president deactivated the account. */
  active: boolean
  /** ISO date. */
  createdAt: string
}

const column = createMcDataTableColumnHelper<HrUserRow>()

const columns = [
  column.accessor("name", {
    header: "Member",
    cell: ({ row }) => (
      <McDataTableCellUser title={row.original.name} subtitle={row.original.email} />
    ),
  }),
  column.accessor("active", {
    header: "Status",
    cell: ({ getValue }) =>
      getValue() ? (
        <McBadge variant="default">Active</McBadge>
      ) : (
        <McBadge variant="destructive">Deactivated</McBadge>
      ),
  }),
  column.accessor("createdAt", {
    header: "Created",
    sortFn: "datetime",
    cell: ({ getValue }) => format(new Date(getValue()), "d MMM yyyy"),
  }),
  column.display({
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <UserActionsMenu user={row.original} />,
    meta: { cellClassName: "w-px text-right" },
  }),
]

/** The HR accounts, with the create button and a menu of actions on each row. */
export function UsersTable({ users }: { users: HrUserRow[] }) {
  return (
    <McDataTableCard>
      <McDataTableHeader
        title="Accounts"
        badge={users.length}
        description="Deactivate the members who leave the team: their account stays, but cannot sign in."
        actions={<CreateUserDialog />}
      />
      <McDataTable
        columns={columns}
        data={users}
        getRowId={(user) => user.id}
        empty={
          <McDataTableEmpty
            icon={<UsersRoundIcon />}
            title="No HR member yet"
            description="Create the first account: its sign-in details are sent by email."
          />
        }
      />
    </McDataTableCard>
  )
}
