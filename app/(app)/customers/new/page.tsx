import { Card, CardHeader, CardBody } from "@/components/ui/Card"
import { CustomerForm } from "@/components/customers/CustomerForm"

export default function NewCustomerPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#F4F6FA" }}>Nieuwe klant</h1>
        <p className="mt-1 text-sm" style={{ color: "#6B82A8" }}>Voeg een nieuwe klant toe</p>
      </div>
      <Card>
        <CardBody>
          <CustomerForm />
        </CardBody>
      </Card>
    </div>
  )
}
