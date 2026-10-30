import { notFound } from "next/navigation"
import { connection } from "next/server"

import { SiteMenu } from "@/components/layout/site-menu"
import { areRegistrationsOpen } from "@/lib/registrations/window"
import { FeedbackModalProvider } from "@/providers/feedback-modal-provider"

/**
 * Registrations route group: its own layout (the menu and the feedback modals, no footer, no
 * chatbot: Figma shows only the toggle and the compact logo), apart from `(site)`. Outside the
 * registrations window (`src/config/registrations.ts`) the layout itself returns the 404: a
 * `notFound()` in a layout is rendered by the root `not-found.tsx`, so the missing page shows no
 * menu bar, which a 404 thrown by the page inside the `(site)` layout would.
 */
export default async function RegistrationsLayout({ children }: { children: React.ReactNode }) {
  await connection()
  if (!areRegistrationsOpen()) notFound()

  return (
    <FeedbackModalProvider>
      <SiteMenu />
      <main className="flex-1">{children}</main>
    </FeedbackModalProvider>
  )
}
