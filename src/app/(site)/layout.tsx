import { SiteFooter } from "@/components/layout/site-footer"
import { SiteMenu } from "@/components/layout/site-menu"

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteMenu />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  )
}
