import { Card, CardHeader, CardBody } from "@/components/ui/Card"
import { ProjectForm } from "@/components/projects/ProjectForm"

interface PageProps {
  searchParams: Promise<{ customerId?: string }>
}

export default async function NewProjectPage({ searchParams }: PageProps) {
  const { customerId } = await searchParams
  const preselectedCustomerId = customerId ? parseInt(customerId) : undefined

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#F4F6FA" }}>Nieuw project</h1>
        <p className="mt-1 text-sm" style={{ color: "#6B82A8" }}>Maak een nieuw project aan</p>
      </div>
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-sm" style={{ color: "#F4F6FA" }}>Projectgegevens</h2>
        </CardHeader>
        <CardBody>
          <ProjectForm preselectedCustomerId={preselectedCustomerId} />
        </CardBody>
      </Card>
    </div>
  )
}
