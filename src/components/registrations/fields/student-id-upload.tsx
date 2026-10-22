"use client"

import { useEffect, useState } from "react"
import { FileIcon, UploadIcon, XIcon } from "lucide-react"

import { FIELD_LABEL_CLASS } from "@/components/registrations/fields/field-styles"
import { useRegistration } from "@/components/registrations/state/registration-context"
import { fieldId, STUDENT_ID_FIELD } from "@/components/registrations/state/registration-focus"
import { STUDENT_ID_RULES } from "@/const/registrations"
import { cn } from "@/lib/utils"

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Student ID drop zone (Figma "_Input field base"): click or drop a file in the 232px box. The
 * chosen file shows below it (Figma "Uploaded"): a thumbnail when it is an image, its name and size,
 * and a remove button.
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

      <label
        htmlFor={id}
        data-dragging={dragging || undefined}
        data-error={studentIdError ? "" : undefined}
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
          "flex h-58 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-border bg-input px-3.5 py-2.5 text-center shadow-xs transition-all",
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
          className="sr-only"
          onChange={(event) => {
            setStudentId(event.target.files?.[0] ?? null)
            // Same file again must trigger `change` after a removal.
            event.target.value = ""
          }}
        />

        <UploadIcon className="size-6 text-muted-foreground" strokeWidth={1.5} aria-hidden />
        <span className="w-49.75 text-base leading-6 text-muted-foreground uppercase">
          Click to upload student ID
        </span>
      </label>

      {/* Figma "File Upload": the chosen file, with a thumbnail of it when it is an image. */}
      {studentId && (
        <div className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3">
          {previewUrl ? (
            // A local data URL: next/image cannot optimize it.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={`Preview of ${studentId.name}`}
              className="size-12 shrink-0 rounded-md border border-border object-cover"
            />
          ) : (
            <FileIcon
              className="h-[25.333px] w-[16.667px] shrink-0 text-muted-foreground"
              aria-hidden
            />
          )}
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <span className="truncate text-base leading-6 font-medium text-card-foreground">
              {studentId.name}
            </span>
            <span className="text-xs leading-6 font-medium text-muted-foreground">
              {formatSize(studentId.size)}
            </span>
          </div>
          <button
            type="button"
            aria-label={`Remove ${studentId.name}`}
            onClick={() => setStudentId(null)}
            className="grid size-5 shrink-0 cursor-pointer place-items-center rounded-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring"
          >
            <XIcon className="size-4" aria-hidden />
          </button>
        </div>
      )}

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
