import { Accordion } from "@base-ui/react/accordion"
import { ArrowUpRightIcon } from "lucide-react"

import { McBadge } from "@/components/ui/mc-badge"
import { McButton } from "@/components/ui/mc-button"
import type { Project } from "@/const/projects"
import { cn } from "@/lib/utils"

/**
 * One project row (Figma "project frame"): name, tags and year; hovering highlights it, clicking
 * expands the description and the project link. The panel stays in the DOM (`hidden="until-found"`)
 * so its content is indexed and reachable through the browser's find-in-page.
 */
export function ProjectItem({ project }: { project: Project }) {
  const [mainTag, ...otherTags] = project.tags

  return (
    <Accordion.Item className="border-b border-border">
      <Accordion.Header render={<h4 />}>
        <Accordion.Trigger className="group flex w-full cursor-pointer items-start justify-between gap-4 py-[18px] pr-4 text-left transition-colors duration-200 ease-in outline-none hover:bg-accent focus-visible:bg-accent lg:pr-11">
          <span className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-[175px]">
            <span className="paragraph-xl font-medium text-foreground transition-colors duration-200 ease-in group-hover:text-accent-foreground group-focus-visible:text-accent-foreground lg:w-[203px] lg:whitespace-nowrap">
              {project.name}
            </span>
            <span className="flex flex-wrap gap-1.5">
              <McBadge size="lg" className="h-auto bg-primary leading-5 text-primary-foreground">
                {mainTag}
              </McBadge>
              {otherTags.map((tag) => (
                <McBadge key={tag} size="lg" className="h-auto leading-5">
                  {tag}
                </McBadge>
              ))}
            </span>
          </span>
          <span className="paragraph-xl font-medium text-foreground">{project.year}</span>
        </Accordion.Trigger>
      </Accordion.Header>

      <Accordion.Panel
        hiddenUntilFound
        className={cn(
          "h-(--accordion-panel-height) overflow-hidden",
          "transition-[height] duration-400 ease-out-quart data-ending-style:h-0 data-starting-style:h-0",
        )}
      >
        <div className="flex max-w-[560px] flex-col items-start gap-8 pt-[34px] pr-4 pb-[18px]">
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
