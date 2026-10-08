export type Partner = {
  /** Stable key, also the logo file name. */
  id: string
  /** Partner name, used as the logo's alt text. */
  name: string
  /** Logo path under `public/`. */
  logo: string
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
function partner(id: string, name: string, format: "svg" | "webp" = "svg"): Partner {
  return { id, name, logo: `/sponsors/${id}.${format}` }
}

/** Trusted By rows, top to bottom, as in Figma. */
export const TRUSTED_BY_ROWS: PartnerRow[] = [
  {
    id: "top",
    motion: "static",
    partners: [
      partner("bms-electric", "BMS Electric"),
      partner("mobilis", "Mobilis"),
      partner("pitch", "Pitch"),
      partner("yassir", "Yassir"),
    ],
  },
  {
    id: "middle",
    motion: "loop",
    partners: [
      partner("kaspersky", "Kaspersky"),
      partner("ai-grid", "AI Grid"),
      partner("tassili-travail-aerien", "Tassili Travail Aérien"),
      partner("yalidine-express", "Yalidine Express"),
      partner("pwc", "PwC"),
      partner("itcomp-academy", "ITComp Academy", "webp"),
      partner("apcs", "Algerian Port Community System"),
      partner("cnep-banque", "CNEP Banque"),
      partner("cybears", "Cybears"),
      partner("horia-technologies", "Horia Technologies", "webp"),
      partner("mmc", "MMC"),
      partner("maison-de-jeunes", "House of Youth", "webp"),
      partner("miniros", "Miniros", "webp"),
      partner("naftal", "Naftal"),
      partner("prima-glaces", "Prima Glaces", "webp"),
    ],
  },
  {
    id: "bottom",
    motion: "static",
    partners: [
      partner("cmc", "CMC"),
      partner("djezzy", "Djezzy"),
      partner("okt-solutions", "OKT Solutions"),
      partner("itihad-talents-united", "Itihad Talents United"),
      partner("nuts-raya", "Nuts Raya", "webp"),
    ],
  },
]
