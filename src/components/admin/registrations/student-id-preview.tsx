"use client"

import Image from "next/image"
import { ExpandIcon, ExternalLinkIcon, FileXIcon } from "lucide-react"
import { useState } from "react"

import { Keys } from "@/components/admin/shortcuts/kbd"
import { useShortcut } from "@/components/admin/shortcuts/use-shortcut"
import {
  McDialog,
  McDialogContent,
  McDialogDescription,
  McDialogHeader,
  McDialogTitle,
} from "@/components/ui/mc-dialog"

const LINK =
  "inline-flex w-fit items-center gap-1.5 rounded-sm paragraph-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-4 focus-visible:ring-ring"

/**
 * The student ID served by the guarded file route: an image inline or a PDF embedded, with a link
 * to open it alone. Clicking it or pressing S shows it large; Esc closes it. Shows "File
 * unavailable" when the image cannot load.
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
  const [open, setOpen] = useState(false)
  useShortcut("s", () => setOpen(true), !failed)

  if (failed) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border px-4 py-10 text-center text-muted-foreground">
        <FileXIcon className="size-6" aria-hidden />
        <p className="paragraph-sm">File unavailable</p>
      </div>
    )
  }

  const title = `Student ID of ${name}`

  return (
    <div className="flex flex-col gap-3">
      {isPdf ? (
        <iframe
          src={src}
          title={title}
          className="h-[32rem] w-full rounded-lg border border-border bg-muted"
        />
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="cursor-zoom-in rounded-lg outline-none focus-visible:ring-4 focus-visible:ring-ring"
          aria-label={`Show the ${title.toLowerCase()} large`}
        >
          <Image
            src={src}
            alt={title}
            width={800}
            height={600}
            unoptimized
            onError={() => setFailed(true)}
            className="max-h-[32rem] w-full rounded-lg border border-border bg-muted object-contain"
          />
        </button>
      )}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <button type="button" onClick={() => setOpen(true)} className={LINK} aria-keyshortcuts="S">
          <ExpandIcon className="size-4" aria-hidden />
          Show large
          <Keys keys={["S"]} />
        </button>
        <a href={src} target="_blank" rel="noopener noreferrer" className={LINK}>
          Open in a new tab
          <ExternalLinkIcon className="size-4" aria-hidden />
        </a>
      </div>

      <McDialog open={open} onOpenChange={setOpen}>
        <McDialogContent className="max-h-[calc(100dvh-2rem)] w-[min(64rem,calc(100%-2rem))]">
          <McDialogHeader>
            <McDialogTitle>{title}</McDialogTitle>
            <McDialogDescription className="flex items-center gap-1.5">
              Press <Keys keys={["Esc"]} /> to close.
            </McDialogDescription>
          </McDialogHeader>
          {isPdf ? (
            <iframe
              src={src}
              title={title}
              className="h-[calc(100dvh-12rem)] w-full rounded-lg border border-border bg-muted"
            />
          ) : (
            <Image
              src={src}
              alt={title}
              width={1600}
              height={1200}
              unoptimized
              className="max-h-[calc(100dvh-12rem)] w-full rounded-lg bg-muted object-contain"
            />
          )}
        </McDialogContent>
      </McDialog>
    </div>
  )
}
