import { Accordion } from "@base-ui/react/accordion"
import { ArrowUpRightIcon } from "lucide-react"

import { McBadge } from "@/components/ui/mc-badge"
import { McButton } from "@/components/ui/mc-button"
import type { Project } from "@/const/featured-projects"
import { cn } from "@/lib/utils"

/**
 * One project row (Figma "project frame"): name, tags and year; hovering highlights it, clicking
 * expands the description and the project link.
 *
 * Semantics: the heading only holds the project name. Its trigger stretches over the whole row
 * (`after:inset-0`), so the tags list and year stay outside the heading and the button but the
 * full row is still clickable. The panel stays in the DOM (`hidden="until-found"`) so its content
 * is indexed and reachable through the browser's find-in-page.
 */
export function ProjectItem({ project }: { project: Project }) {
  const [mainTag, ...otherTags] = project.tags

  return (
    <Accordion.Item className="border-b border-border">
      <div className="group relative flex items-start justify-between gap-4 py-4.5 pr-4 transition-colors duration-200 ease-in hover:bg-accent has-focus-visible:bg-accent lg:pr-11">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-43.75">
          <Accordion.Header
            render={<h4 className="paragraph-xl font-medium lg:w-50.75 lg:whitespace-nowrap" />}
          >
            <Accordion.Trigger className="cursor-pointer text-left text-foreground transition-colors duration-200 ease-in outline-none group-hover:text-accent-foreground after:absolute after:inset-0 focus-visible:text-accent-foreground">
              {project.name}
            </Accordion.Trigger>
          </Accordion.Header>

          <ul aria-label="Tags" className="flex flex-wrap gap-1.5">
            <li>
              <McBadge size="lg" className="h-auto bg-primary leading-5 text-primary-foreground">
                {mainTag}
              </McBadge>
            </li>
            {otherTags.map((tag) => (
              <li key={tag}>
                <McBadge size="lg" className="h-auto leading-5">
                  {tag}
                </McBadge>
              </li>
            ))}
          </ul>
        </div>

        <time dateTime={String(project.year)} className="paragraph-xl font-medium text-foreground">
          {project.year}
        </time>
      </div>

      <Accordion.Panel
        hiddenUntilFound
        className={cn(
          "h-(--accordion-panel-height) overflow-hidden",
          "transition-[height] duration-400 ease-out-quart data-ending-style:h-0 data-starting-style:h-0",
        )}
      >
        <div className="flex max-w-140 flex-col items-start gap-8 pt-8.5 pr-4 pb-4.5">
          <p className="paragraph-md font-medium text-muted-foreground">{project.description}</p>
          <McButton
            variant="link"
            size="lg"
            icon="trailing"
            iconDefinition={<ArrowUpRightIcon />}
            nativeButton={false}
            render={<a href={project.url} target="_blank" rel="noopener noreferrer" />}
            className="[&_[data-slot=trailing-icon]]:size-5"
          >
            Project Link
            <span className="sr-only">: {project.name} (opens in a new tab)</span>
          </McButton>
        </div>
      </Accordion.Panel>
    </Accordion.Item>
  )
}
