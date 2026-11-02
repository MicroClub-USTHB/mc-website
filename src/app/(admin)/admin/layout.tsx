import type { Metadata } from "next"

import { AdminHeader } from "@/components/admin/admin-header"
import { FeedbackModalProvider } from "@/providers/feedback-modal-provider"

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Micro Club Admin" },
  robots: { index: false, follow: false },
}

/** Staff admin area: its own header, without the site menu, footer and chatbot. */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <FeedbackModalProvider>
      <AdminHeader />
      <main className="flex flex-1 flex-col bg-background">{children}</main>
    </FeedbackModalProvider>
  )
}
