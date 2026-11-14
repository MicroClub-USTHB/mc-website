"use client"

import { FlaskConicalIcon, LockIcon, MailCheckIcon, MailXIcon, SendIcon } from "lucide-react"
import { useState, useTransition } from "react"

import { sendDecisionEmailWave, testDecisionEmail } from "@/actions/admin/decision-emails"
import { McButton } from "@/components/ui/mc-button"
import {
  McDialog,
  McDialogContent,
  McDialogDescription,
  McDialogFooter,
  McDialogHeader,
  McDialogTitle,
} from "@/components/ui/mc-dialog"
import { formatClubTime } from "@/lib/dates"
import { WAVE_SIZE, type DecisionKind } from "@/lib/registrations/decision-email-rules"
import type { DecisionEmailStatus } from "@/lib/registrations/decision-email"
import { useFeedbackModal } from "@/providers/feedback-modal-provider"

type Pending = { kind: DecisionKind; mode: "test" | "wave" }

const plural = (count: number, word: string, many = `${word}s`) =>
  `${count} ${count === 1 ? word : many}`

const COPY: Record<DecisionKind, { title: string; noun: string; icon: React.ReactNode }> = {
  accepted: {
    title: "Acceptance",
    noun: "acceptance email",
    icon: <MailCheckIcon className="size-5" aria-hidden />,
  },
  rejected: {
    title: "Refusal",
    noun: "refusal email",
    icon: <MailXIcon className="size-5" aria-hidden />,
  },
}

/**
 * The decision emails sent from the Internal Relations address: for acceptances then refusals,
 * what went out and what waits, a test to the HR team, and the next wave within Gmail's daily
 * limit. Refusals stay locked until every acceptance is sent.
 */
export function DecisionEmailsCard({ status }: { status: DecisionEmailStatus }) {
  const [pending, setPending] = useState<Pending | null>(null)
  const [sending, startTransition] = useTransition()
  const { showSuccess, showWarning, showError } = useFeedbackModal()
  const { limit } = status
  const percent = Math.min(100, Math.round((limit.sent / limit.max) * 100))

  function confirm() {
    if (!pending) return
    const { kind, mode } = pending
    startTransition(async () => {
      const result = await (mode === "test" ? testDecisionEmail(kind) : sendDecisionEmailWave(kind))
      setPending(null)
      if (result.status === "error") {
        showError({ title: "Nothing was sent", description: result.message, actionLabel: "Got it" })
        return
      }
      const parts = [
        mode === "test"
          ? `The test went to ${plural(result.sent, "address", "addresses")}: check your inbox.`
          : `${plural(result.sent, COPY[kind].noun)} sent.`,
        result.skipped > 0 &&
          `${plural(result.skipped, "address", "addresses")} already got an email from another registration: skipped.`,
        result.failed.length > 0 &&
          `Failed: ${result.failed.join(", ")}. They stay in the queue for the next wave.`,
      ].filter(Boolean)
      const show = result.failed.length > 0 ? showWarning : showSuccess
      show({
        title:
          result.failed.length > 0
            ? "Some emails were not sent"
            : mode === "test"
              ? "Test sent"
              : "Wave sent",
        description: parts.join(" "),
        actionLabel: "Got it",
      })
    })
  }

  const target = pending && status[pending.kind]

  return (
    <section className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5 sm:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="header-xs font-heading text-foreground">Decision emails</h2>
          <p className="paragraph-sm text-muted-foreground">
            Sent from the Internal Relations address in waves of {WAVE_SIZE}, each person once. Test
            first: the HR team gets the exact email.
          </p>
        </div>
        <div className="flex min-w-56 flex-col gap-1.5">
          <p className="flex justify-between gap-3 paragraph-sm text-muted-foreground tabular-nums">
            <span>Last 24 hours</span>
            <span>
              <span className="font-medium text-foreground">{limit.sent}</span> / {limit.max}
            </span>
          </p>
          <div
            role="progressbar"
            aria-label="Emails sent in the last 24 hours"
            aria-valuenow={limit.sent}
            aria-valuemin={0}
            aria-valuemax={limit.max}
            className="h-2 overflow-hidden rounded-full bg-secondary"
          >
            <div
              className={percent >= 100 ? "h-full bg-warning" : "h-full bg-primary"}
              style={{ width: `${percent}%` }}
            />
          </div>
          {limit.resetsAt && (
            <p className="paragraph-xs text-warning">
              Daily limit reached: next wave from {formatClubTime(limit.resetsAt, "EEE HH:mm")}
            </p>
          )}
        </div>
      </header>

      <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
        {(["accepted", "rejected"] as const).map((kind) => {
          const row = status[kind]
          const locked = kind === "rejected" && status.rejected.locked
          const total = row.sent + row.waiting
          const reason = locked
            ? `Locked until the ${plural(status.accepted.waiting, "acceptance")} left are sent`
            : row.waiting === 0
              ? total === 0
                ? "Nobody to email yet"
                : "Everyone got their email"
              : row.wave === 0
                ? "Daily limit reached"
                : null
          return (
            <li
              key={kind}
              className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                  {locked ? <LockIcon className="size-5" aria-hidden /> : COPY[kind].icon}
                </span>
                <div className="flex min-w-0 flex-col">
                  <p className="paragraph-md font-medium text-foreground">{COPY[kind].title}</p>
                  <p className="paragraph-sm text-muted-foreground tabular-nums">
                    {row.sent} sent · {row.waiting} waiting
                    {reason && (
                      <span className={locked ? "text-warning" : undefined}> · {reason}</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <McButton
                  variant="secondary"
                  size="sm"
                  icon="leading"
                  iconDefinition={<FlaskConicalIcon className="size-4" />}
                  onClick={() => setPending({ kind, mode: "test" })}
                >
                  Test {COPY[kind].title.toLowerCase()} send
                </McButton>
                <McButton
                  size="sm"
                  icon="leading"
                  iconDefinition={<SendIcon className="size-4" />}
                  onClick={() => setPending({ kind, mode: "wave" })}
                  disabled={row.wave === 0}
                  title={reason ?? undefined}
                >
                  Send next wave ({row.wave})
                </McButton>
              </div>
            </li>
          )
        })}
      </ul>

      <McDialog
        open={pending !== null}
        onOpenChange={(open) => !open && !sending && setPending(null)}
      >
        <McDialogContent className="sm:min-h-0">
          {pending && target && (
            <>
              <McDialogHeader>
                <McDialogTitle>
                  {pending.mode === "test"
                    ? `Send the ${COPY[pending.kind].noun} to the HR team?`
                    : `Send ${plural(target.wave, COPY[pending.kind].noun)}?`}
                </McDialogTitle>
                <McDialogDescription>
                  {pending.mode === "test"
                    ? "Every HR member gets the exact email the applicants will get, with their own name in it. Nobody is marked as emailed."
                    : `The ${target.wave} oldest of the ${target.waiting} waiting, from the Internal Relations address, with replies coming to you. Each one is marked as emailed and never gets it twice. It can take a minute or two: keep this page open.`}
                </McDialogDescription>
              </McDialogHeader>
              <McDialogFooter className="pb-0">
                <McButton variant="secondary" onClick={() => setPending(null)} disabled={sending}>
                  Cancel
                </McButton>
                <McButton onClick={confirm} isLoading={sending}>
                  {pending.mode === "test" ? "Send the test" : "Send the wave"}
                </McButton>
              </McDialogFooter>
            </>
          )}
        </McDialogContent>
      </McDialog>
    </section>
  )
}
