import { MicroBot } from "@/components/layout/microbot"
import { BarePageGate } from "@/components/layout/bare-page-gate"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteMenu } from "@/components/layout/site-menu"
import { FeedbackModalProvider } from "@/providers/feedback-modal-provider"

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <FeedbackModalProvider>
      <SiteMenu />
      <main className="flex-1">{children}</main>
      <BarePageGate>
        <SiteFooter />
        <MicroBot />
      </BarePageGate>
    </FeedbackModalProvider>
  )
}
