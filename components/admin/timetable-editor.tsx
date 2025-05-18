"use client"

import { useState, useEffect, useRef } from "react"
import { Calendar, Plus, Trash2, Edit, GripVertical, Coffee, Utensils, Info, Check, X } from "lucide-react"

import { cn, getDaysOfWeek, getShortDay } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  type TimetableEntry,
  getSubjectById,
  getFacultyById,
  getTimetableForDay,
  getColorForSubject,
  subjects,
  faculty,
  getPeriodTimes,
  addTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  moveTimetableEntry,
  config,
  calculatePeriodStartTime,
  calculatePeriodEndTime,
} from "@/lib/data"

export function TimetableEditor() {
  // State management
  const [view, setView] = useState<"day" | "week">("day")
  const [selectedDay, setSelectedDay] = useState<string>("Monday")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isBreakDialogOpen, setIsBreakDialogOpen] = useState(false)
  const [isClassInfoOpen, setIsClassInfoOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<TimetableEntry | null>(null)
  const [periodTimes, setPeriodTimes] = useState<any[]>([])
  const [draggedEntry, setDraggedEntry] = useState<TimetableEntry | null>(null)
  const [dragOverCell, setDragOverCell] = useState<{ day: string; period: number } | null>(null)
  const [canDrop, setCanDrop] = useState(true)
  const [successMessage, setSuccessMessage] = useState("")
  
  // Form data for class and break entries
  const [formData, setFormData] = useState({
    periodNumber: "1",
    subjectId: "",
    facultyId: "",
    room: "",
    isElective: false,
    slotsUsed: "1",
  })
  
  const [breakFormData, setBreakFormData] = useState({
    type: "break", // "break" or "lunch"
    periodNumber: "3",
  })

  // References
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Constants
  const daysOfWeek = getDaysOfWeek()

  // Load period times on component mount and when selected day changes
  useEffect(() => {
    const times = getPeriodTimes()
    setPeriodTimes(times)
  }, [selectedDay])

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current)
      }
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current)
      }
    }
  }, [])

  // Clear success message after display
  useEffect(() => {
    if (successMessage) {
      successTimeoutRef.current = setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    }
  }, [successMessage])

  // Show success message method
  const showSuccess = (message: string) => {
    setSuccessMessage(message)
  }

  // HANDLERS FOR CLASS ENTRIES
  
  // Initialize Add Class dialog
  const handleAddEntry = (day?: string, periodNumber?: number) => {
    setIsEditMode(false)
    setFormData({
      periodNumber: periodNumber?.toString() || "1",
      subjectId: "",
      facultyId: "",
      room: "",
      isElective: false,
      slotsUsed: "1",
    })
    setSelectedDay(day || selectedDay)
    setIsDialogOpen(true)
  }
  
  // Initialize Edit Class dialog
  const handleEditEntry = (entry: TimetableEntry) => {
    if (entry.isBreak || entry.isLunch) {
      setBreakFormData({
        type: entry.isBreak ? "break" : "lunch",
        periodNumber: entry.periodNumber.toString(),
      })
      setCurrentEntry(entry)
      setIsBreakDialogOpen(true)
      return
    }

    setIsEditMode(true)
    setCurrentEntry(entry)
    setSelectedDay(entry.day)
    setFormData({
      periodNumber: entry.periodNumber.toString(),
      subjectId: entry.subjectId.toString(),
      facultyId: entry.facultyId?.toString() || "",
      room: entry.room,
      isElective: entry.isElective,
      slotsUsed: entry.slotsUsed.toString(),
    })
    setIsDialogOpen(true)
  }
  
  // Open class info dialog
  const handleViewClass = (entry: TimetableEntry) => {
    setCurrentEntry(entry)
    setIsClassInfoOpen(true)
  }
  
  // Delete a class entry
  const handleDeleteEntry = (entryId: number) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      deleteTimetableEntry(entryId)
      showSuccess("Class deleted successfully")
      // Force re-render
      setPeriodTimes([...periodTimes])
    }
  }
  
  // Form submission for adding/editing a class
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const entryData = {
      day: selectedDay as TimetableEntry["day"],
      periodNumber: Number.parseInt(formData.periodNumber),
      subjectId: Number.parseInt(formData.subjectId),
      facultyId: formData.facultyId ? Number.parseInt(formData.facultyId) : null,
      room: formData.room,
      isElective: formData.isElective,
      slotsUsed: Number.parseInt(formData.slotsUsed),
    }

    if (isEditMode && currentEntry) {
      updateTimetableEntry(currentEntry.id, entryData)
      showSuccess("Class updated successfully")
    } else {
      addTimetableEntry(entryData)
      showSuccess("Class added successfully")
    }

    setIsDialogOpen(false)
    // Force re-render
    setPeriodTimes([...periodTimes])
  }
  
  // Form field change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }
  
  // Select dropdown change handler
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }
  
  // HANDLERS FOR BREAK/LUNCH ENTRIES
  
  // Initialize Add Break dialog
  const handleAddBreak = (day?: string, periodNumber?: number) => {
    setBreakFormData({
      type: "break",
      periodNumber: periodNumber?.toString() || "3",
    })
    setCurrentEntry(null)
    setSelectedDay(day || selectedDay)
    setIsBreakDialogOpen(true)
  }
  
  // Form submission for adding/editing a break
  const handleBreakFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const isBreakType = breakFormData.type === "break"
    const subjectId = isBreakType ? 9 : 10 // 9 for break, 10 for lunch

    const entryData = {
      day: selectedDay as TimetableEntry["day"],
      periodNumber: Number.parseInt(breakFormData.periodNumber),
      subjectId,
      facultyId: null,
      room: isBreakType ? "All" : "Cafeteria",
      isElective: false,
      slotsUsed: 1,
      isBreak: isBreakType,
      isLunch: !isBreakType,
    }

    if (currentEntry) {
      updateTimetableEntry(currentEntry.id, entryData)
      showSuccess(`${isBreakType ? "Break" : "Lunch"} updated successfully`)
    } else {
      addTimetableEntry(entryData)
      showSuccess(`${isBreakType ? "Break" : "Lunch"} added successfully`)
    }

    setIsBreakDialogOpen(false)
    setCurrentEntry(null)
    // Force re-render
    setPeriodTimes([...periodTimes])
  }
  
  // Break form field change handler
  const handleBreakSelectChange = (name: string, value: string) => {
    setBreakFormData({
      ...breakFormData,
      [name]: value,
    })
  }
  
  // DRAG AND DROP HANDLERS
  
  // Start drag operation
  const handleDragStart = (entry: TimetableEntry) => {
    setDraggedEntry(entry)
  }
  
  // Complete drag operation
  const handleDragEnd = () => {
    if (draggedEntry && dragOverCell && canDrop) {
      moveTimetableEntry(draggedEntry.id, dragOverCell.day as TimetableEntry["day"], dragOverCell.period)
      showSuccess("Class moved successfully")
      // Force re-render
      setPeriodTimes([...periodTimes])
    }

    setDraggedEntry(null)
    setDragOverCell(null)
    setCanDrop(true)

    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
      dragTimeoutRef.current = null
    }
  }
  
  // Handle drag over a potential drop target
  const handleDragOver = (day: string, period: number) => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
    }

    dragTimeoutRef.current = setTimeout(() => {
      setDragOverCell({ day, period })

      // Check if we can drop here
      if (draggedEntry) {
        // Check if there's already an entry in this cell
        const existingEntries = getTimetableForDay(day).filter((entry) => entry.periodNumber === period)
        const hasConflict = existingEntries.some((entry) => entry.id !== draggedEntry.id)
        setCanDrop(!hasConflict)
      }
    }, 100)
  }
  
  // Handle drag leaving a potential drop target
  const handleDragLeave = () => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
      dragTimeoutRef.current = null
    }
  }

  // Initialize Add Class dialog - with event parameter for button click
  const handleAddEntryWithEvent = (e: React.MouseEvent) => {
    setIsEditMode(false)
    setFormData({
      periodNumber: "1",
      subjectId: "",
      facultyId: "",
      room: "",
      isElective: false,
      slotsUsed: "1",
    })
    setIsDialogOpen(true)
  }
  
  // Initialize Add Break dialog - with event parameter for button click
  const handleAddBreakWithEvent = (e: React.MouseEvent) => {
    setBreakFormData({
      type: "break",
      periodNumber: "3",
    })
    setCurrentEntry(null)
    setIsBreakDialogOpen(true)
  }

  // Render timetable in week view
  const renderWeekView = () => {
    return (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse">
            <thead>
              <tr>
                <th className="p-2 bg-secondary text-left font-medium">Day</th>
                {periodTimes.map((period) => (
                  <th key={period.period} className="p-2 bg-secondary text-center font-medium">
                    <div>Period {period.period}</div>
                    <div className="text-xs text-muted-foreground">
                      {period.start} - {period.end}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {daysOfWeek.slice(0, 6).map((day) => (
                <tr key={day} className={cn("border-b hover:bg-muted/50 transition-colors", day === selectedDay && "bg-muted/30")}>
                  <td 
                    className={cn(
                      "p-2 font-medium border-r cursor-pointer", 
                      day === selectedDay && "bg-primary/10"
                    )} 
                    onClick={() => {
                      setSelectedDay(day)
                      setView("day")
                    }}
                  >
                    {day}
                  </td>

                  {periodTimes.map((period) => {
                    const entries = getTimetableForDay(day).filter((entry) => entry.periodNumber === period.period)
                    const isHighlighted = day === selectedDay;

                    return (
                      <td
                        key={`${day}-${period.period}`}
                        className={cn(
                          "p-2 border-r align-top min-h-[100px] h-[100px] relative",
                          isHighlighted && "bg-muted/10",
                          dragOverCell?.day === day && dragOverCell.period === period.period && 
                            "ring-2 ring-primary ring-inset"
                        )}
                        onDragOver={(e) => {
                          e.preventDefault()
                          handleDragOver(day, period.period)
                        }}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => {
                          e.preventDefault()
                          handleDragEnd()
                        }}
                        onClick={() => {
                          if (entries.length === 0 && day === selectedDay) {
                            handleAddEntry(day, period.period)
                          }
                        }}
                      >
                        <div className="h-full">
                          {entries.length === 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "absolute inset-0 w-full h-full opacity-0 hover:opacity-100 flex items-center justify-center",
                                day !== selectedDay && "pointer-events-none"
                              )}
                              onClick={() => handleAddEntry(day, period.period)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          )}

                          {entries.map((entry) => {
                            const subject = getSubjectById(entry.subjectId)
                            const teacher = getFacultyById(entry.facultyId)

                            if (!subject) return null

                            return (
                              <div
                                key={entry.id}
                                className={cn(
                                  "p-2 rounded text-xs h-full cursor-pointer relative group",
                                  getColorForSubject(subject),
                                  draggedEntry?.id === entry.id && "opacity-50 border-2 border-dashed border-primary",
                                  "hover:ring-1 hover:ring-primary/20 transition-all"
                                )}
                                draggable
                                onDragStart={() => handleDragStart(entry)}
                                onDragEnd={handleDragEnd}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewClass(entry);
                                }}
                              >
                                <div className="absolute top-0.5 left-0.5 opacity-50 cursor-grab">
                                  <GripVertical className="h-3 w-3" />
                                </div>
                                <div className="font-medium pl-4">
                                  {entry.isBreak ? (
                                    <Coffee className="h-3 w-3 inline-block mr-1" />
                                  ) : entry.isLunch ? (
                                    <Utensils className="h-3 w-3 inline-block mr-1" />
                                  ) : null}
                                  {subject.subjectName}
                                </div>
                                {!entry.isBreak && !entry.isLunch && (
                                  <div className="text-xs opacity-90">{entry.room}</div>
                                )}

                                <div className="absolute top-0.5 right-0.5 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    className="p-0.5 rounded-sm bg-background/80 hover:bg-background text-foreground"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleEditEntry(entry)
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                    <span className="sr-only">Edit</span>
                                  </button>
                                  <button
                                    className="p-0.5 rounded-sm bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteEntry(entry.id)
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    <span className="sr-only">Delete</span>
                                  </button>
                                </div>
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
      </div>
    )
  }

  // Render timetable in day view (single day view)
  const renderDayView = () => {
    const daySchedule = config.daySchedules[selectedDay]
    const entries = getTimetableForDay(selectedDay)
    
    return (
      <div className="space-y-4">
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-2">{selectedDay} Schedule</h3>
          <p className="text-sm text-muted-foreground mb-4">
            First period starts at {daySchedule.firstPeriodStartTime}
          </p>
          
          <div className="grid gap-2">
            {periodTimes.map((period) => {
              const periodEntries = entries.filter((entry) => entry.periodNumber === period.period)
              const isBreak = periodEntries.some((entry) => entry.isBreak)
              const isLunch = periodEntries.some((entry) => entry.isLunch)
              
              return (
                <div 
                  key={period.period}
                  className={cn(
                    "border rounded-md p-3 relative",
                    isBreak ? "bg-amber-50 border-amber-200" : 
                    isLunch ? "bg-green-50 border-green-200" : 
                    "bg-card border-border",
                    dragOverCell?.day === selectedDay && dragOverCell.period === period.period && 
                      "ring-2 ring-primary ring-offset-1"
                  )}
                  onDragOver={(e) => {
                    e.preventDefault()
                    handleDragOver(selectedDay, period.period)
                  }}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => {
                    e.preventDefault()
                    handleDragEnd()
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">Period {period.period}</h4>
                      <p className="text-sm text-muted-foreground">
                        {period.start} - {period.end}
                      </p>
                    </div>
                    
                    <div className="flex gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleAddBreak(selectedDay, period.period)}
                            >
                              <Coffee className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Add Break/Lunch</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleAddEntry(selectedDay, period.period)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Add Class</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  
                  {periodEntries.length > 0 ? (
                    <div className="space-y-2">
                      {periodEntries.map((entry) => {
                        const subject = getSubjectById(entry.subjectId)
                        const teacher = getFacultyById(entry.facultyId)
                        
                        if (!subject) return null
                        
                        return (
                          <div
                            key={entry.id}
                            className={cn(
                              "p-3 rounded text-sm relative group",
                              getColorForSubject(subject),
                              draggedEntry?.id === entry.id && "opacity-50 border-2 border-dashed border-primary",
                              "hover:ring-2 hover:ring-primary/20 transition-all"
                            )}
                            draggable
                            onDragStart={() => handleDragStart(entry)}
                            onDragEnd={handleDragEnd}
                          >
                            <div className="flex justify-between">
                              <div>
                                <div className="font-medium">
                                  {entry.isBreak ? (
                                    <div className="flex items-center">
                                      <Coffee className="h-3 w-3 inline-block mr-1" />
                                      Break
                                    </div>
                                  ) : entry.isLunch ? (
                                    <div className="flex items-center">
                                      <Utensils className="h-3 w-3 inline-block mr-1" />
                                      Lunch
                                    </div>
                                  ) : (
                                    <div className="flex items-center">
                                      {subject.subjectCode} - {subject.subjectName}
                                      {entry.isElective && (
                                        <Badge variant="outline" className="ml-2 text-xs">Elective</Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                                
                                {!entry.isBreak && !entry.isLunch && (
                                  <>
                                    <div className="text-xs mt-1">
                                      {teacher ? teacher.name : "No faculty assigned"}
                                    </div>
                                    <div className="text-xs">Room: {entry.room}</div>
                                    {entry.slotsUsed > 1 && (
                                      <div className="text-xs">Duration: {entry.slotsUsed} periods</div>
                                    )}
                                  </>
                                )}
                              </div>
                              
                              <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEditEntry(entry)
                                  }}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteEntry(entry.id)
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="py-6 flex items-center justify-center border-2 border-dashed rounded-md border-muted-foreground/20">
                      <p className="text-sm text-muted-foreground">No classes scheduled</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success message */}
      {successMessage && (
        <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 text-green-700 rounded-md">
          <Check className="h-4 w-4" />
          <p className="text-sm">{successMessage}</p>
        </div>
      )}
      
      {/* Main controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          {/* View selector */}
          <Tabs 
            value={view} 
            onValueChange={(v) => setView(v as "day" | "week")}
            className="w-[200px]"
          >
            <TabsList className="w-full">
              <TabsTrigger value="day" className="flex-1">Day View</TabsTrigger>
              <TabsTrigger value="week" className="flex-1">Week View</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Day selector */}
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.slice(0, 6).map((day) => (
              <Button key={day} variant={day === selectedDay ? "default" : "outline"} onClick={() => setSelectedDay(day)}>
                {getShortDay(day)}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleAddBreakWithEvent} variant="outline">
            <Coffee className="h-4 w-4 mr-2" />
            Add Break/Lunch
          </Button>
          <Button onClick={handleAddEntryWithEvent}>
            <Plus className="h-4 w-4 mr-2" />
            Add Class
          </Button>
        </div>
      </div>

      {/* View content */}
      {view === "day" ? renderDayView() : renderWeekView()}

      {/* Add/Edit Class Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Class" : "Add New Class"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="periodNumber" className="text-sm font-medium">
                  Period
                </label>
                <Select
                  value={formData.periodNumber}
                  onValueChange={(value) => handleSelectChange("periodNumber", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Period" />
                  </SelectTrigger>
                  <SelectContent>
                    {periodTimes.map((period) => (
                      <SelectItem key={period.period} value={period.period.toString()}>
                        Period {period.period} ({period.start} - {period.end})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="slotsUsed" className="text-sm font-medium">
                  Slots Used
                </label>
                <Select value={formData.slotsUsed} onValueChange={(value) => handleSelectChange("slotsUsed", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Slots" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Slot</SelectItem>
                    <SelectItem value="2">2 Slots</SelectItem>
                    <SelectItem value="3">3 Slots</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="subjectId" className="text-sm font-medium">
                Subject
              </label>
              <Select value={formData.subjectId} onValueChange={(value) => handleSelectChange("subjectId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects
                    .filter((subject) => !["Break", "Lunch"].includes(subject.subjectName))
                    .map((subject) => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.subjectCode} - {subject.subjectName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="facultyId" className="text-sm font-medium">
                Faculty
              </label>
              <Select value={formData.facultyId} onValueChange={(value) => handleSelectChange("facultyId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Faculty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Faculty (Optional)</SelectItem>
                  {faculty.map((f) => (
                    <SelectItem key={f.id} value={f.id.toString()}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="room" className="text-sm font-medium">
                Room
              </label>
              <Input
                id="room"
                name="room"
                value={formData.room}
                onChange={handleInputChange}
                placeholder="Enter room number"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isElective"
                checked={formData.isElective}
                onCheckedChange={(checked) => {
                  setFormData({
                    ...formData,
                    isElective: checked === true,
                  })
                }}
              />
              <label htmlFor="isElective" className="text-sm font-medium">
                This is an elective course
              </label>
            </div>

            <DialogFooter>
              <Button type="submit">{isEditMode ? "Update" : "Add"} Class</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Break Dialog */}
      <Dialog open={isBreakDialogOpen} onOpenChange={setIsBreakDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentEntry ? "Edit Break" : "Add Break or Lunch"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBreakFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="breakType" className="text-sm font-medium">
                Type
              </label>
              <Select value={breakFormData.type} onValueChange={(value) => handleBreakSelectChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="break">Break</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="periodNumber" className="text-sm font-medium">
                Period
              </label>
              <Select
                value={breakFormData.periodNumber}
                onValueChange={(value) => handleBreakSelectChange("periodNumber", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Period" />
                </SelectTrigger>
                <SelectContent>
                  {periodTimes.map((period) => (
                    <SelectItem key={period.period} value={period.period.toString()}>
                      Period {period.period} ({period.start} - {period.end})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="submit">
                {currentEntry ? "Update" : "Add"} {breakFormData.type === "break" ? "Break" : "Lunch"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Class Info Dialog */}
      <Dialog open={isClassInfoOpen} onOpenChange={setIsClassInfoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Class Information</DialogTitle>
          </DialogHeader>
          {currentEntry && (
            <div className="space-y-4">
              {(() => {
                const subject = getSubjectById(currentEntry.subjectId)
                const teacher = getFacultyById(currentEntry.facultyId)
                
                if (!subject) return <p>Subject not found</p>
                
                const periodTime = periodTimes.find(p => p.period === currentEntry.periodNumber);
                
                if (currentEntry.isBreak || currentEntry.isLunch) {
                  return (
                    <div className="space-y-4">
                      <div className="p-4 rounded-md bg-muted">
                        <h3 className="text-lg font-medium flex items-center">
                          {currentEntry.isBreak ? (
                            <>
                              <Coffee className="h-4 w-4 mr-2" />
                              Break Time
                            </>
                          ) : (
                            <>
                              <Utensils className="h-4 w-4 mr-2" />
                              Lunch Time
                            </>
                          )}
                        </h3>
                        <p className="text-sm mt-2">On {currentEntry.day}, Period {currentEntry.periodNumber}</p>
                        <p className="text-sm mt-1">Time: {periodTime?.start} - {periodTime?.end}</p>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsClassInfoOpen(false)}>Close</Button>
                        <Button onClick={() => {
                          setIsClassInfoOpen(false)
                          handleEditEntry(currentEntry)
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  )
                }
                
                return (
                  <div className="space-y-4">
                    <div className="p-4 rounded-md bg-muted">
                      <h3 className="text-lg font-medium">{subject.subjectName}</h3>
                      <p className="text-sm text-muted-foreground">{subject.subjectCode}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Faculty</h4>
                        <p>{teacher?.name || "No faculty assigned"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Room</h4>
                        <p>{currentEntry.room}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Type</h4>
                        <Badge
                          variant="outline"
                          className={cn(
                            subject.type === "Theory" && "bg-blue-50 text-blue-700 border-blue-200",
                            subject.type === "Lab" && "bg-cyan-50 text-cyan-700 border-cyan-200",
                            subject.type === "Elective" && "bg-purple-50 text-purple-700 border-purple-200"
                          )}
                        >
                          {subject.type}
                        </Badge>
                        {currentEntry.isElective && (
                          <Badge variant="outline" className="ml-2">Elective</Badge>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Time</h4>
                        <p>Period {currentEntry.periodNumber} ({periodTime?.start} - {periodTime?.end})</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Day</h4>
                        <p>{currentEntry.day}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Duration</h4>
                        <p>{currentEntry.slotsUsed} period{currentEntry.slotsUsed > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsClassInfoOpen(false)}>Close</Button>
                      <Button onClick={() => {
                        setIsClassInfoOpen(false)
                        handleEditEntry(currentEntry)
                      }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
