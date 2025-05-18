"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Plus, Trash2, Edit, CalendarIcon } from "lucide-react"

import { cn, formatDate, formatTime } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { type Exam, type ExamRoom, getSubjectById, getExamRoomsByExamId, subjects, exams } from "@/lib/data"

export function ExamEditor() {
  const [isExamDialogOpen, setIsExamDialogOpen] = useState(false)
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<ExamRoom | null>(null)
  const [examFormData, setExamFormData] = useState({
    subjectId: "",
    date: new Date(),
    day: "1",
    month: (new Date().getMonth() + 1).toString(),
    year: new Date().getFullYear().toString(),
    time: "09:00",
  })
  const [roomFormData, setRoomFormData] = useState({
    roomName: "",
    registerRange: "",
  })

  const handleAddExam = () => {
    setIsEditMode(false)
    const today = new Date()
    setExamFormData({
      subjectId: "",
      date: today,
      day: today.getDate().toString(),
      month: (today.getMonth() + 1).toString(),
      year: today.getFullYear().toString(),
      time: "09:00",
    })
    setIsExamDialogOpen(true)
  }

  const handleEditExam = (exam: Exam) => {
    setIsEditMode(true)
    setSelectedExam(exam)
    const examDate = new Date(exam.date)
    setExamFormData({
      subjectId: exam.subjectId.toString(),
      date: examDate,
      day: examDate.getDate().toString(),
      month: (examDate.getMonth() + 1).toString(),
      year: examDate.getFullYear().toString(),
      time: exam.time,
    })
    setIsExamDialogOpen(true)
  }

  const handleDeleteExam = (examId: number) => {
    // In a real app, this would call an API to delete the exam
    console.log(`Delete exam ${examId}`)
    alert(`Exam ${examId} would be deleted in a real application`)
  }

  const handleAddRoom = (exam: Exam) => {
    setSelectedExam(exam)
    setIsEditMode(false)
    setRoomFormData({
      roomName: "",
      registerRange: "",
    })
    setIsRoomDialogOpen(true)
  }

  const handleEditRoom = (room: ExamRoom) => {
    setIsEditMode(true)
    setSelectedRoom(room)
    setRoomFormData({
      roomName: room.roomName,
      registerRange: room.registerRange,
    })
    setIsRoomDialogOpen(true)
  }

  const handleDeleteRoom = (roomId: number) => {
    // In a real app, this would call an API to delete the room
    console.log(`Delete room ${roomId}`)
    alert(`Room ${roomId} would be deleted in a real application`)
  }

  const handleExamFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Create a date object from the selected values
    const selectedDate = new Date(
      parseInt(examFormData.year),
      parseInt(examFormData.month) - 1,
      parseInt(examFormData.day)
    )

    // Update the date in form data
    setExamFormData({
      ...examFormData,
      date: selectedDate
    })

    // In a real app, this would call an API to save the exam
    console.log("Exam form submitted:", {
      ...examFormData,
      date: selectedDate.toISOString()
    })

    if (isEditMode && selectedExam) {
      alert(`Exam ${selectedExam.id} would be updated in a real application`)
    } else {
      alert("New exam would be created in a real application")
    }

    setIsExamDialogOpen(false)
  }

  const handleRoomFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, this would call an API to save the room
    console.log("Room form submitted:", {
      examId: selectedExam?.id,
      ...roomFormData,
    })

    if (isEditMode && selectedRoom) {
      alert(`Room ${selectedRoom.id} would be updated in a real application`)
    } else {
      alert("New room would be created in a real application")
    }

    setIsRoomDialogOpen(false)
  }

  const handleExamInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setExamFormData({
      ...examFormData,
      [name]: value,
    })
  }

  const handleRoomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRoomFormData({
      ...roomFormData,
      [name]: value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setExamFormData({
      ...examFormData,
      [name]: value,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Exam Schedule</h2>
        <Button onClick={handleAddExam}>
          <Plus className="h-4 w-4 mr-2" />
          Add Exam
        </Button>
      </div>

      <div className="space-y-4">
        {exams.map((exam) => {
          const subject = getSubjectById(exam.subjectId)
          const rooms = getExamRoomsByExamId(exam.id)

          if (!subject) return null

          return (
            <div key={exam.id} className="p-4 bg-card rounded-lg border">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div>
                  <h3 className="text-lg font-medium">{subject.subjectName}</h3>
                  <p className="text-sm text-muted-foreground">{subject.subjectCode}</p>
                </div>

                <div className="flex items-center mt-2 md:mt-0">
                  <p className="text-sm mr-4">
                    {formatDate(new Date(exam.date))} at {formatTime(exam.time)}
                  </p>

                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditExam(exam)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleDeleteExam(exam.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">Room Allocation</h4>
                  <Button variant="outline" size="sm" onClick={() => handleAddRoom(exam)}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Room
                  </Button>
                </div>

                {rooms.length > 0 ? (
                  <div className="space-y-2">
                    {rooms.map((room) => (
                      <div key={room.id} className="p-3 bg-secondary rounded-md flex justify-between items-center">
                        <div>
                          <p className="font-medium">Room {room.roomName}</p>
                          <p className="text-sm text-muted-foreground">Register Numbers: {room.registerRange}</p>
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditRoom(room)}>
                            <Edit className="h-3 w-3" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => handleDeleteRoom(room.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-secondary/30 rounded-md text-center">
                    <p className="text-sm text-muted-foreground">No rooms allocated yet</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add/Edit Exam Dialog */}
      <Dialog open={isExamDialogOpen} onOpenChange={setIsExamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Exam" : "Add New Exam"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleExamFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="subjectId" className="text-sm font-medium">
                Subject
              </label>
              <Select value={examFormData.subjectId} onValueChange={(value) => handleSelectChange("subjectId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.subjectCode} - {subject.subjectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <div className="grid grid-cols-3 gap-2">
                <Select value={examFormData.month} onValueChange={(value) => handleSelectChange("month", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <SelectItem key={month} value={month.toString()}>
                        {new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Day"
                  value={examFormData.day}
                  onChange={(e) => handleSelectChange("day", e.target.value)}
                  className="w-full"
                />

                <Select value={examFormData.year} onValueChange={(value) => handleSelectChange("year", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="time" className="text-sm font-medium">
                Time
              </label>
              <Input id="time" name="time" type="time" value={examFormData.time} onChange={handleExamInputChange} />
            </div>

            <DialogFooter>
              <Button type="submit">{isEditMode ? "Update" : "Add"} Exam</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Room Dialog */}
      <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Room" : "Add Room Allocation"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRoomFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="roomName" className="text-sm font-medium">
                Room Name
              </label>
              <Input
                id="roomName"
                name="roomName"
                value={roomFormData.roomName}
                onChange={handleRoomInputChange}
                placeholder="e.g. A101"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="registerRange" className="text-sm font-medium">
                Register Number Range
              </label>
              <Input
                id="registerRange"
                name="registerRange"
                value={roomFormData.registerRange}
                onChange={handleRoomInputChange}
                placeholder="e.g. 230601001-230601030"
              />
              <p className="text-xs text-muted-foreground">
                Use format: 230601001-230601030 or 230601001,230601002,230601003
              </p>
            </div>

            <DialogFooter>
              <Button type="submit">{isEditMode ? "Update" : "Add"} Room</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
