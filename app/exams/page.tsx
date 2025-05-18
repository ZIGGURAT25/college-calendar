import { MainLayout } from "@/components/layout/main-layout"
import { ExamSchedule } from "@/components/exam-schedule"

export default function ExamsPage() {
  return (
    <MainLayout>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Exam Schedule</h1>
        <p className="text-muted-foreground">View your upcoming exams and room allocations</p>
      </div>

      <ExamSchedule />
    </MainLayout>
  )
}
