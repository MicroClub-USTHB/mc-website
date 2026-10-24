/**
 * Decorative lines of the 404 page (Figma "404 PAGE", "Desktop - 4"), placed in Figma px on the
 * 1440×1024 frame: `x` is the left edge, or the right edge when `align` is "right". `cyan` lines
 * use the cyan accent. `corner` marks the ones kept on small screens, in that corner.
 */
export type NotFoundLine = {
  lines: string[]
  x: number
  y: number
  align?: "right"
  cyan?: boolean
  corner?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
}

const DOTS_7 = ".   .   .   .   .   .   ."
const DOTS_8 = ".   .   .   .   .   .   .   ."

export const NOT_FOUND_LINES: NotFoundLine[] = [
  { lines: ["- MC ", ".MICRO CLUB OS"], x: 19, y: 44, corner: "top-left" },
  {
    lines: [
      " . 01 > IT",
      " . 02 > ROBOTICS",
      " . 03 > GAME DEV",
      " . 04 > DEPARTMENTS",
      " . 05 > PROJECTS ",
      " . 06 > EVENTS",
    ],
    x: 17,
    y: 123,
  },
  { lines: ["(PICK A SECTION. BREAK THINGS. LEARN.)"], x: 19, y: 297, cyan: true },
  { lines: [DOTS_8, DOTS_8, DOTS_8, DOTS_8], x: 22, y: 352 },
  { lines: ["= 03 SECTIONS"], x: 38, y: 506 },
  { lines: ["08 DEPARTMENTS"], x: 149, y: 550 },
  { lines: ["ROOM FOR ONE MORE: YOU"], x: 22, y: 629 },
  {
    lines: ["PLEASE_ _ _ _ TRY ANOTHER URL_ _ _ _AGAIN", "_ _ _ _ _ _ _ _ _ _ _ _ HOMEPAGE"],
    x: 22,
    y: 677,
  },
  {
    lines: [". _", ".-.. .. -. .-   ...--   -. ----. .- - ..", ". _ . _ . _ . _ . _ . _"],
    x: 22,
    y: 754,
  },
  { lines: ["//"], x: 22, y: 872 },
  {
    lines: ["- END OF PAGE", "FIRST ALGERIAN SCIENTIFIC CLUB"],
    x: 19,
    y: 896,
    corner: "bottom-left",
  },
  { lines: ["//"], x: 449, y: 193 },
  { lines: ["("], x: 447, y: 872 },
  { lines: [">>>>>>>>>>>"], x: 634, y: 872 },
  { lines: ["//"], x: 944, y: 922 },
  { lines: [">>>>>>>>>>>"], x: 677, y: 47, cyan: true },
  { lines: [":)"], x: 932, y: 47 },
  {
    lines: ["© DESIGNED BY MICRO CLUB", "© 2026"],
    x: 1423,
    y: 47,
    align: "right",
    corner: "top-right",
  },
  { lines: [DOTS_7, DOTS_7, DOTS_7], x: 1280, y: 112 },
  { lines: [">>>>>>>>>"], x: 1298, y: 192, cyan: true },
  { lines: [":)"], x: 1404, y: 219 },
  { lines: ["= SINCE 1985"], x: 1287, y: 247 },
  { lines: ["20XX"], x: 1368, y: 298 },
  { lines: ["2024 · BEST TECH CLUB"], x: 1197, y: 353 },
  {
    lines: ["_ _ _ _ INSERT COFFEE", "_ _ _  _ _ _ _ _ _ TO CONTINUE"],
    x: 1422,
    y: 431,
    align: "right",
  },
  { lines: ["( PAGE NOT FOUND )"], x: 1422, y: 519, align: "right", cyan: true },
  { lines: ["SIGNAL LOST"], x: 1422, y: 623, align: "right" },
  {
    lines: [
      " . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .",
      ". . . . . . . . . . . . . . . . . . . . . . . . . .",
      " . . . . . . . . . . . . . . . . . . . .",
    ],
    x: 1422,
    y: 649,
    align: "right",
  },
  { lines: ["-", "-", ".-", "-"], x: 1422, y: 843, align: "right" },
  { lines: ["· NOT A BUG, A FEATURE"], x: 1422, y: 957, align: "right", corner: "bottom-right" },
]
