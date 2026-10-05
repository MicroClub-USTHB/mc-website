import { siteConfig } from "@/config/site"

export function SiteFooter() {
  return (
    <footer className="border-t px-4 py-10 sm:px-6 lg:px-8">
      {/* TODO: logo, socials, quick links, address. */}
      <p className="mx-auto max-w-site text-sm text-muted-foreground">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </p>
    </footer>
  )
}
