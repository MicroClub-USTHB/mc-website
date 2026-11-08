/**
 * A CSV file (RFC 4180, comma separated, CRLF lines) from a header and rows. Cells starting like
 * a formula (`=`, `+`, `-`, `@`, tab, carriage return) get a leading `'`: spreadsheets would run
 * them, and the cells hold applicants' own text. Starts with a BOM so Excel reads it as UTF-8.
 */
export function toCsv(header: string[], rows: (string | number | null | undefined)[][]) {
  const cell = (value: string | number | null | undefined) => {
    let text = value == null ? "" : String(value)
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
    return /[",\r\n]/.test(text) || text !== text.trim() ? `"${text.replaceAll('"', '""')}"` : text
  }
  return `﻿${[header, ...rows].map((row) => row.map(cell).join(",")).join("\r\n")}\r\n`
}
