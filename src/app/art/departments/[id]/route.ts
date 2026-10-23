import { DEPARTMENTS, type DepartmentId } from "@/const/departments"
import { departmentArtHtml } from "@/lib/departments/art"

/** Built once per department: the illustration layers the Our Departments panels fetch. */
export function generateStaticParams() {
  return DEPARTMENTS.map(({ id }) => ({ id }))
}

export const dynamicParams = false

export async function GET(_request: Request, { params }: RouteContext<"/art/departments/[id]">) {
  const { id } = await params
  return new Response(departmentArtHtml(id as DepartmentId), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // A fragment of the home page, not a page of its own.
      "X-Robots-Tag": "noindex",
    },
  })
}
