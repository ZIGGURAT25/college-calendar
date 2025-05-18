import { MainLayout } from "@/components/layout/main-layout"
import { TimetableEditor } from "@/components/admin/timetable-editor"

export default function AdminTimetablePage() {
  return (
    <MainLayout isAdmin={true}>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Timetable Editor</h1>
        <p className="text-muted-foreground">Manage and edit the department class schedule</p>
      </div>

      <TimetableEditor />
    </MainLayout>
  )
}
