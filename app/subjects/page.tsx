"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { subjects, faculty, type Subject } from "@/lib/data"

export default function SubjectsPage() {
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
          <TabsList>
            {semesters.map(sem => (
              <TabsTrigger
                key={sem}
                value={sem.toString()}
                onClick={() => setSelectedSemester(sem)}
              >
                Semester {sem}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="grid gap-6">
            {Object.entries(groupedSubjects).map(([type, typeSubjects]) => (
              <Card key={type}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {type} Subjects
                    <Badge variant={getSubjectBadgeVariant(type as Subject["type"])}>
                      {typeSubjects.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {typeSubjects.map(subject => (
                      <Card key={subject.id}>
                        <CardContent className="pt-6">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{subject.subjectName}</h3>
                              <Badge variant={getSubjectBadgeVariant(subject.type)}>
                                {subject.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {subject.subjectCode}
                            </p>
                            <div className="pt-2 text-sm">
                              <div className="flex justify-between py-1 border-b">
                                <span className="text-muted-foreground">Faculty</span>
                                <span>{getFacultyName(subject.facultyId)}</span>
                              </div>
                              <div className="flex justify-between py-1">
                                <span className="text-muted-foreground">Credits</span>
                                <span>3</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Tabs>
      </div>
    </MainLayout>
  )
} 