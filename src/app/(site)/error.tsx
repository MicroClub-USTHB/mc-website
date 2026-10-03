"use client"

import { useEffect } from "react"

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    // TODO: report to an error tracking service.
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="header-md font-semibold">Something went wrong</h1>
      <p className="paragraph-md text-muted-foreground">
        An unexpected error occurred. Please try again.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="inline-flex h-10 items-center rounded-lg bg-primary px-4 font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Try again
      </button>
    </div>
  )
}
