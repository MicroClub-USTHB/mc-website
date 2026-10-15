"use client"

import { useMenu } from "@/components/site-menu/menu-context"

/**
 * Sets the hover fill origin to the edge the pointer crossed, so the fill grows from where the
 * pointer enters and shrinks toward where it leaves.
 */
function setFillOrigin(event: React.PointerEvent<HTMLAnchorElement>) {
  const { top, height } = event.currentTarget.getBoundingClientRect()
  const fromTop = event.clientY - top < height / 2
  event.currentTarget.style.setProperty("--fill-origin", fromTop ? "top" : "bottom")
}

/**
 * Full-width menu row with a directional primary fill on hover / focus. A real `#section` link
 * for crawlers; on click it closes the menu and jumps to the section while the panel covers it.
 */
export function MenuLink({
  sectionId,
  children,
}: {
  sectionId: string
  children: React.ReactNode
}) {
  const { navigateTo } = useMenu()

  return (
    <a
      href={`/#${sectionId}`}
      onClick={(event) => {
        event.preventDefault()
        navigateTo(`#${sectionId}`, { immediate: true })
      }}
      onPointerEnter={setFillOrigin}
      onPointerLeave={setFillOrigin}
      className="group relative flex h-(--menu-row) items-center justify-center overflow-hidden border-b border-border outline-none"
    >
      <span
        aria-hidden
        className="absolute inset-0 origin-(--fill-origin,bottom) scale-y-0 bg-primary transition-transform duration-400 ease-out-expo group-hover:scale-y-100 group-focus-visible:scale-y-100"
      />
      <span className="relative font-heading text-(length:--menu-row-text) leading-tight tracking-[-0.02em] text-foreground uppercase transition-colors duration-150 group-hover:text-primary-foreground group-focus-visible:text-primary-foreground">
        {children}
      </span>
    </a>
  )
}
