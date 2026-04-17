import { notFound } from "next/navigation"
import Link from "next/link"
import { getProject } from "@/lib/actions/projects"
import { getEmployees } from "@/lib/actions/employees"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { ProjectDetailClient } from "@/components/projects/ProjectDetailClient"
import { formatDate } from "@/lib/utils/formatters"
import { Pencil, Building2, Calendar } from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params
  const [project, allEmployees] = await Promise.all([
    getProject(parseInt(id)),
    getEmployees(),
  ])

  if (!project) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-mono" style={{ color: "#4B8EFF" }}>{project.projectNumber}</span>
            <h1 className="text-2xl font-bold" style={{ color: "#F4F6FA" }}>{project.name}</h1>
            <Badge status={project.status || "concept"} />
          </div>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            {project.customer && (
              <Link href={`/customers/${project.customer.id}`} className="flex items-center gap-1.5 text-sm" style={{ color: "#6B82A8" }}>
                <Building2 size={13} />
                {project.customer.companyName}
              </Link>
            )}
            {(project.startDate || project.endDate) && (
              <span className="flex items-center gap-1.5 text-sm" style={{ color: "#6B82A8" }}>
                <Calendar size={13} />
                {formatDate(project.startDate)}
                {project.endDate && ` → ${formatDate(project.endDate)}`}
              </span>
            )}
          </div>
        </div>
        <Link href={`/projects/${project.id}/edit`}>
          <Button variant="secondary" size="sm">
            <Pencil size={14} />
            Bewerken
          </Button>
        </Link>
      </div>

      <ProjectDetailClient project={project} allEmployees={allEmployees} />
    </div>
  )
}
