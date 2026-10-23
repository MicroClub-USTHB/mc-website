import type { MetadataRoute } from "next"

import { siteConfig, siteRoutes } from "@/config/site"
import { hasRegistrationsWindow } from "@/lib/registrations/window"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteConfig.url, changeFrequency: "monthly", priority: 1 },
    // Listed whenever a registrations window is set (the page is a 404 outside of it).
    ...(hasRegistrationsWindow
      ? [
          {
            url: `${siteConfig.url}${siteRoutes.registrations}`,
            changeFrequency: "monthly" as const,
            priority: 0.8,
          },
        ]
      : []),
  ]
}
