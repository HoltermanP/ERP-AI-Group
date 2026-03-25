import { getCompanyProfile } from "@/lib/actions/company"
import { Card, CardHeader, CardBody } from "@/components/ui/Card"
import { SettingsForm } from "@/components/settings/SettingsForm"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const profile = await getCompanyProfile()

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#F4F6FA" }}>Instellingen</h1>
        <p className="mt-1 text-sm" style={{ color: "#6B82A8" }}>
          Bedrijfsprofiel voor <span style={{ color: "#4B8EFF" }}>AI</span>-Group ERP
        </p>
      </div>
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-sm" style={{ color: "#F4F6FA" }}>Bedrijfsgegevens</h2>
        </CardHeader>
        <CardBody>
          <SettingsForm profile={profile} />
        </CardBody>
      </Card>
    </div>
  )
}
