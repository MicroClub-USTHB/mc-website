"use client"

/**
 * Sets the hover fill origin to the edge the pointer crossed, so the fill grows from where the
 * pointer enters and shrinks toward where it leaves.
 */
function setFillOrigin(event: React.PointerEvent<HTMLAnchorElement>) {
  const { top, height } = event.currentTarget.getBoundingClientRect()
  const fromTop = event.clientY - top < height / 2
  event.currentTarget.style.setProperty("--fill-origin", fromTop ? "top" : "bottom")
}

type MenuLinkProps = {
  href: string
  onNavigate: () => void
  children: React.ReactNode
}

/** Full-width menu row with a directional primary fill on hover / focus. */
export function MenuLink({ href, onNavigate, children }: MenuLinkProps) {
  return (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault()
        onNavigate()
      }}
      onPointerEnter={setFillOrigin}
      onPointerLeave={setFillOrigin}
      className="group relative flex h-20 items-center justify-center overflow-hidden border-b border-border outline-none lg:h-30"
    >
      <span
        aria-hidden
        className="absolute inset-0 origin-(--fill-origin,bottom) scale-y-0 bg-primary transition-transform duration-400 ease-out-expo group-hover:scale-y-100 group-focus-visible:scale-y-100"
      />
      <span className="relative header-sm text-foreground uppercase transition-colors duration-150 group-hover:text-primary-foreground group-focus-visible:text-primary-foreground lg:header-xl">
        {children}
      </span>
    </a>
  )
}
