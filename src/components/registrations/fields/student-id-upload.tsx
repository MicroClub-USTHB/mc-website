"use client"

import { useEffect, useState } from "react"
import { FileTextIcon, UploadIcon, XIcon } from "lucide-react"

import { FIELD_LABEL_CLASS } from "@/components/registrations/fields/field-styles"
import { useRegistration } from "@/components/registrations/state/registration-context"
import { fieldId, STUDENT_ID_FIELD } from "@/components/registrations/state/registration-focus"
import { STUDENT_ID_RULES } from "@/const/registrations"
import { cn } from "@/lib/utils"

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Student ID drop zone (Figma "CLICK TO UPLOAD STUDENT ID"): click or drop a file. The box stretches
 * to the height of the column next to it, and shows the chosen file with a preview and a remove button.
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
    <div className="flex flex-1 flex-col gap-1.5">
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
          "flex min-h-58 flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-border bg-input px-3.5 py-2.5 text-center shadow-xs transition-all",
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

        {studentId ? (
          <>
            {previewUrl ? (
              // A local data URL: next/image cannot optimize it.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={`Preview of ${studentId.name}`}
                className="max-h-28 max-w-full rounded-md border border-border object-contain"
              />
            ) : (
              <FileTextIcon className="size-10 text-muted-foreground" aria-hidden />
            )}
            <span className="max-w-full truncate text-base leading-6 font-medium text-foreground">
              {studentId.name}
            </span>
            <span className="text-sm leading-5 text-muted-foreground">
              {formatSize(studentId.size)} · Click to replace
            </span>
            <button
              type="button"
              aria-label="Remove the file"
              onClick={(event) => {
                event.preventDefault()
                setStudentId(null)
              }}
              className="mt-1 grid size-8 place-items-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring"
            >
              <XIcon className="size-4" aria-hidden />
            </button>
          </>
        ) : (
          <>
            <UploadIcon className="size-6 text-muted-foreground" strokeWidth={1.5} aria-hidden />
            <span className="w-49.75 text-base leading-6 text-muted-foreground uppercase">
              Click to upload student ID
            </span>
          </>
        )}
      </label>

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
