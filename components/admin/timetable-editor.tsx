"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Plus, Trash2, Edit, GripVertical, Coffee, Utensils } from "lucide-react"

import { cn, getDaysOfWeek, getShortDay } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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
} from "@/lib/data"

export function TimetableEditor() {
  const [selectedDay, setSelectedDay] = useState<string>("Monday")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isBreakDialogOpen, setIsBreakDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<TimetableEntry | null>(null)
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
  const [draggedEntry, setDraggedEntry] = useState<TimetableEntry | null>(null)
  const [dragOverCell, setDragOverCell] = useState<{ day: string; period: number } | null>(null)
  const [canDrop, setCanDrop] = useState(true)

  const daysOfWeek = getDaysOfWeek()
  const periodTimes = getPeriodTimes()
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleAddEntry = () => {
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

  const handleAddBreak = () => {
    setBreakFormData({
      type: "break",
      periodNumber: "3",
    })
    setIsBreakDialogOpen(true)
  }

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

  const handleDeleteEntry = (entryId: number) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      deleteTimetableEntry(entryId)
      // Force re-render
      setSelectedDay((prev) => prev)
    }
  }

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
    } else {
      addTimetableEntry(entryData)
    }

    setIsDialogOpen(false)
    // Force re-render
    setSelectedDay((prev) => prev)
  }

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
    } else {
      addTimetableEntry(entryData)
    }

    setIsBreakDialogOpen(false)
    setCurrentEntry(null)
    // Force re-render
    setSelectedDay((prev) => prev)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleBreakSelectChange = (name: string, value: string) => {
    setBreakFormData({
      ...breakFormData,
      [name]: value,
    })
  }

  // Drag and drop handlers
  const handleDragStart = (entry: TimetableEntry) => {
    setDraggedEntry(entry)
  }

  const handleDragEnd = () => {
    if (draggedEntry && dragOverCell && canDrop) {
      moveTimetableEntry(draggedEntry.id, dragOverCell.day as TimetableEntry["day"], dragOverCell.period)
      // Force re-render
      setSelectedDay((prev) => prev)
    }

    setDraggedEntry(null)
    setDragOverCell(null)
    setCanDrop(true)

    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
      dragTimeoutRef.current = null
    }
  }

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

  const handleDragLeave = () => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
      dragTimeoutRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current)
      }
    }
  }, [])

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
              {daysOfWeek.slice(1, 6).map((day) => (
                <tr key={day} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="p-2 font-medium border-r cursor-pointer" onClick={() => setSelectedDay(day)}>
                    {day}
                  </td>

                  {periodTimes.map((period) => {
                    const entries = getTimetableForDay(day).filter((entry) => entry.periodNumber === period.period)

                    return (
                      <td
                        key={`${day}-${period.period}`}
                        className="p-2 border-r align-top min-h-[100px] h-[100px]"
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
                            setFormData({
                              ...formData,
                              periodNumber: period.period.toString(),
                            })
                            setIsDialogOpen(true)
                          }
                        }}
                      >
                        <div className="h-full">
                          {entries.length === 0 && day === selectedDay && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute inset-0 w-full h-full opacity-0 hover:opacity-100 flex items-center justify-center"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  periodNumber: period.period.toString(),
                                })
                                setIsDialogOpen(true)
                              }}
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
                                  "p-2 rounded text-xs h-full cursor-pointer relative group draggable-event",
                                  getColorForSubject(subject),
                                  draggedEntry?.id === entry.id && "opacity-50",
                                )}
                                draggable
                                onDragStart={() => handleDragStart(entry)}
                                onDragEnd={handleDragEnd}
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {daysOfWeek.slice(0, 6).map((day) => (
            <Button key={day} variant={day === selectedDay ? "default" : "outline"} onClick={() => setSelectedDay(day)}>
              {getShortDay(day)}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleAddBreak} variant="outline">
            <Coffee className="h-4 w-4 mr-2" />
            Add Break/Lunch
          </Button>
          <Button onClick={handleAddEntry}>
            <Plus className="h-4 w-4 mr-2" />
            Add Class
          </Button>
        </div>
      </div>

      {renderWeekView()}

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
                        Period {period.period}
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
                    .filter((subject) => !["Break", "Lunch"].includes(subject.type))
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
                      Period {period.period}
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
    </div>
  )
}
