import { describe, expect, it } from "vitest"

import { toCsv } from "@/lib/csv"

describe("toCsv", () => {
  it("writes a header and rows with a BOM and CRLF lines", () => {
    expect(toCsv(["a", "b"], [[1, "x"]])).toBe("﻿a,b\r\n1,x\r\n")
  })

  it("quotes commas, quotes and line breaks", () => {
    expect(toCsv(["a"], [['say "hi", ok'], ["two\nlines"]])).toBe(
      '﻿a\r\n"say ""hi"", ok"\r\n"two\nlines"\r\n',
    )
  })

  it("keeps phone numbers as they are", () => {
    expect(toCsv(["phone"], [["+213 555 12 34 56"]])).toBe("\uFEFFphone\r\n+213 555 12 34 56\r\n")
  })

  it("neutralizes formulas and empties missing values", () => {
    expect(toCsv(["a", "b", "c"], [["=HYPERLINK(1)", null, "-2"]])).toBe(
      "﻿a,b,c\r\n'=HYPERLINK(1),,-2\r\n",
    )
  })
})
