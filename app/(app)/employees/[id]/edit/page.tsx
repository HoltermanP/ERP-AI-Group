import { notFound } from "next/navigation"
import Link from "next/link"
import { getEmployee } from "@/lib/actions/employees"
import { Card, CardHeader, CardBody } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { EmployeeForm } from "@/components/employees/EmployeeForm"
import { ArrowLeft } from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditEmployeePage({ params }: PageProps) {
  const { id } = await params
  const employee = await getEmployee(parseInt(id))

  if (!employee) notFound()

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/employees">
          <Button variant="secondary" size="sm"><ArrowLeft size={14} />Terug</Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#F4F6FA" }}>{employee.name}</h1>
          <p className="mt-0.5 text-sm" style={{ color: "#6B82A8" }}>Medewerker bewerken</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-sm" style={{ color: "#F4F6FA" }}>Medewerkergegevens</h2>
        </CardHeader>
        <CardBody>
          <EmployeeForm employee={employee} />
        </CardBody>
      </Card>
    </div>
  )
}
