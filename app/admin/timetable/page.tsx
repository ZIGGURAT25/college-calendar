"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { TimetableEditor } from "@/components/admin/timetable-editor/timetable-editor"

export default function AdminTimetablePage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timetable Management</h1>
          <p className="text-muted-foreground">
            Manage and edit the department class schedule.
          </p>
        </div>

        <TimetableEditor />
      </div>
    </MainLayout>
  )
}
