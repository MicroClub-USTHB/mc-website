import type { MetadataRoute } from "next"

import { adminRoutes } from "@/config/admin"
import { siteConfig } from "@/config/site"

export default function robots(): MetadataRoute.Robots {
  return {
    // The admin area is also `noindex`; the auth API has nothing to crawl.
    rules: { userAgent: "*", allow: "/", disallow: [adminRoutes.home, "/api/"] },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
