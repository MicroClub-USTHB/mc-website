import Link from "next/link"
import { ArrowRightIcon, UserPlusIcon } from "lucide-react"

import { McButton } from "@/components/ui/mc-button"
import { adminRoutes } from "@/config/admin"

/** Registrations reviewed once by someone else: one review from this member decides them. */
export function NeedYouBanner({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
          <UserPlusIcon className="size-5" aria-hidden />
        </span>
        <p className="paragraph-md text-foreground">
          <span className="font-medium tabular-nums">
            {count} application{count > 1 ? "s" : ""}
          </span>{" "}
          {count > 1 ? "have" : "has"} only one review. They only need you.
        </p>
      </div>
      <McButton
        variant="secondary"
        icon="trailing"
        iconDefinition={<ArrowRightIcon className="size-4" />}
        nativeButton={false}
        render={<Link href={`${adminRoutes.registrations}?status=second-review`} />}
        className="shrink-0"
      >
        Review them
      </McButton>
    </section>
  )
}
