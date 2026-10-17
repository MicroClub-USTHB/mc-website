import { ArrowUpRightIcon } from "@/components/icons/arrow-up-right"
import { McButton } from "@/components/ui/mc-button"
import type { Department } from "@/const/departments"

/** Name, tagline, description and link of one department, shown while its panel is open. */
export function DepartmentCard({ department }: { department: Department }) {
  const { name, tagline, description, note, link } = department

  return (
    <div className="flex flex-col gap-3 p-6 lg:gap-4 lg:p-8">
      <p className="header-sm text-foreground lg:header-md">{name}</p>
      <p className="paragraph-xl font-medium text-foreground lg:header-xs">{tagline}</p>
      <p className="paragraph-md text-muted-foreground lg:paragraph-lg">{description}</p>
      {note && <p className="paragraph-md text-muted-foreground lg:paragraph-lg">{note}</p>}
      {link && (
        <p className="paragraph-md text-muted-foreground lg:paragraph-lg">
          {link.lead}{" "}
          <McButton
            variant="link"
            size="lg"
            icon="trailing"
            iconDefinition={<ArrowUpRightIcon />}
            nativeButton={false}
            render={<a href={link.href} target="_blank" rel="noopener noreferrer" />}
            className="border-0 align-baseline"
          >
            {link.label}
            <span className="sr-only"> (opens in a new tab)</span>
          </McButton>
        </p>
      )}
    </div>
  )
}
