"use client"

import { FlaskConicalIcon, MailCheckIcon } from "lucide-react"
import { useState, useTransition } from "react"

import { sendAcceptances, testAcceptanceEmail } from "@/actions/admin/acceptance-emails"
import { McButton } from "@/components/ui/mc-button"
import {
  McDialog,
  McDialogContent,
  McDialogDescription,
  McDialogFooter,
  McDialogHeader,
  McDialogTitle,
} from "@/components/ui/mc-dialog"
import { useFeedbackModal } from "@/providers/feedback-modal-provider"

type Mode = "test" | "send"

const plural = (count: number, word: string, many = `${word}s`) =>
  `${count} ${count === 1 ? word : many}`

/**
 * Sends the acceptance email from the HR address: first as a test to every HR member, then to
 * every accepted registration that did not get it yet. Each asks for confirmation.
 */
export function AcceptanceEmailButtons({ waiting }: { waiting: number }) {
  const [mode, setMode] = useState<Mode | null>(null)
  const [pending, startTransition] = useTransition()
  const { showSuccess, showWarning, showError } = useFeedbackModal()

  function confirm() {
    const current = mode
    startTransition(async () => {
      const result = await (current === "test" ? testAcceptanceEmail() : sendAcceptances())
      setMode(null)
      if (result.status === "error") {
        showError({ title: "Nothing was sent", description: result.message, actionLabel: "Got it" })
        return
      }
      const sent =
        current === "test"
          ? `The test went to ${plural(result.sent, "address", "addresses")}: check your inbox.`
          : `${plural(result.sent, "acceptance email")} sent.`
      if (result.failed.length > 0) {
        showWarning({
          title: "Some emails were not sent",
          description: `${sent} Failed: ${result.failed.join(", ")}. Send again to retry them.`,
          actionLabel: "Got it",
        })
      } else {
        showSuccess({
          title: current === "test" ? "Test sent" : "Acceptances sent",
          description: sent,
          actionLabel: "Got it",
        })
      }
    })
  }

  return (
    <>
      <McButton
        variant="secondary"
        size="sm"
        icon="leading"
        iconDefinition={<FlaskConicalIcon className="size-4" />}
        onClick={() => setMode("test")}
      >
        Test acceptance send
      </McButton>
      <McButton
        size="sm"
        icon="leading"
        iconDefinition={<MailCheckIcon className="size-4" />}
        onClick={() => setMode("send")}
        disabled={waiting === 0}
        title={waiting === 0 ? "Every accepted registration got its email" : undefined}
      >
        Send acceptances ({waiting})
      </McButton>

      <McDialog open={mode !== null} onOpenChange={(open) => !open && !pending && setMode(null)}>
        <McDialogContent className="sm:min-h-0">
          <McDialogHeader>
            <McDialogTitle>
              {mode === "test"
                ? "Send the acceptance email to the HR team?"
                : `Send the acceptance email to ${plural(waiting, "accepted registration")}?`}
            </McDialogTitle>
            <McDialogDescription>
              {mode === "test"
                ? "Every HR member gets the exact email the accepted applicants will get, with their own name in it. Check it before sending it for real."
                : "Each accepted applicant gets it once, from the HR address, with replies coming to you. Registrations accepted later can be sent afterwards."}
            </McDialogDescription>
          </McDialogHeader>
          <McDialogFooter className="pb-0">
            <McButton variant="secondary" onClick={() => setMode(null)} disabled={pending}>
              Cancel
            </McButton>
            <McButton onClick={confirm} isLoading={pending}>
              {mode === "test" ? "Send the test" : "Send them"}
            </McButton>
          </McDialogFooter>
        </McDialogContent>
      </McDialog>
    </>
  )
}
