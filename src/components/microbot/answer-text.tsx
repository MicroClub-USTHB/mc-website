import { Fragment } from "react"

type Block =
  | { type: "paragraph"; lines: string[] }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "heading"; text: string }

const BULLET = /^\s*[-*•]\s+(.*)$/
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/
const HEADING = /^\s*#{1,6}\s+(.*)$/

/**
 * The Markdown subset Micro Bot's model writes (seen on the live API): paragraphs separated by
 * blank lines, single line breaks, `-` / `*` / `1.` lists and `#` headings. Anything else stays
 * plain text: answers are never parsed as HTML.
 */
function parseBlocks(text: string): Block[] {
  const blocks: Block[] = []
  for (const line of text.split("\n")) {
    const last = blocks.at(-1)
    const bullet = line.match(BULLET)
    const numbered = line.match(NUMBERED)
    const heading = line.match(HEADING)
    if (bullet || numbered) {
      const ordered = Boolean(numbered)
      const item = (bullet ?? numbered)![1]
      if (last?.type === "list" && last.ordered === ordered) last.items.push(item)
      else blocks.push({ type: "list", ordered, items: [item] })
    } else if (heading) {
      blocks.push({ type: "heading", text: heading[1] })
    } else if (!line.trim()) {
      // A blank line ends the paragraph or list: the next line starts a new block.
      if (last && !(last.type === "paragraph" && last.lines.length === 0)) {
        blocks.push({ type: "paragraph", lines: [] })
      }
    } else if (last?.type === "paragraph") {
      last.lines.push(line.trim())
    } else {
      blocks.push({ type: "paragraph", lines: [line.trim()] })
    }
  }
  return blocks.filter((block) => block.type !== "paragraph" || block.lines.length > 0)
}

/** Inline Markdown: `**bold**`, `*italic*`, `` `code` `` and `[text](https://…)` links. */
const INLINE =
  /\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\s][^*]*)\*|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g

function Inline({ text }: { text: string }) {
  const parts: React.ReactNode[] = []
  let index = 0
  for (const match of text.matchAll(INLINE)) {
    if (match.index > index) parts.push(text.slice(index, match.index))
    const [, bold, boldAlt, italic, code, linkText, href] = match
    const key = match.index
    if (bold || boldAlt) {
      parts.push(
        <strong key={key} className="font-semibold text-foreground">
          {bold ?? boldAlt}
        </strong>,
      )
    } else if (italic) {
      parts.push(<em key={key}>{italic}</em>)
    } else if (code) {
      parts.push(
        <code key={key} className="rounded-sm bg-muted px-1 font-mono text-[0.9em]">
          {code}
        </code>,
      )
    } else {
      parts.push(
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2"
        >
          {linkText}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>,
      )
    }
    index = match.index + match[0].length
  }
  if (index < text.length) parts.push(text.slice(index))
  return <>{parts}</>
}

/**
 * While an answer is still streaming, a `**` (or `` ` ``) whose closing marker has not arrived yet
 * would flash as raw asterisks: it is hidden until the rest of the answer comes.
 */
function hideOpenMarkers(text: string) {
  let result = text
  for (const marker of ["**", "`"]) {
    if (result.split(marker).length % 2 === 0) {
      const last = result.lastIndexOf(marker)
      result = result.slice(0, last) + result.slice(last + marker.length)
    }
  }
  return result
}

/**
 * One Micro Bot answer, formatted: paragraphs, lists, headings and inline emphasis rendered with
 * mcoli-ui tokens. `dir="auto"` lays each block out right to left when it is written in Arabic.
 */
export function AnswerText({ text, streaming = false }: { text: string; streaming?: boolean }) {
  const blocks = parseBlocks(streaming ? hideOpenMarkers(text) : text)

  return (
    <div className="flex flex-col gap-2 paragraph-md [overflow-wrap:anywhere] text-muted-foreground">
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          return (
            <p key={i} dir="auto" className="font-semibold text-foreground">
              <Inline text={block.text} />
            </p>
          )
        }
        if (block.type === "list") {
          const List = block.ordered ? "ol" : "ul"
          return (
            <List
              key={i}
              dir="auto"
              className={
                block.ordered
                  ? "flex list-decimal flex-col gap-1 ps-5 marker:text-primary"
                  : "flex list-disc flex-col gap-1 ps-5 marker:text-primary"
              }
            >
              {block.items.map((item, j) => (
                <li key={j}>
                  <Inline text={item} />
                </li>
              ))}
            </List>
          )
        }
        return (
          <p key={i} dir="auto">
            {block.lines.map((line, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                <Inline text={line} />
              </Fragment>
            ))}
          </p>
        )
      })}
    </div>
  )
}
