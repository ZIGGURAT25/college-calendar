"use client"

import { useState, useEffect } from "react"
import { Calendar, Coffee, Utensils, Info } from "lucide-react"
import { cn, getDaysOfWeek, getShortDay } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  type TimetableEntry,
  getSubjectById,
  getFacultyById,
  getTimetableForDay,
  getColorForSubject,
  config,
  calculatePeriodStartTime,
  calculatePeriodEndTime,
} from "@/lib/data"

interface TimetableViewProps {
  initialView?: "day" | "week"
  isStudent?: boolean
}

export function TimetableView({ initialView = "day", isStudent = true }: TimetableViewProps) {
  // State
  const [view, setView] = useState<"day" | "week">(initialView)
  const [selectedDay, setSelectedDay] = useState<string>("Monday")
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null)
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false)
  const [periodTimes, setPeriodTimes] = useState<any[]>([])

  // Constants
  const daysOfWeek = getDaysOfWeek().slice(0, 6) // Exclude Sunday
  const daySchedule = config.daySchedules[selectedDay]

  // Effects
  useEffect(() => {
    const times = daySchedule?.periods.map((period, index) => {
      const periodNumber = index + 1
      return {
        period: periodNumber,
        start: calculatePeriodStartTime(daySchedule, periodNumber),
        end: calculatePeriodEndTime(daySchedule, periodNumber),
        duration: period.duration,
      }
    }) || []
    setPeriodTimes(times)
  }, [selectedDay, daySchedule])

  // Handlers
  const handleEntryClick = (entry: TimetableEntry) => {
    setSelectedEntry(entry)
    setIsEntryDialogOpen(true)
  }

  // Render day view
  const renderDayView = () => {
    const entries = getTimetableForDay(selectedDay)

    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">{selectedDay} Schedule</h3>
              <p className="text-sm text-muted-foreground">
                First period starts at {daySchedule?.firstPeriodStartTime}
              </p>
        </div>

            <div className="mt-6 space-y-4">
            {periodTimes.map((period) => {
                const periodEntries = entries.filter(
                  (entry) => entry.periodNumber === period.period
                )
                const isBreak = periodEntries.some((entry) => entry.isBreak)
                const isLunch = periodEntries.some((entry) => entry.isLunch)

              return (
                <div
                  key={period.period}
                  className={cn(
                      "border rounded-lg p-4",
                      isBreak ? "bg-amber-50 border-amber-200" :
                      isLunch ? "bg-green-50 border-green-200" :
                      "bg-card"
                  )}
                >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">Period {period.period}</h4>
                        <p className="text-sm text-muted-foreground">
                          {period.start} - {period.end}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {period.duration} mins
                        </Badge>
                  </div>

                  <div className="space-y-2">
                    {periodEntries.map((entry) => {
                      const subject = getSubjectById(entry.subjectId)
                      const teacher = getFacultyById(entry.facultyId)

                      if (!subject) return null

                      return (
                        <div
                          key={entry.id}
                            className={cn(
                              "p-3 rounded-md cursor-pointer transition-all",
                              getColorForSubject(subject),
                              "hover:ring-2 hover:ring-primary/20"
                            )}
                          onClick={() => handleEntryClick(entry)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                                <div className="font-medium flex items-center">
                                  {entry.isBreak ? (
                                    <>
                                      <Coffee className="h-4 w-4 mr-1" />
                                      Break Time
                                    </>
                                  ) : entry.isLunch ? (
                                    <>
                                      <Utensils className="h-4 w-4 mr-1" />
                                      Lunch Break
                                    </>
                                  ) : (
                                    <>
                                      {subject.subjectName}
                                      {entry.isElective && (
                                        <Badge variant="outline" className="ml-2">
                                          Elective
                                        </Badge>
                                      )}
                                    </>
                                  )}
                                </div>
                              {!entry.isBreak && !entry.isLunch && (
                                <>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {subject.subjectCode}
                                  </p>
                                    <div className="text-sm mt-2">
                                      <p>{teacher?.name || "No faculty assigned"}</p>
                                      <p>Room: {entry.room}</p>
                                    </div>
                                </>
                              )}
                              </div>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleEntryClick(entry)
                                      }}
                                    >
                                      <Info className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>View Details</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        )
                      })}

                      {periodEntries.length === 0 && (
                        <div className="py-8 flex items-center justify-center border-2 border-dashed rounded-md">
                          <p className="text-sm text-muted-foreground">
                            No classes scheduled
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              )
            })}
          </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render week view
  const renderWeekView = () => {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
        <div className="overflow-x-auto">
              <table className="w-full border-collapse">
            <thead>
              <tr>
                    <th className="p-2 text-left font-medium border-b">Time</th>
                    {daysOfWeek.map((day) => (
                      <th
                        key={day}
                        className={cn(
                          "p-2 text-center font-medium border-b",
                          day === selectedDay && "bg-primary/5"
                        )}
                      >
                        {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
                  {periodTimes.map((period) => (
                    <tr key={period.period}>
                      <td className="p-2 border-b">
                        <div className="font-medium">Period {period.period}</div>
                        <div className="text-sm text-muted-foreground">
                          {period.start} - {period.end}
                        </div>
                      </td>
              {daysOfWeek.map((day) => {
                        const entries = getTimetableForDay(day).filter(
                          (entry) => entry.periodNumber === period.period
                        )

                      return (
                        <td
                          key={`${day}-${period.period}`}
                          className={cn(
                              "p-2 border-b align-top",
                              day === selectedDay && "bg-primary/5"
                          )}
                        >
                            <div className="min-h-[100px]">
                                {entries.map((entry) => {
                                  const subject = getSubjectById(entry.subjectId)
                                const teacher = getFacultyById(entry.facultyId)

                                  if (!subject) return null

                                  return (
                                    <div
                                      key={entry.id}
                                      className={cn(
                                      "p-2 rounded text-sm cursor-pointer mb-2",
                                        getColorForSubject(subject),
                                      "hover:ring-2 hover:ring-primary/20 transition-all"
                                      )}
                                      onClick={() => handleEntryClick(entry)}
                                    >
                                    <div className="font-medium">
                                      {entry.isBreak ? (
                                        <div className="flex items-center">
                                          <Coffee className="h-3 w-3 mr-1" />
                                          Break
                                        </div>
                                      ) : entry.isLunch ? (
                                        <div className="flex items-center">
                                          <Utensils className="h-3 w-3 mr-1" />
                                          Lunch
                                        </div>
                                      ) : (
                                        <>
                                          {subject.subjectName}
                                          {entry.isElective && (
                                            <Badge
                                              variant="outline"
                                              className="ml-1 text-xs"
                                            >
                                              E
                                            </Badge>
                                          )}
                                        </>
                                      )}
                                    </div>
                                      {!entry.isBreak && !entry.isLunch && (
                                      <div className="text-xs mt-1">
                                        <p>{entry.room}</p>
                                        <p className="text-muted-foreground">
                                          {teacher?.name}
                                        </p>
                                      </div>
                                      )}
                                    </div>
                                  )
                                })}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                  ))}
            </tbody>
          </table>
        </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* View controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <Tabs value={view} onValueChange={(v) => setView(v as "day" | "week")}>
        <TabsList>
          <TabsTrigger value="day">Day View</TabsTrigger>
          <TabsTrigger value="week">Week View</TabsTrigger>
        </TabsList>
      </Tabs>

        <div className="flex flex-wrap gap-2">
          {daysOfWeek.map((day) => (
            <Button
              key={day}
              variant={day === selectedDay ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDay(day)}
            >
              {getShortDay(day)}
            </Button>
          ))}
        </div>
      </div>

      {/* View content */}
      {view === "day" ? renderDayView() : renderWeekView()}

      {/* Entry details dialog */}
      <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
        <DialogContent>
          {selectedEntry && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {(() => {
                    const subject = getSubjectById(selectedEntry.subjectId)
                    if (!subject) return "Class Details"

                    if (selectedEntry.isBreak) return "Break Time"
                    if (selectedEntry.isLunch) return "Lunch Break"
                    return subject.subjectName
                  })()}
                </DialogTitle>
              </DialogHeader>

              <div className="py-4">
                {(() => {
              const subject = getSubjectById(selectedEntry.subjectId)
              const teacher = getFacultyById(selectedEntry.facultyId)
              if (!subject) return null

                  if (selectedEntry.isBreak || selectedEntry.isLunch) {
              return (
                      <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <h3 className="font-medium flex items-center">
                            {selectedEntry.isBreak ? (
                              <>
                                <Coffee className="h-4 w-4 mr-2" />
                                Break Time
                              </>
                            ) : (
                              <>
                                <Utensils className="h-4 w-4 mr-2" />
                                Lunch Break
                              </>
                            )}
                          </h3>
                          <p className="text-sm mt-2">
                            Period {selectedEntry.periodNumber} on {selectedEntry.day}
                        </p>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Subject Code
                          </h4>
                          <p>{subject.subjectCode}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Type
                          </h4>
                          <Badge variant="outline">{subject.type}</Badge>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Faculty
                          </h4>
                          <p>{teacher?.name || "Not assigned"}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Room
                          </h4>
                          <p>{selectedEntry.room}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Day & Period
                          </h4>
                          <p>
                            {selectedEntry.day}, Period {selectedEntry.periodNumber}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Duration
                          </h4>
                          <p>{selectedEntry.slotsUsed} period(s)</p>
                      </div>
                      </div>
                  </div>
              )
            })()}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
