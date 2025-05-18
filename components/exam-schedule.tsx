"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Search, ChevronLeft, ChevronRight } from "lucide-react"

import { cn, formatDate, formatTime, dateToISOString } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  type Exam,
  getSubjectById,
  getExamRoomsByExamId,
  getExamRoomForStudent,
  exams,
  getExamsForMonth,
  getExamsForDate,
} from "@/lib/data"

type ExamScheduleProps = {
  initialView?: "calendar" | "list"
  registerNo?: string
}

// Define exam groups
const examGroups = [
  { id: "cat1", name: "CAT 1", description: "First Continuous Assessment Test" },
  { id: "cat2", name: "CAT 2", description: "Second Continuous Assessment Test" },
  { id: "cat3", name: "CAT 3", description: "Third Continuous Assessment Test" },
  { id: "practical", name: "Practical", description: "Practical Examinations" },
  { id: "endsem", name: "End Semester", description: "End Semester Examinations" },
]

export function ExamSchedule({ initialView = "calendar", registerNo = "" }: ExamScheduleProps) {
  const [view, setView] = useState<"calendar" | "list">(initialView)
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchRegisterNo, setSearchRegisterNo] = useState(registerNo)
  const [searchResults, setSearchResults] = useState<{ exam: Exam; room: string | null } | null>(null)
  const [monthExams, setMonthExams] = useState<Exam[]>([])
  const [dateExams, setDateExams] = useState<Exam[]>([])
  const [selectedExamGroup, setSelectedExamGroup] = useState<string>("all")
  const [viewType, setViewType] = useState<"all" | "my">("all")

  // Load exams for the current month
  useEffect(() => {
    setMonthExams(getExamsForMonth(currentMonth.getFullYear(), currentMonth.getMonth()))
  }, [currentMonth])

  // Load exams for the selected date
  useEffect(() => {
    if (selectedDate) {
      setDateExams(getExamsForDate(dateToISOString(selectedDate)))
    }
  }, [selectedDate])

  const handleExamClick = (exam: Exam) => {
    setSelectedExam(exam)
    setIsDialogOpen(true)
  }

  const handleSearch = () => {
    if (!searchRegisterNo) {
      setSearchResults(null)
      return
    }

    // Find all exams and their rooms for this student
    const results = exams
      .map((exam) => {
        const room = getExamRoomForStudent(exam.id, searchRegisterNo)
        return { exam, room }
      })
      .filter((result) => result.room !== null)

    if (results.length > 0) {
      setSearchResults(results[0])
      setSelectedExam(results[0].exam)
      setIsDialogOpen(true)
    } else {
      setSearchResults({ exam: exams[0], room: null })
      setSelectedExam(exams[0])
      setIsDialogOpen(true)
    }
  }

  const handlePrevMonth = () => {
    const prevMonth = new Date(currentMonth)
    prevMonth.setMonth(prevMonth.getMonth() - 1)
    setCurrentMonth(prevMonth)
  }

  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    setCurrentMonth(nextMonth)
  }

  // Filter exams based on selected group
  const filteredExams = exams.filter((exam) => {
    // If "all" is selected, show all exams
    if (selectedExamGroup === "all") return true

    // Otherwise, filter by exam group (in a real app, exams would have a groupId property)
    // For this example, we'll just simulate filtering by assigning exams to groups based on their ID
    const examId = exam.id
    if (selectedExamGroup === "cat1" && examId <= 2) return true
    if (selectedExamGroup === "cat2" && examId > 2 && examId <= 4) return true
    if (selectedExamGroup === "cat3" && examId > 4 && examId <= 6) return true
    if (selectedExamGroup === "practical" && examId === 7) return true
    if (selectedExamGroup === "endsem" && examId === 8) return true

    return false
  })

  const renderCalendarView = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // Get days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Get first day of month (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfMonth = new Date(year, month, 1).getDay()

    // Adjust for Monday as first day of week
    const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

    // Create array of days
    const days = []
    for (let i = 0; i < startDay; i++) {
      days.push(null) // Empty cells for days before the 1st of the month
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    // Get month name
    const monthName = new Date(year, month, 1).toLocaleString("default", { month: "long" })

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-full">
            <div className="rounded-md border bg-card p-4">
              <div className="flex justify-between items-center mb-4">
                <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="font-medium text-lg">
                  {monthName} {year}
                </h3>
                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="h-12 rounded-md" />
                  }

                  const dateStr = dateToISOString(day)
                  const hasExams = monthExams.some((exam) => exam.date === dateStr)
                  const isSelected =
                    selectedDate &&
                    day.getDate() === selectedDate.getDate() &&
                    day.getMonth() === selectedDate.getMonth() &&
                    day.getFullYear() === selectedDate.getFullYear()

                  return (
                    <button
                      key={day.getTime()}
                      className={cn(
                        "h-12 rounded-md flex flex-col items-center justify-center relative transition-colors",
                        hasExams ? "font-medium" : "",
                        isSelected ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                      )}
                      onClick={() => setSelectedDate(day)}
                    >
                      <span>{day.getDate()}</span>
                      {hasExams && (
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full absolute bottom-1",
                            isSelected ? "bg-primary-foreground" : "bg-primary",
                          )}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="md:w-full">
            <div className="rounded-md border bg-card p-4 h-full">
              <h3 className="font-medium mb-4">{selectedDate ? formatDate(selectedDate) : "Select a date"}</h3>

              {selectedDate && (
                <div className="space-y-3">
                  {dateExams.length > 0 ? (
                    dateExams.map((exam) => {
                      const subject = getSubjectById(exam.subjectId)
                      if (!subject) return null

                      return (
                        <div
                          key={exam.id}
                          className="p-3 bg-secondary rounded-md cursor-pointer hover:bg-secondary/80"
                          onClick={() => handleExamClick(exam)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{subject.subjectName}</h4>
                              <p className="text-sm text-muted-foreground">{subject.subjectCode}</p>
                              <p className="text-sm">{formatTime(exam.time)}</p>
                            </div>
                            <Badge variant="exam">Exam</Badge>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <CalendarIcon className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No exams scheduled for this date</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderListView = () => {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <Select value={selectedExamGroup} onValueChange={setSelectedExamGroup}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Exam Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exams</SelectItem>
                {examGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Button variant={viewType === "all" ? "default" : "outline"} size="sm" onClick={() => setViewType("all")}>
                All Schedule
              </Button>
              <Button variant={viewType === "my" ? "default" : "outline"} size="sm" onClick={() => setViewType("my")}>
                My Schedule
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Input
              placeholder="Enter Register Number"
              value={searchRegisterNo}
              onChange={(e) => setSearchRegisterNo(e.target.value)}
              className="max-w-xs"
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Find Room
            </Button>
          </div>
        </div>

        {selectedExamGroup !== "all" && (
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-medium">{examGroups.find((g) => g.id === selectedExamGroup)?.name}</h3>
            <p className="text-sm text-muted-foreground">
              {examGroups.find((g) => g.id === selectedExamGroup)?.description}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {filteredExams.map((exam) => {
            const subject = getSubjectById(exam.subjectId)
            if (!subject) return null

            // If "my schedule" is selected and register number is provided,
            // only show exams where the student has a room allocation
            if (viewType === "my" && searchRegisterNo) {
              const room = getExamRoomForStudent(exam.id, searchRegisterNo)
              if (!room) return null
            }

            return (
              <div
                key={exam.id}
                className="p-4 bg-card rounded-md border cursor-pointer hover:bg-secondary/10"
                onClick={() => handleExamClick(exam)}
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                  <div>
                    <h3 className="font-medium">{subject.subjectName}</h3>
                    <p className="text-sm text-muted-foreground">{subject.subjectCode}</p>
                  </div>

                  <div className="flex flex-col md:items-end">
                    <p className="text-sm">{formatDate(new Date(exam.date))}</p>
                    <p className="text-sm">{formatTime(exam.time)}</p>
                  </div>

                  <Badge variant="exam" className="self-start md:self-auto">
                    {exam.id <= 2
                      ? "CAT 1"
                      : exam.id <= 4
                        ? "CAT 2"
                        : exam.id <= 6
                          ? "CAT 3"
                          : exam.id === 7
                            ? "Practical"
                            : "End-Sem"}
                  </Badge>
                </div>
              </div>
            )
          })}

          {filteredExams.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 bg-card rounded-md border">
              <CalendarIcon className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No exams found for the selected criteria</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs value={view} onValueChange={(v) => setView(v as "calendar" | "list")}>
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        <TabsContent value="calendar" className="mt-4">
          {renderCalendarView()}
        </TabsContent>
        <TabsContent value="list" className="mt-4">
          {renderListView()}
        </TabsContent>
      </Tabs>

      {/* Exam details dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          {selectedExam &&
            (() => {
              const subject = getSubjectById(selectedExam.subjectId)
              const rooms = getExamRoomsByExamId(selectedExam.id)

              if (!subject) return null

              return (
                <>
                  <DialogHeader>
                    <DialogTitle>{subject.subjectName}</DialogTitle>
                    <DialogDescription>
                      {subject.subjectCode} | {formatDate(new Date(selectedExam.date))}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Date</h4>
                        <p>{formatDate(new Date(selectedExam.date))}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Time</h4>
                        <p>{formatTime(selectedExam.time)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Exam Type</h4>
                        <p>
                          {selectedExam.id <= 2
                            ? "CAT 1"
                            : selectedExam.id <= 4
                              ? "CAT 2"
                              : selectedExam.id <= 6
                                ? "CAT 3"
                                : selectedExam.id === 7
                                  ? "Practical"
                                  : "End-Sem"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Duration</h4>
                        <p>{selectedExam.id <= 6 ? "1 hour" : "3 hours"}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Room Allocation</h4>
                      {rooms.length > 0 ? (
                        <div className="space-y-2">
                          {rooms.map((room) => (
                            <div
                              key={room.id}
                              className={cn(
                                "p-3 rounded-md border",
                                searchResults?.room === room.roomName && "bg-primary/20 border-primary",
                              )}
                            >
                              <div className="flex justify-between">
                                <div>
                                  <p className="font-medium">Room {room.roomName}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Register Numbers: {room.registerRange}
                                  </p>
                                </div>
                                {searchResults?.room === room.roomName && <Badge variant="default">Your Room</Badge>}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 bg-secondary rounded-md">
                          <p className="text-sm">Room allocation not available yet.</p>
                        </div>
                      )}
                    </div>

                    {searchResults && !searchResults.room && (
                      <div className="p-3 bg-destructive/20 text-destructive rounded-md">
                        <p className="text-sm font-medium">Not Allotted</p>
                        <p className="text-sm">No room has been allocated for register number {searchRegisterNo}.</p>
                      </div>
                    )}
                  </div>
                </>
              )
            })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
