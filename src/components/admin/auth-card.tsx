import { McCard, McCardHeader } from "@/components/ui/mc-card"

/** Centered card of the signed-out and password pages. */
export function AuthCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <McCard className="max-w-md gap-6 p-6 sm:p-8">
        <McCardHeader
          title={title}
          description={description}
          className="[&_h3]:font-heading [&_p]:paragraph-sm [&_p]:text-muted-foreground"
        />
        {children}
      </McCard>
    </div>
  )
}
