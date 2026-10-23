"use client"

import { useEffect, useRef, useState } from "react"
import Image, { type StaticImageData } from "next/image"

import { cn } from "@/lib/utils"
import boldIcon from "@/assets/hero/sticky-note/bold.svg"
import checklistIcon from "@/assets/hero/sticky-note/checklist.svg"
import italicIcon from "@/assets/hero/sticky-note/italic.svg"
import noteShape from "@/assets/hero/sticky-note/note.svg"
import strikethroughIcon from "@/assets/hero/sticky-note/strikethrough.svg"
import underlineIcon from "@/assets/hero/sticky-note/underline.svg"

/**
 * The note is a small rich text model (lines of characters with format bits) rendered into a
 * `contentEditable` element. Edits go through `beforeinput`, so formats are applied with plain
 * Selection / Range offsets instead of the deprecated `document.execCommand`.
 */
const BOLD = 1
const ITALIC = 2
const STRIKE = 4
const UNDERLINE = 8

/** Format bit, its tag in the DOM. */
const TAGS = [
  [BOLD, "strong"],
  [ITALIC, "em"],
  [STRIKE, "s"],
  [UNDERLINE, "u"],
] as const

type Char = { ch: string; f: number }
/** `check`: `null` for a plain line, else whether its checkbox is ticked. */
type Line = { check: boolean | null; chars: Char[] }
type Pos = { line: number; offset: number }

const INITIAL_TEXT = [
  "Peak experiences.",
  "The best nights of the semester.",
  "Pure relief from exams",
]

/** Figma toolbar controls: icon and its box (px), the glyph drawn in the `note-icon` color. */
const TOOLS: {
  id: "checklist" | number
  label: string
  icon: StaticImageData
  box: number
  glyph: [number, number]
}[] = [
  { id: "checklist", label: "Checklist", icon: checklistIcon, box: 21.334, glyph: [17.78, 17.78] },
  { id: BOLD, label: "Bold", icon: boldIcon, box: 20, glyph: [20, 20] },
  { id: ITALIC, label: "Italic", icon: italicIcon, box: 20, glyph: [20, 20] },
  {
    id: STRIKE,
    label: "Strikethrough",
    icon: strikethroughIcon,
    box: 21.334,
    glyph: [21.334, 21.334],
  },
  {
    id: UNDERLINE,
    label: "Underline",
    icon: underlineIcon,
    box: 21.334,
    glyph: [17.43, 17.82],
  },
]

function toChars(text: string, f = 0): Char[] {
  return [...text].map((ch) => ({ ch, f }))
}

function comparePos(a: Pos, b: Pos) {
  return a.line - b.line || a.offset - b.offset
}

/** Draws the model into the editor. */
function render(editor: HTMLElement, lines: Line[]) {
  editor.replaceChildren(
    ...lines.map((line) => {
      const row = document.createElement("div")
      row.dataset.line = ""
      row.className = "group flex items-start gap-[7.659px]"
      if (line.check !== null) {
        row.dataset.checked = String(line.check)
        const box = document.createElement("span")
        box.dataset.check = ""
        box.contentEditable = "false"
        box.setAttribute("role", "checkbox")
        box.setAttribute("aria-checked", String(line.check))
        box.className =
          "mt-[1.33px] size-[12.652px] shrink-0 cursor-pointer rounded-[3.282px] border-[1.094px] border-note-ink transition-colors group-data-[checked=true]:bg-note-ink"
        row.append(box)
      }
      const text = document.createElement("span")
      text.dataset.text = ""
      text.className =
        "min-w-0 flex-1 transition-colors group-data-[checked=true]:text-note-ink group-data-[checked=true]:line-through"
      // Consecutive characters with the same formats become one run.
      let start = 0
      while (start < line.chars.length) {
        let end = start
        while (end < line.chars.length && line.chars[end].f === line.chars[start].f) end++
        let node: Node = document.createTextNode(
          line.chars
            .slice(start, end)
            .map((char) => char.ch)
            .join(""),
        )
        for (const [bit, tag] of TAGS) {
          if (line.chars[start].f & bit) {
            const wrapper = document.createElement(tag)
            wrapper.append(node)
            node = wrapper
          }
        }
        text.append(node)
        start = end
      }
      if (!line.chars.length) text.append(document.createElement("br"))
      row.append(text)
      return row
    }),
  )
}

