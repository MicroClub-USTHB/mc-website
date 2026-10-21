import { MicroBot } from "@/components/layout/microbot"
import { FooterGate } from "@/components/layout/footer-gate"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteMenu } from "@/components/layout/site-menu"
import { FeedbackModalProvider } from "@/providers/feedback-modal-provider"

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <FeedbackModalProvider>
      <SiteMenu />
      <main className="flex-1">{children}</main>
      <FooterGate>
        <SiteFooter />
      </FooterGate>
      <MicroBot />
    </FeedbackModalProvider>
  )
}
