import { Card, CardHeader, CardBody } from "@/components/ui/Card"
import { EmployeeForm } from "@/components/employees/EmployeeForm"

export default function NewEmployeePage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#F4F6FA" }}>Nieuwe medewerker</h1>
        <p className="mt-1 text-sm" style={{ color: "#6B82A8" }}>Voeg een medewerker toe aan het systeem</p>
      </div>
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-sm" style={{ color: "#F4F6FA" }}>Medewerkergegevens</h2>
        </CardHeader>
        <CardBody>
          <EmployeeForm />
        </CardBody>
      </Card>
    </div>
  )
}
