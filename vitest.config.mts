import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

/** Unit tests of the pure rules (`src/**\/*.test.ts`, next to the code they test): `pnpm test`. */
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { include: ["src/**/*.test.ts"], environment: "node" },
})
