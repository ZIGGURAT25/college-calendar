"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { subjects, faculty, type TimetableEntry, getSubjectById, getFacultyById } from "@/lib/data"

interface ClassDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: TimetableEntry | null
  onEdit: (id: number, data: Partial<TimetableEntry>) => void
  onDelete: (id: number) => void
}

export function ClassDetailsDialog({
  open,
  onOpenChange,
  entry,
  onEdit,
  onDelete,
}: ClassDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    subjectId: "",
    facultyId: "",
    room: "",
    isElective: false,
  })

  useEffect(() => {
    if (entry) {
      setFormData({
        subjectId: entry.subjectId.toString(),
        facultyId: entry.facultyId?.toString() || "",
        room: entry.room,
        isElective: entry.isElective,
      })
    }
  }, [entry])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!entry) return

    onEdit(entry.id, {
      subjectId: parseInt(formData.subjectId),
      facultyId: formData.facultyId ? parseInt(formData.facultyId) : null,
      room: formData.room,
      isElective: formData.isElective,
    })
    setIsEditing(false)
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

  if (!entry) return null

  const subject = getSubjectById(entry.subjectId)
  const teacher = getFacultyById(entry.facultyId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Class" : subject?.subjectName || "Class Details"}
          </DialogTitle>
        </DialogHeader>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subjectId">Subject</Label>
              <Select
                value={formData.subjectId}
                onValueChange={(value) => handleSelectChange("subjectId", value)}
              >
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
              <Label htmlFor="facultyId">Faculty</Label>
              <Select
                value={formData.facultyId}
                onValueChange={(value) => handleSelectChange("facultyId", value)}
              >
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
              <Label htmlFor="room">Room</Label>
              <Input
                id="room"
                name="room"
                value={formData.room}
                onChange={handleInputChange}
                placeholder="Enter room number or name"
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
              <Label htmlFor="isElective">This is an elective course</Label>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Subject Code</Label>
                  <p className="font-medium">{subject?.subjectCode}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p className="font-medium">{subject?.type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Faculty</Label>
                  <p className="font-medium">{teacher?.name || "Not assigned"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Room</Label>
                  <p className="font-medium">{entry.room || "Not specified"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Day & Period</Label>
                  <p className="font-medium">
                    {entry.day}, Period {entry.periodNumber}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Duration</Label>
                  <p className="font-medium">{entry.slotsUsed} period(s)</p>
                </div>
              </div>

              {entry.isElective && (
                <div className="mt-2">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    Elective Course
                  </span>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="destructive"
                onClick={() => onDelete(entry.id)}
              >
                Delete
              </Button>
              <Button type="button" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
} 