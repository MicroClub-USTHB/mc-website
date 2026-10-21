const SIGNATURES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]],
  // RIFF....WEBP
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
}

/**
 * Checks that the first bytes of a file match its declared type, because the browser-sent
 * `File.type` can be faked. Returns `true` for a type without a known signature.
 */
export async function matchesFileSignature(file: File) {
  const signatures = SIGNATURES[file.type]
  if (!signatures) return true

  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  const matches = signatures.some((signature) => signature.every((byte, i) => head[i] === byte))
  if (file.type !== "image/webp") return matches

  return matches && String.fromCharCode(...head.slice(8, 12)) === "WEBP"
}
