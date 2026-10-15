"use client"

import { useState } from "react"

import { ArrowUpIcon } from "@/components/icons/arrow-up"
import { McButton } from "@/components/ui/mc-button"

type MessageInputProps = {
  ref?: React.Ref<HTMLInputElement>
  placeholder: string
  /** True while MicroBot answers: the next question waits for the answer. */
  busy: boolean
  onSend: (question: string) => void
}

/** Message input at the bottom of the panel: placeholder and send button. */
export function MessageInput({ ref, placeholder, busy, onSend }: MessageInputProps) {
  const [value, setValue] = useState("")
  const canSend = value.trim().length > 0 && !busy

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSend) return
    onSend(value)
    setValue("")
  }

  return (
    <form
      onSubmit={submit}
      className="flex h-20.25 shrink-0 items-center justify-between gap-4 rounded-b-[inherit] border-t bg-input p-6"
    >
      <input
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder.replace(/\s*\.+$/, "")}
        autoComplete="off"
        maxLength={500}
        className="min-w-0 flex-1 bg-transparent paragraph-md text-foreground caret-primary outline-none placeholder:text-muted-foreground"
      />
      <McButton
        type="submit"
        variant="primary"
        size="sm"
        icon="only"
        disabled={!canSend}
        aria-label="Send message"
        iconDefinition={<ArrowUpIcon size={20} />}
        className="shrink-0 disabled:opacity-100"
      />
    </form>
  )
}
