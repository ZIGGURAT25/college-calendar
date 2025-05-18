import { MainLayout } from "@/components/layout/main-layout"
import { ExamEditor } from "@/components/admin/exam-editor"

export default function AdminExamsPage() {
  return (
    <MainLayout isAdmin={true}>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Exam Editor</h1>
        <p className="text-muted-foreground">Manage exam schedules and room allocations</p>
      </div>

      <ExamEditor />
    </MainLayout>
  )
}
