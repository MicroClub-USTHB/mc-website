import type { MetadataRoute } from "next"

import { siteConfig, siteRoutes } from "@/config/site"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteConfig.url, changeFrequency: "monthly", priority: 1 },
    {
      url: `${siteConfig.url}${siteRoutes.registrations}`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ]
}
