import { MainLayout } from "@/components/layout/main-layout"
import { TimetableView } from "@/components/timetable-view"

export default function TimetablePage() {
  return (
    <MainLayout>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Class Timetable</h1>
        <p className="text-muted-foreground">View your weekly class schedule and details</p>
      </div>

      <TimetableView />
    </MainLayout>
  )
}
