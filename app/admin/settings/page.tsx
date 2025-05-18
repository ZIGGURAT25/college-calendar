import { MainLayout } from "@/components/layout/main-layout"
import { SettingsPanel } from "@/components/admin/settings"

export default function AdminSettingsPage() {
  return (
    <MainLayout isAdmin={true}>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Department Settings</h1>
        <p className="text-muted-foreground">Configure timetable and department settings</p>
      </div>

      <SettingsPanel />
    </MainLayout>
  )
}
