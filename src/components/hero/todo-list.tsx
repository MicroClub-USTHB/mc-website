"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"

/** Figma tasks and their default state (the first two already done). */
const TASKS = [
  { label: "Build real technical skills", done: true },
  { label: "Professional networking", done: true },
  { label: "Survive the semester", done: false },
]

/**
 * Figma "To Do List": a tilted paper note on a yellow card. Each task is a real checkbox: clicking
 * it (or Space) toggles it between unchecked and checked, which strikes the task through.
 */
export function TodoList() {
  const [done, setDone] = useState(() => TASKS.map((task) => task.done))

  return (
    <div className="grid size-70 place-items-center rounded-[2.125rem] bg-linear-to-b from-todo-from to-todo-to">
      <div className="relative h-56.5 w-56 -rotate-[8.79deg] rounded-lg bg-note shadow-[0_0.625rem_1rem_rgb(0_0_0/0.25)]">
        <p className="px-4 pt-7 font-sans text-2xl leading-none font-medium tracking-tighter text-note-ink uppercase">
          To do list
        </p>
        <ul className="mt-6 border-t border-note-ink/40">
          {TASKS.map((task, i) => (
            <li key={task.label} className="border-b border-note-ink/40">
              <label className="flex cursor-pointer items-center gap-2 px-4 py-2.5">
                <input
                  type="checkbox"
                  checked={done[i]}
                  onChange={() =>
                    setDone((all) => all.map((value, j) => (j === i ? !value : value)))
                  }
                  className="peer size-3.25 shrink-0 cursor-pointer appearance-none rounded-[0.2rem] border border-note-ink transition-colors checked:bg-note-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                />
                <span
                  className={cn(
                    "paragraph-sm leading-4 tracking-tight text-primary decoration-1 transition-colors peer-checked:line-through",
                  )}
                >
                  {task.label}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
