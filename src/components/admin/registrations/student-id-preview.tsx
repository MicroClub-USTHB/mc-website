"use client"

import Image from "next/image"
import { ExternalLinkIcon, FileXIcon } from "lucide-react"
import { useState } from "react"

/**
 * The student ID served by the guarded file route: an image inline or a PDF embedded, with a link
 * to open it alone. Shows "File unavailable" when the image cannot load.
 */
export function StudentIdPreview({
  src,
  isPdf,
  name,
}: {
  src: string
  isPdf: boolean
  name: string
}) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border px-4 py-10 text-center text-muted-foreground">
        <FileXIcon className="size-6" aria-hidden />
        <p className="paragraph-sm">File unavailable</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {isPdf ? (
        <iframe
          src={src}
          title={`Student ID of ${name}`}
          className="h-[32rem] w-full rounded-lg border border-border bg-muted"
        />
      ) : (
        <Image
          src={src}
          alt={`Student ID of ${name}`}
          width={800}
          height={600}
          unoptimized
          onError={() => setFailed(true)}
          className="max-h-[32rem] w-full rounded-lg border border-border bg-muted object-contain"
        />
      )}
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-fit items-center gap-1.5 paragraph-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Open in a new tab
        <ExternalLinkIcon className="size-4" aria-hidden />
      </a>
    </div>
  )
}
