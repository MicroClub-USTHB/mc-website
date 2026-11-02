import Link from "next/link"
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react"

import { McTableHead } from "@/components/ui/mc-data-table"
import type { SortOrder } from "@/lib/registrations/list-params"

/** Column header linking to the table sorted by it; `order` is set on the sorted column. */
export function SortHeader({
  label,
  href,
  order,
}: {
  label: string
  href: string
  order: SortOrder | null
}) {
  const active = order !== null
  const Icon = !active ? ArrowUpDownIcon : order === "asc" ? ArrowUpIcon : ArrowDownIcon
  return (
    <McTableHead aria-sort={active ? (order === "asc" ? "ascending" : "descending") : undefined}>
      <Link
        href={href}
        className="inline-flex items-center gap-1 rounded-sm outline-none hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring aria-[current=true]:text-foreground"
        aria-current={active || undefined}
      >
        {label}
        <Icon className={active ? "size-3.5" : "size-3.5 opacity-40"} aria-hidden />
      </Link>
    </McTableHead>
  )
}
