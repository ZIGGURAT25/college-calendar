"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { subjects, faculty, type TimetableEntry } from "@/lib/data"
import { Clock, BookOpen, Users, DoorOpen, GraduationCap } from "lucide-react"

interface AddClassDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Omit<TimetableEntry, "id">) => void
  selectedDay: string
  periodTimes: any[]
}

export function AddClassDialog({
  open,
  onOpenChange,
  onSubmit,
  selectedDay,
  periodTimes,
}: AddClassDialogProps) {
  const [formData, setFormData] = useState({
    periodNumber: "1",
    subjectId: "",
    facultyId: "none",
    room: "",
    isElective: false,
    slotsUsed: "1",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      day: selectedDay as TimetableEntry["day"],
      periodNumber: parseInt(formData.periodNumber),
      subjectId: parseInt(formData.subjectId),
      facultyId: formData.facultyId === "none" ? null : parseInt(formData.facultyId),
      room: formData.room,
      isElective: formData.isElective,
      slotsUsed: parseInt(formData.slotsUsed),
      isBreak: false,
      isLunch: false,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Class</DialogTitle>
          <DialogDescription>
            Schedule a new class for {selectedDay}. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="periodNumber" className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Period
              </Label>
              <Select
                value={formData.periodNumber}
                onValueChange={(value) => handleSelectChange("periodNumber", value)}
              >
                <SelectTrigger className="w-full">
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
              <Label htmlFor="slotsUsed" className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Duration
              </Label>
              <Select
                value={formData.slotsUsed}
                onValueChange={(value) => handleSelectChange("slotsUsed", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Period</SelectItem>
                  <SelectItem value="2">2 Periods</SelectItem>
                  <SelectItem value="3">3 Periods</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subjectId" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              Subject
            </Label>
            <Select
              value={formData.subjectId}
              onValueChange={(value) => handleSelectChange("subjectId", value)}
            >
              <SelectTrigger className="w-full">
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
            <Label htmlFor="facultyId" className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Faculty
            </Label>
            <Select
              value={formData.facultyId}
              onValueChange={(value) => handleSelectChange("facultyId", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Faculty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Faculty (Optional)</SelectItem>
                {faculty.map((f) => (
                  <SelectItem key={f.id} value={f.id.toString()}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="room" className="flex items-center gap-2">
              <DoorOpen className="h-4 w-4 text-muted-foreground" />
              Room
            </Label>
            <Input
              id="room"
              name="room"
              value={formData.room}
              onChange={handleInputChange}
              placeholder="Enter room number or name"
              className="w-full"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isElective"
              checked={formData.isElective}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isElective: checked === true }))
              }
            />
            <Label htmlFor="isElective" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              This is an elective course
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Class</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 