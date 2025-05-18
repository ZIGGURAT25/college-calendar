"use client"

import { useState, useEffect } from "react"
import { Calendar, Plus, Coffee, Utensils, Info, Edit, Trash2, GripVertical, ChevronRight } from "lucide-react"
import { cn, getDaysOfWeek, getShortDay } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AddClassDialog } from "./add-class-dialog"
import { AddBreakDialog } from "./add-break-dialog"
import { ClassDetailsDialog } from "./class-details-dialog"
import {
  type TimetableEntry,
  getSubjectById,
  getFacultyById,
  getTimetableForDay,
  getColorForSubject,
  config,
  calculatePeriodStartTime,
  calculatePeriodEndTime,
  addTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  moveTimetableEntry,
} from "@/lib/data"

export function TimetableEditor() {
  // State
  const [view, setView] = useState<"day" | "week">("day")
  const [selectedDay, setSelectedDay] = useState<string>("Monday")
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null)
  const [isAddClassOpen, setIsAddClassOpen] = useState(false)
  const [isAddBreakOpen, setIsAddBreakOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [periodTimes, setPeriodTimes] = useState<any[]>([])
  const [draggedEntry, setDraggedEntry] = useState<TimetableEntry | null>(null)
  const [dragOverCell, setDragOverCell] = useState<{ day: string; period: number } | null>(null)
  const [successMessage, setSuccessMessage] = useState("")

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

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  // Handlers
  const handleAddClass = (data: Omit<TimetableEntry, "id">) => {
    const entry = addTimetableEntry(data)
    setSuccessMessage("Class added successfully")
    setIsAddClassOpen(false)
    return entry
  }

  const handleEditClass = (id: number, data: Partial<TimetableEntry>) => {
    const entry = updateTimetableEntry(id, data)
    if (entry) {
      setSuccessMessage("Class updated successfully")
      setIsDetailsOpen(false)
    }
    return entry
  }

  const handleDeleteClass = (id: number) => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      deleteTimetableEntry(id)
      setSuccessMessage("Class deleted successfully")
      setIsDetailsOpen(false)
    }
  }

  const handleDragStart = (entry: TimetableEntry) => {
    setDraggedEntry(entry)
  }

  const handleDragEnd = () => {
    if (draggedEntry && dragOverCell) {
      moveTimetableEntry(draggedEntry.id, dragOverCell.day as TimetableEntry["day"], dragOverCell.period)
      setSuccessMessage("Class moved successfully")
    }
    setDraggedEntry(null)
    setDragOverCell(null)
  }

  const handleDragOver = (day: string, period: number) => {
    setDragOverCell({ day, period })
  }

  // Render day view
  const renderDayView = () => {
    const entries = getTimetableForDay(selectedDay)

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{selectedDay} Schedule</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddBreakOpen(true)}
                >
                  <Coffee className="h-4 w-4 mr-2" />
                  Add Break
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsAddClassOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Class
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
                      "bg-card",
                      dragOverCell?.period === period.period && "ring-2 ring-primary"
                    )}
                    onDragOver={(e) => {
                      e.preventDefault()
                      handleDragOver(selectedDay, period.period)
                    }}
                    onDrop={handleDragEnd}
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
                              "p-3 rounded-md relative group transition-all",
                              getColorForSubject(subject),
                              draggedEntry?.id === entry.id && "opacity-50 border-2 border-dashed",
                              "hover:ring-2 hover:ring-primary/20"
                            )}
                            draggable
                            onDragStart={() => handleDragStart(entry)}
                            onDragEnd={handleDragEnd}
                          >
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab">
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <div className="flex justify-between items-start pl-6">
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
                              <div className="flex gap-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => {
                                          setSelectedEntry(entry)
                                          setIsDetailsOpen(true)
                                        }}
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-destructive hover:text-destructive"
                                        onClick={() => handleDeleteClass(entry.id)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          </div>
                        )
                      })}

                      {periodEntries.length === 0 && (
                        <Button
                          variant="ghost"
                          className="w-full h-24 border-2 border-dashed"
                          onClick={() => {
                            setIsAddClassOpen(true)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Class
                        </Button>
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
                            "p-2 border-b align-top min-w-[200px]",
                            day === selectedDay && "bg-primary/5",
                            dragOverCell?.day === day && 
                            dragOverCell.period === period.period && 
                            "ring-2 ring-primary ring-inset"
                          )}
                          onDragOver={(e) => {
                            e.preventDefault()
                            handleDragOver(day, period.period)
                          }}
                          onDrop={handleDragEnd}
                        >
                          <div className="min-h-[100px] space-y-2">
                            {entries.map((entry) => {
                              const subject = getSubjectById(entry.subjectId)
                              const teacher = getFacultyById(entry.facultyId)

                              if (!subject) return null

                              return (
                                <div
                                  key={entry.id}
                                  className={cn(
                                    "p-2 rounded text-sm relative group transition-all",
                                    getColorForSubject(subject),
                                    draggedEntry?.id === entry.id && 
                                    "opacity-50 border-2 border-dashed",
                                    "hover:ring-2 hover:ring-primary/20"
                                  )}
                                  draggable
                                  onDragStart={() => handleDragStart(entry)}
                                  onDragEnd={handleDragEnd}
                                >
                                  <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab">
                                    <GripVertical className="h-3 w-3" />
                                  </div>
                                  <div className="pl-4">
                                    <div className="font-medium flex items-center">
                                      {entry.isBreak ? (
                                        <>
                                          <Coffee className="h-3 w-3 mr-1" />
                                          Break
                                        </>
                                      ) : entry.isLunch ? (
                                        <>
                                          <Utensils className="h-3 w-3 mr-1" />
                                          Lunch
                                        </>
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
                                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5"
                                      onClick={() => {
                                        setSelectedEntry(entry)
                                        setIsDetailsOpen(true)
                                      }}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5 text-destructive hover:text-destructive"
                                      onClick={() => handleDeleteClass(entry.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              )
                            })}
                            {entries.length === 0 && (
                              <Button
                                variant="ghost"
                                className="w-full h-full border-2 border-dashed"
                                onClick={() => {
                                  setSelectedDay(day)
                                  setIsAddClassOpen(true)
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            )}
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
    )
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timetable Management</h1>
          <p className="text-muted-foreground mt-1">Manage your class schedules, breaks, and faculty assignments</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddBreakOpen(true)}
            className="transition-all hover:bg-amber-100 hover:text-amber-900"
          >
            <Coffee className="h-4 w-4 mr-2" />
            Add Break
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAddClassOpen(true)}
            className="bg-primary hover:bg-primary/90 transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Class
          </Button>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Schedule View</CardTitle>
              <CardDescription>Switch between day and week views</CardDescription>
            </div>
            <Tabs value={view} onValueChange={(v) => setView(v as "day" | "week")} className="w-auto">
              <TabsList className="grid w-[200px] grid-cols-2">
                <TabsTrigger value="day">Day View</TabsTrigger>
                <TabsTrigger value="week">Week View</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {view === "day" ? (
            <div className="space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {daysOfWeek.map((day) => (
                  <Button
                    key={day}
                    variant={selectedDay === day ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      "min-w-[120px] transition-all",
                      selectedDay === day && "shadow-md"
                    )}
                  >
                    {day}
                  </Button>
                ))}
              </div>
              <div className="space-y-4 mt-6">
                {periodTimes.map((period) => {
                  const periodEntries = getTimetableForDay(selectedDay).filter(
                    (entry) => entry.periodNumber === period.period
                  )
                  const isBreak = periodEntries.some((entry) => entry.isBreak)
                  const isLunch = periodEntries.some((entry) => entry.isLunch)

                  return (
                    <div
                      key={period.period}
                      className={cn(
                        "border rounded-lg p-4 transition-all",
                        isBreak ? "bg-amber-50/50 border-amber-200 hover:bg-amber-50" :
                        isLunch ? "bg-green-50/50 border-green-200 hover:bg-green-50" :
                        "bg-card hover:bg-accent/5",
                        dragOverCell?.period === period.period && "ring-2 ring-primary shadow-lg",
                        "group"
                      )}
                      onDragOver={(e) => {
                        e.preventDefault()
                        handleDragOver(selectedDay, period.period)
                      }}
                      onDrop={handleDragEnd}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            Period {period.period}
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground font-normal">
                              {period.start} - {period.end}
                            </span>
                          </h4>
                        </div>
                        <Badge variant="outline" className="bg-background">
                          {period.duration} mins
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        {periodEntries.map((entry) => {
                          const subject = getSubjectById(entry.subjectId)
                          const teacher = getFacultyById(entry.facultyId)

                          if (!subject) return null

                          return (
                            <div
                              key={entry.id}
                              className={cn(
                                "p-4 rounded-md relative group/entry transition-all",
                                getColorForSubject(subject),
                                draggedEntry?.id === entry.id && "opacity-50 border-2 border-dashed scale-95",
                                "hover:ring-2 hover:ring-primary/20 hover:shadow-md"
                              )}
                              draggable
                              onDragStart={() => handleDragStart(entry)}
                              onDragEnd={handleDragEnd}
                            >
                              <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/entry:opacity-100 cursor-grab transition-opacity">
                                <GripVertical className="h-4 w-4" />
                              </div>
                              <div className="flex justify-between items-start pl-6">
                                <div>
                                  <div className="font-medium flex items-center gap-2">
                                    {subject.subjectName}
                                    {entry.isElective && (
                                      <Badge variant="outline" className="bg-background">
                                        Elective
                                      </Badge>
                                    )}
                                  </div>
                                  {teacher && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {teacher.name}
                                    </p>
                                  )}
                                  {entry.room && (
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                      Room: {entry.room}
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-0 group-hover/entry:opacity-100 transition-opacity"
                                    onClick={() => {
                                      setSelectedEntry(entry)
                                      setIsDetailsOpen(true)
                                    }}
                                  >
                                    <Info className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )
                        })}

                        {periodEntries.length === 0 && (
                          <div className="h-20 border border-dashed rounded-md flex items-center justify-center text-muted-foreground text-sm">
                            No classes scheduled
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            renderWeekView()
          )}
        </CardContent>
      </Card>

      {/* Success Message Toast */}
      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg animate-in fade-in slide-in-from-bottom-5">
          {successMessage}
        </div>
      )}

      {/* Dialogs */}
      <AddClassDialog
        open={isAddClassOpen}
        onOpenChange={setIsAddClassOpen}
        onSubmit={handleAddClass}
        selectedDay={selectedDay}
        periodTimes={periodTimes}
      />
      <AddBreakDialog
        open={isAddBreakOpen}
        onOpenChange={setIsAddBreakOpen}
        onSubmit={handleAddClass}
        selectedDay={selectedDay}
        periodTimes={periodTimes}
      />
      {selectedEntry && (
        <ClassDetailsDialog
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          entry={selectedEntry}
          onEdit={handleEditClass}
          onDelete={handleDeleteClass}
        />
      )}
    </div>
  )
} 