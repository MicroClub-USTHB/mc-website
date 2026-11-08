import type { Metadata } from "next"
import { cookies } from "next/headers"

import { AdminHeader } from "@/components/admin/admin-header"
import { AdminTheme } from "@/components/admin/admin-theme"
import { ADMIN_THEME_COOKIE } from "@/config/admin"
import { FeedbackModalProvider } from "@/providers/feedback-modal-provider"

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Micro Club Admin" },
  robots: { index: false, follow: false },
}

/**
 * Staff admin area: its own header, without the site menu, footer and chatbot, in the theme each
 * staff member picked (light by default, see `AdminTheme`).
 */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const theme = (await cookies()).get(ADMIN_THEME_COOKIE)?.value === "dark" ? "dark" : "light"

  return (
    <AdminTheme initialTheme={theme}>
      <FeedbackModalProvider>
        <AdminHeader />
        <main className="flex flex-1 flex-col bg-background wrap-break-word">{children}</main>
      </FeedbackModalProvider>
    </AdminTheme>
  )
}
