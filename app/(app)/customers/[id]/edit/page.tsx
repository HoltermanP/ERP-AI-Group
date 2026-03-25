import { notFound } from "next/navigation"
import { getCustomer } from "@/lib/actions/customers"
import { Card, CardBody } from "@/components/ui/Card"
import { CustomerForm } from "@/components/customers/CustomerForm"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditCustomerPage({ params }: PageProps) {
  const { id } = await params
  const customer = await getCustomer(parseInt(id))
  if (!customer) notFound()

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#F4F6FA" }}>
          {customer.companyName} bewerken
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#6B82A8" }}>Klantgegevens aanpassen</p>
      </div>
      <Card>
        <CardBody>
          <CustomerForm customer={customer} />
        </CardBody>
      </Card>
    </div>
  )
}
