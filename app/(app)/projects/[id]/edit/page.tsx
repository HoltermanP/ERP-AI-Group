import { notFound } from "next/navigation"
import Link from "next/link"
import { getProject } from "@/lib/actions/projects"
import { Card, CardHeader, CardBody } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { ProjectForm } from "@/components/projects/ProjectForm"
import { ArrowLeft } from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params
  const project = await getProject(parseInt(id))

  if (!project) notFound()

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href={`/projects/${project.id}`}>
          <Button variant="secondary" size="sm"><ArrowLeft size={14} />Terug</Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#F4F6FA" }}>{project.name}</h1>
          <p className="mt-0.5 text-sm" style={{ color: "#6B82A8" }}>Project bewerken</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-sm" style={{ color: "#F4F6FA" }}>Projectgegevens</h2>
        </CardHeader>
        <CardBody>
          <ProjectForm project={project} />
        </CardBody>
      </Card>
    </div>
  )
}
