"use client"

import { useEffect, useState } from "react"
import { FileIcon, ShareIcon, XIcon } from "lucide-react"

import { FIELD_LABEL_CLASS } from "@/components/registrations/fields/field-styles"
import { useRegistration } from "@/components/registrations/state/registration-context"
import { fieldId, STUDENT_ID_FIELD } from "@/components/registrations/state/registration-focus"
import { STUDENT_ID_RULES } from "@/const/registrations"
import { cn } from "@/lib/utils"

/** The name cut before its extension when too long ("Screenshot 2026-10-20 AM….png"). */
function splitName(name: string) {
  const dot = name.lastIndexOf(".")
  return dot > 0 ? [name.slice(0, dot), name.slice(dot)] : [name, ""]
}

/**
 * Student ID upload (Figma "_Input field base"), one file: a 232px drop zone. Once a file is
 * chosen (Figma "Uploaded"), the card shows its preview in the middle (196×122, a file icon for a
 * PDF) with its name under it and a remove button above its corner. Clicking or dropping on the
 * card again replaces the file.
 */
export function StudentIdUpload() {
  const { studentId, studentIdError, setStudentId } = useRegistration()
  const [dragging, setDragging] = useState(false)
  const id = fieldId(STUDENT_ID_FIELD)
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  // Read as a data URL, not an object URL: Strict Mode runs the cleanup of an object URL
  // effect once too many times and would revoke the URL the image still shows.
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null)
  useEffect(() => {
    if (!studentId?.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = () => setPreview({ file: studentId, url: String(reader.result) })
    reader.readAsDataURL(studentId)
    return () => {
      reader.onload = null
      reader.abort()
    }
  }, [studentId])
  const previewUrl = preview?.file === studentId ? preview.url : null

  return (
    <div className="flex flex-col gap-1.5">
      <span className={FIELD_LABEL_CLASS}>Certificate of enrollment or student ID</span>

      {/* One 232px card: the drop zone, then the uploaded file's preview once there is one. */}
      <div className="relative h-58">
        <label
          htmlFor={id}
          data-dragging={dragging || undefined}
          data-error={studentIdError ? "" : undefined}
          data-filled={studentId ? "" : undefined}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            setStudentId(event.dataTransfer.files[0] ?? null)
          }}
          className={cn(
            "absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border border-border bg-input px-3.5 py-2.5 text-center shadow-xs transition-all",
            "hover:border-ring has-focus-visible:ring-4 has-focus-visible:ring-ring",
            "data-dragging:border-ring data-dragging:bg-secondary data-error:border-destructive",
          )}
        >
          <input
            id={id}
            type="file"
            accept={STUDENT_ID_RULES.accept}
            aria-describedby={studentIdError ? `${errorId} ${hintId}` : hintId}
            aria-invalid={!!studentIdError || undefined}
            aria-label={
              studentId
                ? `Certificate of enrollment or student ID: ${studentId.name}. Choose another file`
                : "Certificate of enrollment or student ID"
            }
            className="sr-only"
            onChange={(event) => {
              setStudentId(event.target.files?.[0] ?? null)
              // Same file again must trigger `change` after a removal.
              event.target.value = ""
            }}
          />

          {!studentId ? (
            <>
              <ShareIcon className="size-6 text-muted-foreground" strokeWidth={1.5} aria-hidden />
              <span className="w-49.75 text-base leading-6 text-muted-foreground uppercase">
                Click to upload student ID
              </span>
            </>
          ) : (
            // Figma "Uploaded File Preview": room for the remove button (over it, outside the
            // label), then the preview and the file name.
            <span className="flex w-49 flex-col items-center pt-6">
              {previewUrl ? (
                // A local data URL: next/image cannot optimize it.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt={`Preview of ${studentId.name}`}
                  className="h-30.5 w-full rounded-[6.224px] object-cover"
                />
              ) : (
                <span className="grid h-30.5 w-full place-items-center rounded-[6.224px] border border-border bg-card">
                  <FileIcon
                    className="size-12 text-muted-foreground"
                    strokeWidth={1.25}
                    aria-hidden
                  />
                </span>
              )}
              <span
                title={studentId.name}
                className="flex w-full justify-center text-xs leading-4.5 text-muted-foreground"
              >
                <span className="truncate">{splitName(studentId.name)[0]}</span>
                <span className="shrink-0">{splitName(studentId.name)[1]}</span>
              </span>
            </span>
          )}
        </label>

        {/* Figma "Remove File": above the preview's top right corner (the preview, 164px high
            with it, sits in the middle of the card). */}
        {studentId && (
          <button
            type="button"
            aria-label={`Remove ${studentId.name}`}
            onClick={() => setStudentId(null)}
            className="absolute top-[calc(50%-5.125rem)] left-[calc(50%+4.875rem)] grid size-5 cursor-pointer place-items-center rounded-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring"
          >
            <XIcon className="size-5" strokeWidth={1.2} aria-hidden />
          </button>
        )}
      </div>

      <p id={hintId} className="sr-only">
        {STUDENT_ID_RULES.label}
      </p>
      {studentIdError && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {studentIdError}
        </p>
      )}
    </div>
  )
}
