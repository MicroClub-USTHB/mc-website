export type Partner = {
  /** Stable key, also the logo file name. */
  id: string
  /** Partner name, used as the logo's alt text. */
  name: string
  /** Logo path under `public/`. */
  logo: string
  /** Logo size in a 224×172 tile at 1440px, as in Figma (the tile scales it with its width). */
  width: number
  height: number
}

export type PartnerRow = {
  id: string
  /** `static`: centered row; `loop`: full-width row moving in an endless loop (Figma notes). */
  motion: "static" | "loop"
  partners: Partner[]
}

/**
 * Logos exported from Figma, saved as `public/sponsors/<id>.<format>`. Light vector logos stay
 * SVG; heavy ones (traced artwork or embedded photos, 64KB to 1.5MB as SVG) are rendered to WebP
 * at 3× the tile's logo box, so the image optimizer can resize them (it does not process SVG).
 */
function partner(
  id: string,
  name: string,
  [width, height]: [number, number],
  format: "svg" | "webp" = "svg",
): Partner {
  return { id, name, logo: `/sponsors/${id}.${format}`, width, height }
}

/** Trusted By rows, top to bottom, as in Figma. */
export const TRUSTED_BY_ROWS: PartnerRow[] = [
  {
    id: "top",
    motion: "static",
    partners: [
      partner("bms-electric", "BMS Electric", [201, 67]),
      partner("mobilis", "Mobilis", [181, 58]),
      partner("pitch", "Pitch", [161, 67]),
      partner("yassir", "Yassir", [166, 65]),
    ],
  },
  {
    id: "middle",
    motion: "loop",
    partners: [
      partner("kaspersky", "Kaspersky", [173, 49]),
      partner("ai-grid", "AI Grid", [155, 55]),
      partner("tassili-travail-aerien", "Tassili Travail Aérien", [204, 94]),
      partner("yalidine-express", "Yalidine Express", [172, 36]),
      partner("pwc", "PwC", [121, 96]),
      partner("itcomp-academy", "ITComp Academy", [155, 73], "webp"),
      partner("apcs", "Algerian Port Community System", [138, 64]),
      partner("cnep-banque", "CNEP Banque", [81, 93]),
      partner("cybears", "Cybears", [171, 53]),
      partner("horia-technologies", "Horia Technologies", [137, 78], "webp"),
      partner("mmc", "MMC", [161, 58]),
      partner("maison-de-jeunes", "House of Youth", [67, 101], "webp"),
      partner("miniros", "Miniros", [88, 98], "webp"),
      partner("naftal", "Naftal", [140, 84]),
      partner("prima-glaces", "Prima Glaces", [127, 76], "webp"),
    ],
  },
  {
    id: "bottom",
    motion: "static",
    partners: [
      partner("cmc", "CMC", [99, 90]),
      partner("djezzy", "Djezzy", [84, 91]),
      partner("okt-solutions", "OKT Solutions", [114, 83]),
      partner("itihad-talents-united", "Itihad Talents United", [150, 85]),
      partner("nuts-raya", "Nuts Raya", [103, 97], "webp"),
    ],
  },
]
