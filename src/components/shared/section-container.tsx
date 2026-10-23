import { cn } from "@/lib/utils"
import type { HomeSectionId } from "@/config/site"

type SectionContainerProps = React.ComponentProps<"section"> & {
  id: HomeSectionId
  /** Light (default) or dark section. Dark applies the mcoli-ui dark tokens to the whole section. */
  theme?: "light" | "dark"
} & (
    | { bleed?: false; title?: string; description?: string }
    /** Full-bleed section: no padding, no max-width wrapper and no heading (custom layouts). */
    | { bleed: true; title?: never; description?: never }
  )

/** Shared wrapper for every landing page section: anchor id, spacing, heading. */
export function SectionContainer({
  id,
  title,
  description,
  theme = "light",
  bleed = false,
  className,
  children,
  ...props
}: SectionContainerProps) {
  return (
    <section
      id={id}
      aria-labelledby={title ? `${id}-title` : undefined}
      className={cn(
        theme === "dark" && "dark",
        "scroll-mt-20 bg-background text-foreground",
        !bleed && "px-4 py-20 sm:px-6 lg:px-8",
        className,
      )}
      {...props}
    >
      {bleed ? (
        children
      ) : (
        <div className="mx-auto w-full max-w-site">
          {title && (
            <header className="mb-10 space-y-2">
              <h2 id={`${id}-title`} className="header-md font-semibold">
                {title}
              </h2>
              {description && (
                <p className="max-w-2xl paragraph-lg text-muted-foreground">{description}</p>
              )}
            </header>
          )}
          {children}
        </div>
      )}
    </section>
  )
}
