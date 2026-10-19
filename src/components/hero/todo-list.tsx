"use client"

import { useState } from "react"

/** Figma tasks, their place on the note (px) and default state (the first two already done). */
const TASKS = [
  { label: "Build real technical skills", done: true, left: 14.65, top: 95.81 },
  { label: "Professional networking", done: true, left: 14.65, top: 133.01 },
  { label: "Survive the semester", done: false, left: 15.45, top: 170.78 },
]

/** Ruled lines of the note (px from its top). */
const RULES = [85.46, 122.44, 159.41, 196.39]

/**
 * Figma "To Do List Card": a tilted paper note over a second one, on a yellow card. Each task is a
 * real checkbox: clicking it (or Space) toggles it, which strikes the task through.
 */
export function TodoList() {
  const [done, setDone] = useState(() => TASKS.map((task) => task.done))

  return (
    <div className="relative size-[279px] rounded-[34.543px] bg-linear-to-b from-todo-from to-todo-to">
      <div className="absolute top-[29.02px] left-[29.24px] h-[225.857px] w-[223.2px] rounded-[7.971px] bg-note" />

      <div className="absolute top-[9.5px] left-[13.45px] flex h-[258.037px] w-[255.984px] items-center justify-center">
        <div className="relative h-[226.466px] w-[224.008px] -rotate-[8.79deg] rounded-[7.967px]">
          <div className="absolute top-[0.61px] left-[0.81px] h-[225.857px] w-[223.2px] rounded-[7.971px] bg-note shadow-[0_10.629px_15.411px_0_rgb(0_0_0/0.25)]" />
          <p className="absolute top-0 left-[15.11px] font-sans text-[23.299px] leading-[87.869px] font-medium tracking-[-1.398px] whitespace-nowrap text-note-ink uppercase">
            To do list
          </p>
          {RULES.map((top) => (
            <span
              key={top}
              aria-hidden
              style={{ top }}
              className="absolute left-0 h-[0.672px] w-[223.2px] -translate-y-1/2 bg-note-ink"
            />
          ))}
          <ul>
            {TASKS.map((task, i) => (
              <li key={task.label} className="absolute" style={{ left: task.left, top: task.top }}>
                <label className="flex cursor-pointer items-center gap-[7.659px]">
                  <input
                    type="checkbox"
                    checked={done[i]}
                    onChange={() =>
                      setDone((all) => all.map((value, j) => (j === i ? !value : value)))
                    }
                    className="peer size-[12.652px] shrink-0 cursor-pointer appearance-none rounded-[3.282px] border-[1.094px] border-note-ink transition-colors checked:bg-note-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  />
                  <span className="font-sans text-sm leading-[15.318px] tracking-[-0.84px] whitespace-nowrap text-primary peer-checked:line-through">
                    {task.label}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