/** Reads the model back from the DOM (after an edit the browser made itself, e.g. IME input). */
function parse(editor: HTMLElement): Line[] {
  const lines: Line[] = []
  const readChars = (root: Node, chars: Char[]) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      const node = walker.currentNode
      if (node.parentElement?.closest("[data-check]")) continue
      let f = 0
      for (let el = node.parentElement; el && el !== root && el !== editor; el = el.parentElement) {
        for (const [bit, tag] of TAGS) if (el.localName === tag) f |= bit
        if (el.localName === "b") f |= BOLD
        if (el.localName === "i") f |= ITALIC
      }
      chars.push(...toChars(node.textContent ?? "", f))
    }
  }
  for (const child of editor.childNodes) {
    if (child instanceof HTMLElement && child.localName === "div") {
      const box = child.querySelector("[data-check]")
      const line: Line = { check: box ? child.dataset.checked === "true" : null, chars: [] }
      readChars(child, line.chars)
      lines.push(line)
    } else {
      if (!lines.length) lines.push({ check: null, chars: [] })
      readChars(child, lines[lines.length - 1].chars)
    }
  }
  return lines.length ? lines : [{ check: null, chars: [] }]
}

/** Figma "Sticky note": an editable note with a checklist, bold, italic, strike and underline. */
export function StickyNote() {
  const editorRef = useRef<HTMLDivElement>(null)
  const linesRef = useRef<Line[]>(
    INITIAL_TEXT.map((text) => ({ check: null, chars: toChars(text) })),
  )
  /** Formats toggled with a collapsed caret, used by the next typed characters. */
  const pendingRef = useRef<number | null>(null)
  const [active, setActive] = useState({ formats: 0, checklist: false })

  function rows() {
    return [...(editorRef.current?.querySelectorAll<HTMLElement>("[data-line]") ?? [])]
  }

  /** DOM boundary to model position. */
  function toPos(node: Node, offset: number): Pos | null {
    const editor = editorRef.current
    if (!editor) return null
    const all = rows()
    if (node === editor) {
      const line = Math.min(offset, all.length - 1)
      return offset >= all.length
        ? { line, offset: linesRef.current[line].chars.length }
        : { line, offset: 0 }
    }
    const row = (node instanceof Element ? node : node.parentElement)?.closest<HTMLElement>(
      "[data-line]",
    )
    const line = row ? all.indexOf(row) : -1
    if (!row || line < 0) return null
    const text = row.querySelector("[data-text]")!
    const range = document.createRange()
    range.setStart(text, 0)
    try {
      range.setEnd(node, offset)
    } catch {
      return { line, offset: 0 }
    }
    return {
      line,
      offset: Math.min(range.toString().length, linesRef.current[line].chars.length),
    }
  }

  /** Model position to DOM boundary. */
  function toBoundary({ line, offset }: Pos): [Node, number] {
    const text = rows()[line].querySelector("[data-text]")!
    const walker = document.createTreeWalker(text, NodeFilter.SHOW_TEXT)
    let left = offset
    let last: Node | null = null
    while (walker.nextNode()) {
      last = walker.currentNode
      const length = last.textContent?.length ?? 0
      if (left <= length) return [last, left]
      left -= length
    }
    return last ? [last, last.textContent?.length ?? 0] : [text, 0]
  }

  function readSelection() {
    const selection = document.getSelection()
    const editor = editorRef.current
    if (!selection?.rangeCount || !editor) return null
    const range = selection.getRangeAt(0)
    if (!editor.contains(range.commonAncestorContainer)) return null
    const start = toPos(range.startContainer, range.startOffset)
    const end = toPos(range.endContainer, range.endOffset)
    return start && end ? { start, end } : null
  }

  /** Re-renders the model and puts the selection back. */
  function commit(start: Pos, end = start) {
    const editor = editorRef.current
    if (!editor) return
    render(editor, linesRef.current)
    const range = document.createRange()
    range.setStart(...toBoundary(start))
    range.setEnd(...toBoundary(end))
    const selection = document.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
    refreshActive()
  }

  function charsIn(start: Pos, end: Pos) {
    const chars: Char[] = []
    for (let line = start.line; line <= end.line; line++) {
      const all = linesRef.current[line].chars
      chars.push(
        ...all.slice(
          line === start.line ? start.offset : 0,
          line === end.line ? end.offset : all.length,
        ),
      )
    }
    return chars
  }

  function caretFormats({ line, offset }: Pos) {
    const chars = linesRef.current[line].chars
    return pendingRef.current ?? chars[offset - 1]?.f ?? chars[offset]?.f ?? 0
  }

  function refreshActive() {
    const selection = readSelection()
    if (!selection) return
    const { start, end } = selection
    const chars = charsIn(start, end)
    const formats = chars.length
      ? chars.reduce((all, char) => all & char.f, 0b1111)
      : caretFormats(start)
    const checklist = linesRef.current
      .slice(start.line, end.line + 1)
      .every((line) => line.check !== null)
    setActive((current) =>
      current.formats === formats && current.checklist === checklist
        ? current
        : { formats, checklist },
    )
  }

  function deleteRange(start: Pos, end: Pos) {
    const lines = linesRef.current
    const first = lines[start.line]
    first.chars = [
      ...first.chars.slice(0, start.offset),
      ...lines[end.line].chars.slice(end.offset),
    ]
    lines.splice(start.line + 1, end.line - start.line)
  }

  function insertText(pos: Pos, text: string, f: number): Pos {
    const lines = linesRef.current
    let at = pos
    text.split(/\r?\n/).forEach((part, i) => {
      if (i > 0) at = splitLine(at)
      lines[at.line].chars.splice(at.offset, 0, ...toChars(part, f))
      at = { line: at.line, offset: at.offset + [...part].length }
    })
    return at
  }

  function splitLine({ line, offset }: Pos): Pos {
    const lines = linesRef.current
    const current = lines[line]
    // Enter on an empty checklist item ends the list, like note apps.
    if (current.check !== null && !current.chars.length) {
      current.check = null
      return { line, offset: 0 }
    }
    lines.splice(line + 1, 0, {
      check: current.check === null ? null : false,
      chars: current.chars.splice(offset),
    })
    return { line: line + 1, offset: 0 }
  }

  /** Native listener: React's `onBeforeInput` is a polyfill without `inputType`. */
  function onBeforeInput(event: InputEvent) {
    const input = event
    const selection = readSelection()
    if (!selection) return
    let { start, end } = selection
    const collapsed = comparePos(start, end) === 0
    const lines = linesRef.current

    const format = {
      formatBold: BOLD,
      formatItalic: ITALIC,
      formatUnderline: UNDERLINE,
      formatStrikeThrough: STRIKE,
    }[input.inputType]
    if (format) {
      event.preventDefault()
      toggleFormat(format)
      return
    }

    switch (input.inputType) {
      case "insertText":
      case "insertReplacementText": {
        event.preventDefault()
        const text = input.data ?? input.dataTransfer?.getData("text/plain") ?? ""
        const f = caretFormats(start)
        if (!collapsed) deleteRange(start, end)
        commit(insertText(start, text, f))
        pendingRef.current = f
        return
      }
      case "insertParagraph":
      case "insertLineBreak": {
        event.preventDefault()
        if (!collapsed) deleteRange(start, end)
        commit(splitLine(start))
        return
      }
      case "deleteContentBackward":
      case "deleteContentForward":
      case "deleteWordBackward":
      case "deleteWordForward":
      case "deleteSoftLineBackward":
      case "deleteSoftLineForward":
      case "deleteHardLineBackward":
      case "deleteHardLineForward":
      case "deleteByCut": {
        event.preventDefault()
        pendingRef.current = null
        if (collapsed) {
          const backward = input.inputType.includes("Backward")
          // Backspace at the start of a checklist item removes its checkbox first.
          if (backward && start.offset === 0 && lines[start.line].check !== null) {
            lines[start.line].check = null
            commit(start)
            return
          }
          const target = input.getTargetRanges()[0]
          const from = target && toPos(target.startContainer, target.startOffset)
          const to = target && toPos(target.endContainer, target.endOffset)
          if (from && to && comparePos(from, to) < 0) {
            ;[start, end] = [from, to]
          } else if (backward) {
            if (start.offset > 0) start = { ...start, offset: start.offset - 1 }
            else if (start.line > 0)
              start = { line: start.line - 1, offset: lines[start.line - 1].chars.length }
          } else if (end.offset < lines[end.line].chars.length) {
            end = { ...end, offset: end.offset + 1 }
          } else if (end.line < lines.length - 1) {
            end = { line: end.line + 1, offset: 0 }
          }
        }
        deleteRange(start, end)
        commit(start)
        return
      }
      case "historyUndo":
      case "historyRedo":
      case "insertFromDrop":
        event.preventDefault()
        return
      // Anything else (IME composition...) is left to the browser and read back in `onInput`.
    }
  }

  function onPaste(event: React.ClipboardEvent<HTMLDivElement>) {
    event.preventDefault()
    const selection = readSelection()
    if (!selection) return
    const { start, end } = selection
    if (comparePos(start, end) !== 0) deleteRange(start, end)
    commit(insertText(start, event.clipboardData.getData("text/plain"), caretFormats(start)))
  }

  function toggleFormat(bit: number) {
    const selection = readSelection()
    if (!selection) return
    const { start, end } = selection
    if (comparePos(start, end) === 0) {
      pendingRef.current = caretFormats(start) ^ bit
      refreshActive()
      return
    }
    const chars = charsIn(start, end)
    const all = chars.every((char) => char.f & bit)
    for (const char of chars) char.f = all ? char.f & ~bit : char.f | bit
    commit(start, end)
  }

  function toggleChecklist() {
    const selection = readSelection()
    if (!selection) return
    const { start, end } = selection
    const touched = linesRef.current.slice(start.line, end.line + 1)
    const all = touched.every((line) => line.check !== null)
    for (const line of touched) line.check = all ? null : (line.check ?? false)
    commit(start, end)
  }

  /** A click on a checkbox ticks it, without moving the caret. */
  function onMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    const box = (event.target as Element).closest("[data-check]")
    if (!box) return
    event.preventDefault()
    const line = rows().indexOf(box.closest<HTMLElement>("[data-line]")!)
    const target = linesRef.current[line]
    if (!target || target.check === null) return
    target.check = !target.check
    const selection = readSelection()
    if (selection) commit(selection.start, selection.end)
    else if (editorRef.current) render(editorRef.current, linesRef.current)
  }

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return
    render(editor, linesRef.current)
    const onSelectionChange = () => {
      const selection = readSelection()
      if (!selection) return
      if (comparePos(selection.start, selection.end) !== 0) pendingRef.current = null
      refreshActive()
    }
    document.addEventListener("selectionchange", onSelectionChange)
    editor.addEventListener("beforeinput", onBeforeInput)
    return () => {
      document.removeEventListener("selectionchange", onSelectionChange)
      editor.removeEventListener("beforeinput", onBeforeInput)
    }
    // The helpers below only read refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="relative h-[279px] w-[262.61px] rounded-[25px] bg-linear-to-b from-sticky-from to-sticky-to">
      {/* Second sheet under the note: the light background behind the toolbar. */}
      <div className="absolute top-[30.73px] left-[19.62px] h-[225.857px] w-[223.2px] rounded-[7.971px] bg-note" />
      {/* Under the note paper (Figma): its shadow falls on the buttons and their highlight. */}
      <div
        role="toolbar"
        aria-label="Text formatting"
        className="absolute top-[223.71px] left-[61.83px] flex h-6 items-center gap-[6.222px]"
      >
        {TOOLS.map(({ id, label, icon, box, glyph }) => {
          const pressed = id === "checklist" ? active.checklist : Boolean(active.formats & id)
          return (
            <button
              key={label}
              type="button"
              aria-label={label}
              aria-pressed={pressed}
              // Keep the text selection: formats apply to it.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                editorRef.current?.focus()
                if (id === "checklist") toggleChecklist()
                else toggleFormat(id as number)
              }}
              style={{ width: box, height: box }}
              className={cn(
                "-m-0.5 box-content grid cursor-pointer place-items-center rounded-md p-0.5 text-note-icon transition-colors outline-none hover:bg-note-highlight focus-visible:ring-2 focus-visible:ring-primary",
                pressed && "bg-note-highlight",
              )}
            >
              {/* The Figma icon as a mask, so it takes the token color. */}
              <span
                aria-hidden
                className="bg-current mask-contain mask-center mask-no-repeat"
                style={{ width: glyph[0], height: glyph[1], maskImage: `url(${icon.src})` }}
              />
            </button>
          )
        })}
      </div>
      {/* In the canvas's first view on large screens, where it is the largest paint: not lazy. */}
      <Image
        src={noteShape}
        alt=""
        unoptimized
        loading="eager"
        draggable={false}
        // Its shadow lies over the toolbar: clicks go through to the buttons.
        className="pointer-events-none absolute top-[10.75px] left-[4.01px] max-w-none"
      />
      <p className="absolute top-[14.92px] left-[33.72px] font-sans text-[23.299px] leading-[87.869px] font-medium tracking-[-1.398px] whitespace-nowrap text-note-ink uppercase">
        MC Events
      </p>
      <div
        ref={editorRef}
        contentEditable="true"
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="MC events note"
        spellCheck={false}
        onInput={() => {
          if (editorRef.current) linesRef.current = parse(editorRef.current)
        }}
        onCompositionEnd={() => {
          const selection = readSelection()
          if (selection) commit(selection.start, selection.end)
        }}
        onPaste={onPaste}
        onDrop={(event) => event.preventDefault()}
        onMouseDown={onMouseDown}
        className="absolute top-[98.55px] left-[36.27px] flex max-h-[104px] w-[182.19px] cursor-text [scrollbar-width:none] flex-col gap-[7px] overflow-y-auto font-sans text-sm leading-[15.318px] tracking-[-0.84px] text-muted-foreground outline-none select-text [&_strong]:font-semibold"
      />
    </div>
  )
}
