import Link from "next/link"
import { Calendar, ClipboardList } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MainLayout } from "@/components/layout/main-layout"

export default function Home() {
  return (
    <MainLayout>
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">College Department Calendar</h1>
        <p className="text-muted-foreground">View your class timetable and exam schedule in one place</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="bg-blue-500/10 rounded-t-lg">
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Timetable
            </CardTitle>
            <CardDescription>View your weekly class schedule</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>Access your complete class timetable with details on:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>Subject information</li>
              <li>Faculty details</li>
              <li>Room allocations</li>
              <li>Daily and weekly views</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link href="/timetable" passHref>
              <Button>View Timetable</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="bg-red-500/10 rounded-t-lg">
            <CardTitle className="flex items-center">
              <ClipboardList className="mr-2 h-5 w-5" />
              Exam Schedule
            </CardTitle>
            <CardDescription>Check your upcoming exams</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>Stay updated with your exam schedule including:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>Exam dates and times</li>
              <li>Room allocations</li>
              <li>Register number filtering</li>
              <li>Calendar and list views</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link href="/exams" passHref>
              <Button>View Exams</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Link href="/timetable" passHref>
            <div className="bg-blue-500/10 hover:bg-blue-500/20 p-4 rounded-lg transition-colors">
              <h3 className="font-medium">Today's Classes</h3>
              <p className="text-sm text-muted-foreground">View your schedule for today</p>
            </div>
          </Link>
          <Link href="/exams" passHref>
            <div className="bg-red-500/10 hover:bg-red-500/20 p-4 rounded-lg transition-colors">
              <h3 className="font-medium">Upcoming Exams</h3>
              <p className="text-sm text-muted-foreground">Check your next exams</p>
            </div>
          </Link>
          <Link href="/admin" passHref>
            <div className="bg-purple-500/10 hover:bg-purple-500/20 p-4 rounded-lg transition-colors">
              <h3 className="font-medium">Admin Panel</h3>
              <p className="text-sm text-muted-foreground">Manage timetables and exams</p>
            </div>
          </Link>
        </div>
      </div>
    </MainLayout>
  )
}
