"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { subjects, faculty, type Subject } from "@/lib/data"
import { BookOpen, Users, Clock, GraduationCap } from "lucide-react"

export default function StudentSubjectsPage() {
  const [selectedSemester, setSelectedSemester] = useState<number>(1)
  const semesters = Array.from({ length: 8 }, (_, i) => i + 1)

  // Group subjects by type
  const groupedSubjects = subjects.reduce((acc, subject) => {
    if (!acc[subject.type]) {
      acc[subject.type] = []
    }
    acc[subject.type].push(subject)
    return acc
  }, {} as Record<Subject["type"], Subject[]>)

  // Get faculty name helper
  const getFacultyName = (facultyId: number) => {
    const facultyMember = faculty.find(f => f.id === facultyId)
    return facultyMember ? facultyMember.name : "Not Assigned"
  }

  // Get badge variant based on subject type
  const getSubjectBadgeVariant = (type: Subject["type"]) => {
    switch (type) {
      case "Theory":
        return "default"
      case "Lab":
        return "secondary"
      case "Elective":
        return "outline"
      case "Combined":
        return "destructive"
      default:
        return "default"
    }
  }

  // Get icon based on subject type
  const getSubjectIcon = (type: Subject["type"]) => {
    switch (type) {
      case "Theory":
        return <BookOpen className="h-5 w-5" />
      case "Lab":
        return <Users className="h-5 w-5" />
      case "Elective":
        return <GraduationCap className="h-5 w-5" />
      case "Combined":
        return <Clock className="h-5 w-5" />
      default:
        return <BookOpen className="h-5 w-5" />
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Subjects</h1>
          <p className="text-muted-foreground">
            View all subjects and their details for your course.
          </p>
        </div>

        <Tabs defaultValue={selectedSemester.toString()} className="space-y-4">
          <TabsList className="w-full flex-wrap h-auto p-1 gap-1">
            {semesters.map(sem => (
              <TabsTrigger
                key={sem}
                value={sem.toString()}
                onClick={() => setSelectedSemester(sem)}
                className="flex-1"
              >
                Semester {sem}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(groupedSubjects).map(([type, typeSubjects]) => (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getSubjectIcon(type as Subject["type"])}
                  {type} Subjects
                  <Badge variant={getSubjectBadgeVariant(type as Subject["type"])}>
                    {typeSubjects.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {typeSubjects.map(subject => (
                    <Card key={subject.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-4 bg-muted/50">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium truncate">
                              {subject.subjectName}
                            </h3>
                            <Badge variant={getSubjectBadgeVariant(subject.type)}>
                              {subject.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {subject.subjectCode}
                          </p>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Faculty</span>
                            <span className="font-medium">
                              {getFacultyName(subject.facultyId)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Credits</span>
                            <span className="font-medium">3</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Status</span>
                            <Badge variant="outline" className="font-normal">
                              {subject.type === "Elective" ? "Optional" : "Core"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  )
} 