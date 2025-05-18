"use client"

import { useState, useEffect, useRef } from "react"
import { CalendarIcon, Clock, ChevronLeft, ChevronRight } from "lucide-react"

import { cn, formatTime, getDaysOfWeek } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  type TimetableEntry,
  getSubjectById,
  getFacultyById,
  getTimetableForDay,
  getColorForSubject,
  getPeriodTimes,
  getCurrentPeriod,
} from "@/lib/data"

type TimetableViewProps = {
  initialView?: "day" | "week"
}

export function TimetableView({ initialView = "week" }: TimetableViewProps) {
  const [view, setView] = useState<"day" | "week">(initialView)
  const [selectedDay, setSelectedDay] = useState<string>("Tuesday") // Default to Tuesday as per requirements
  const [periodTimes, setPeriodTimes] = useState<any[]>([])
  const [currentPeriod, setCurrentPeriod] = useState<number | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const currentPeriodRef = useRef<HTMLDivElement>(null)

  const daysOfWeek = getDaysOfWeek().slice(1, 6) // Tuesday to Saturday as per requirements

  useEffect(() => {
    // Load period times
    setPeriodTimes(getPeriodTimes())

    // Set up interval to check current period
    const intervalId = setInterval(() => {
      const current = getCurrentPeriod(getPeriodTimes())
      setCurrentPeriod(current)
    }, 60000) // Check every minute

    // Initial check
    setCurrentPeriod(getCurrentPeriod(getPeriodTimes()))

    return () => clearInterval(intervalId)
  }, [])

  // Scroll to current period when it changes or view changes
  useEffect(() => {
    if (currentPeriodRef.current && currentPeriod) {
      currentPeriodRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [currentPeriod, view])

  const handleEntryClick = (entry: TimetableEntry) => {
    setSelectedEntry(entry)
    setIsDialogOpen(true)
  }

  const renderDayView = () => {
    const entries = getTimetableForDay(selectedDay)

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{selectedDay}</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const currentIndex = daysOfWeek.indexOf(selectedDay)
                const prevIndex = (currentIndex - 1 + daysOfWeek.length) % daysOfWeek.length
                setSelectedDay(daysOfWeek[prevIndex])
              }}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous Day</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const currentIndex = daysOfWeek.indexOf(selectedDay)
                const nextIndex = (currentIndex + 1) % daysOfWeek.length
                setSelectedDay(daysOfWeek[nextIndex])
              }}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next Day</span>
            </Button>
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-card rounded-lg border">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No classes scheduled for {selectedDay}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {periodTimes.map((period) => {
              const periodEntries = entries.filter((entry) => entry.periodNumber === period.period)
              const isCurrentPeriod = currentPeriod === period.period

              return (
                <div
                  key={period.period}
                  ref={isCurrentPeriod ? currentPeriodRef : null}
                  className={cn(
                    "p-4 bg-card rounded-lg border transition-all",
                    isCurrentPeriod && "ring-2 ring-primary",
                  )}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <h3 className="font-medium">Period {period.period}</h3>
                      {isCurrentPeriod && (
                        <Badge variant="secondary" className="ml-2">
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>
                        {formatTime(period.start)} - {formatTime(period.end)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {periodEntries.map((entry) => {
                      const subject = getSubjectById(entry.subjectId)
                      const teacher = getFacultyById(entry.facultyId)

                      if (!subject) return null

                      return (
                        <div
                          key={entry.id}
                          className={cn("p-3 rounded-md cursor-pointer transition-all", getColorForSubject(subject))}
                          onClick={() => handleEntryClick(entry)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{subject.subjectName}</h4>
                              {!entry.isBreak && !entry.isLunch && (
                                <>
                                  <p className="text-sm opacity-90">
                                    {subject.subjectCode} {teacher && `| ${teacher.name}`}
                                  </p>
                                  <p className="text-sm opacity-90">Room: {entry.room}</p>
                                </>
                              )}
                            </div>
                            <Badge
                              variant={
                                subject.type === "Theory"
                                  ? "theory"
                                  : subject.type === "Lab"
                                    ? "lab"
                                    : subject.type === "Elective"
                                      ? "elective"
                                      : subject.type === "Break"
                                        ? "holiday"
                                        : subject.type === "Lunch"
                                          ? "holiday"
                                          : "default"
                              }
                            >
                              {subject.type}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const renderWeekView = () => {
    return (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse">
            <thead>
              <tr>
                <th className="p-2 bg-secondary text-left font-medium">Period</th>
                {periodTimes.map((period) => (
                  <th key={period.period} className="p-2 bg-secondary text-center font-medium">
                    <div>Period {period.period}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatTime(period.start)} - {formatTime(period.end)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {daysOfWeek.map((day) => {
                const isToday = day === selectedDay
                return (
                  <tr
                    key={day}
                    className={cn("border-b hover:bg-muted/50 transition-colors", isToday && "bg-muted/30")}
                  >
                    <td
                      className={cn("p-2 font-medium border-r cursor-pointer", isToday && "bg-primary/10")}
                      onClick={() => {
                        setSelectedDay(day)
                        setView("day")
                      }}
                    >
                      {day}
                    </td>

                    {periodTimes.map((period) => {
                      const entries = getTimetableForDay(day).filter((entry) => entry.periodNumber === period.period)
                      const isCurrentTimeSlot = day === selectedDay && currentPeriod === period.period

                      return (
                        <td
                          key={`${day}-${period.period}`}
                          ref={isCurrentTimeSlot ? currentPeriodRef : null}
                          className={cn(
                            "p-2 border-r align-top min-h-[100px] h-[100px]",
                            isCurrentTimeSlot && "ring-2 ring-inset ring-primary",
                          )}
                        >
                          <div className="h-full">
                            {entries.length > 0 ? (
                              <div className="space-y-1 h-full">
                                {entries.map((entry) => {
                                  const subject = getSubjectById(entry.subjectId)
                                  if (!subject) return null

                                  return (
                                    <div
                                      key={entry.id}
                                      className={cn(
                                        "p-2 rounded text-xs h-full cursor-pointer",
                                        getColorForSubject(subject),
                                      )}
                                      onClick={() => handleEntryClick(entry)}
                                    >
                                      <div className="font-medium">{subject.subjectName}</div>
                                      {!entry.isBreak && !entry.isLunch && (
                                        <div className="text-xs opacity-90 truncate">Room: {entry.room}</div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                                -
                              </div>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs value={view} onValueChange={(v) => setView(v as "day" | "week")}>
        <TabsList>
          <TabsTrigger value="day">Day View</TabsTrigger>
          <TabsTrigger value="week">Week View</TabsTrigger>
        </TabsList>
        <TabsContent value="day" className="mt-4">
          {renderDayView()}
        </TabsContent>
        <TabsContent value="week" className="mt-4">
          {renderWeekView()}
        </TabsContent>
      </Tabs>

      {/* Class details dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          {selectedEntry &&
            (() => {
              const subject = getSubjectById(selectedEntry.subjectId)
              const teacher = getFacultyById(selectedEntry.facultyId)

              if (!subject) return null

              return (
                <>
                  <DialogHeader>
                    <DialogTitle>{subject.subjectName}</DialogTitle>
                    <DialogDescription>
                      {subject.subjectCode} | {selectedEntry.day}, Period {selectedEntry.periodNumber}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {selectedEntry.isBreak || selectedEntry.isLunch ? (
                      <div className="bg-secondary p-3 rounded-md">
                        <p className="text-sm font-medium">{selectedEntry.isBreak ? "Break Time" : "Lunch Break"}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedEntry.isBreak
                            ? "Short break between classes"
                            : "Lunch break for students and faculty"}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Faculty</h4>
                          <p>{teacher?.name || "N/A"}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Room</h4>
                          <p>{selectedEntry.room}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Type</h4>
                          <Badge
                            variant={
                              subject.type === "Theory"
                                ? "theory"
                                : subject.type === "Lab"
                                  ? "lab"
                                  : subject.type === "Elective"
                                    ? "elective"
                                    : "default"
                            }
                          >
                            {subject.type}
                          </Badge>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Time</h4>
                          <p>
                            {periodTimes.find((p) => p.period === selectedEntry.periodNumber)?.start} -
                            {periodTimes.find((p) => p.period === selectedEntry.periodNumber)?.end}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedEntry.isElective && (
                      <div className="bg-secondary p-3 rounded-md">
                        <p className="text-sm font-medium">Elective Course</p>
                        <p className="text-sm text-muted-foreground">
                          This is an elective course. Students must choose between available electives in this time
                          slot.
                        </p>
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
