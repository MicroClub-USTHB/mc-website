/**
 * Structured data for search engines and AI, rendered as a native `<script>` as recommended by
 * the Next.js JSON-LD guide. `<` is escaped to prevent script injection.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  )
}
