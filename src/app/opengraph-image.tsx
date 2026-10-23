import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

import { siteConfig } from "@/config/site"

export const alt = `${siteConfig.name}: ${siteConfig.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

/**
 * Shared preview of the site (Open Graph, reused for X): the white MC mark (with the name) on the
 * mcoli-ui navy (`--foreground`), the tagline in its light blue (`--secondary`). Satori cannot
 * read CSS variables, so the two token values are written out. Generated once at build time.
 */
export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public/brand/mc-logo.svg"), "base64")
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 40,
        padding: "0 96px",
        background: "#000350",
        color: "#ffffff",
      }}
    >
      {/* The mark already spells "MICRO CLUB". */}
      <img src={`data:image/svg+xml;base64,${logo}`} alt="" width={400} height={281} />
      <div style={{ fontSize: 44, color: "#e6e9ff", lineHeight: 1.3, maxWidth: 900 }}>
        {siteConfig.tagline}
      </div>
    </div>,
    size,
  )
}
