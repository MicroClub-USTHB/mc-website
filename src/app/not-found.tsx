import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = { title: "Page not found" }

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="paragraph-lg font-semibold text-primary">404</p>
      <h1 className="header-md font-semibold">Page not found</h1>
      <p className="paragraph-md text-muted-foreground">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex h-10 items-center rounded-lg bg-primary px-4 font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Back to home
      </Link>
    </main>
  )
}
