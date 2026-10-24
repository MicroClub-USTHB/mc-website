"use client"

import { CheckIcon, CopyIcon } from "lucide-react"
import { useState } from "react"

import { McButton } from "@/components/ui/mc-button"

/** Copies `value` to the clipboard, then shows a check for a moment. */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <McButton
      variant="tertiary"
      size="sm"
      icon="only"
      iconDefinition={copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      onClick={copy}
      className="size-8 p-0"
    />
  )
}
