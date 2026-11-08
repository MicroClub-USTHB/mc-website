"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTransition, type FormEvent } from "react"

/**
 * "Go to page" box: jumps straight to a page of a long list, keeping the search, filter and sort
 * of the URL. Pressing Enter navigates; a number out of range is clamped to the list.
 */
export function PageJump({ page, pageCount }: { page: number; pageCount: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = Number.parseInt(String(new FormData(event.currentTarget).get("page")), 10)
    if (!Number.isFinite(value)) return
    const target = Math.min(Math.max(value, 1), pageCount)
    if (target === page) return

    const query = new URLSearchParams(searchParams)
    if (target > 1) query.set("page", String(target))
    else query.delete("page")
    const search = query.toString()
    startTransition(() => router.push(search ? `${pathname}?${search}` : pathname))
  }

  return (
    <form
      key={page}
      onSubmit={handleSubmit}
      aria-busy={pending}
      className="flex items-center gap-2 paragraph-sm text-muted-foreground"
    >
      <label htmlFor="page-jump">Go to page</label>
      <input
        id="page-jump"
        name="page"
        type="number"
        inputMode="numeric"
        min={1}
        max={pageCount}
        defaultValue={page}
        onFocus={(event) => event.currentTarget.select()}
        className="h-9 w-16 rounded-lg border border-border bg-background px-2 text-center font-medium text-foreground tabular-nums outline-none focus-visible:ring-4 focus-visible:ring-ring"
      />
      <span className="tabular-nums">of {pageCount}</span>
    </form>
  )
}
