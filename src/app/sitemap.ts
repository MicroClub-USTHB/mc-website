import type { MetadataRoute } from "next"

import { siteConfig, siteRoutes } from "@/config/site"
import { areRegistrationsOpen } from "@/lib/registrations/window"

/** Regenerated every hour: the registrations page is listed only while it accepts members. */
export const revalidate = 3600

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteConfig.url, changeFrequency: "monthly", priority: 1 },
    // A 404 outside the registrations window: listed only while it is open.
    ...(areRegistrationsOpen()
      ? [
          {
            url: `${siteConfig.url}${siteRoutes.registrations}`,
            changeFrequency: "weekly" as const,
            priority: 0.8,
          },
        ]
      : []),
  ]
}
