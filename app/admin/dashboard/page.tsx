import Link from "next/link"
import { Calendar, ClipboardList, Users, BookOpen, School } from "lucide-react"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminDashboardPage() {
  return (
    <MainLayout isAdmin={true}>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage timetables, exams, and department resources</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Users className="mr-2 h-5 w-5 text-blue-500" />
              Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">67</p>
            <p className="text-sm text-muted-foreground">Total enrolled students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <School className="mr-2 h-5 w-5 text-purple-500" />
              Faculty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">6</p>
            <p className="text-sm text-muted-foreground">Teaching staff members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-cyan-500" />
              Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">8</p>
            <p className="text-sm text-muted-foreground">Active courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <ClipboardList className="mr-2 h-5 w-5 text-red-500" />
              Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">3</p>
            <p className="text-sm text-muted-foreground">Upcoming examinations</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-500" />
              Timetable Management
            </CardTitle>
            <CardDescription>Edit and manage class schedules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Manage the department timetable:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Add or edit classes</li>
              <li>Assign faculty to courses</li>
              <li>Manage room allocations</li>
              <li>Set up elective courses</li>
            </ul>
            <div className="pt-2">
              <Link href="/admin/timetable" passHref>
                <div className="text-primary hover:underline">Go to Timetable Editor →</div>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardList className="mr-2 h-5 w-5 text-red-500" />
              Exam Management
            </CardTitle>
            <CardDescription>Schedule and organize examinations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Manage upcoming examinations:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Schedule new exams</li>
              <li>Allocate rooms for exams</li>
              <li>Assign register number ranges</li>
              <li>Manage exam timetable</li>
            </ul>
            <div className="pt-2">
              <Link href="/admin/exams" passHref>
                <div className="text-primary hover:underline">Go to Exam Editor →</div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Link href="/admin/timetable" passHref>
              <div className="bg-blue-500/10 hover:bg-blue-500/20 p-4 rounded-lg transition-colors">
                <h3 className="font-medium flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Edit Timetable
                </h3>
                <p className="text-sm text-muted-foreground">Manage class schedules</p>
              </div>
            </Link>
            <Link href="/admin/exams" passHref>
              <div className="bg-red-500/10 hover:bg-red-500/20 p-4 rounded-lg transition-colors">
                <h3 className="font-medium flex items-center">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Edit Exams
                </h3>
                <p className="text-sm text-muted-foreground">Manage exam schedule</p>
              </div>
            </Link>
            <Link href="/admin/settings" passHref>
              <div className="bg-purple-500/10 hover:bg-purple-500/20 p-4 rounded-lg transition-colors">
                <h3 className="font-medium flex items-center">
                  <School className="mr-2 h-4 w-4" />
                  Department Settings
                </h3>
                <p className="text-sm text-muted-foreground">Configure department options</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  )
}
