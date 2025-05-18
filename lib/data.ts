"use client"

// Mock data for the application

// Types
export type Student = {
  id: number
  registerNo: string
  fullName: string
}

export type Faculty = {
  id: number
  name: string
  department: string
  designation: string
}

export type Subject = {
  id: number
  subjectCode: string
  subjectName: string
  type: "Theory" | "Lab" | "Elective" | "Combined"
  facultyId: number | null
  semester: number
}

export type PeriodTiming = {
  period: number
  duration: number // in minutes
}

export type DaySchedule = {
  firstPeriodStartTime: string
  periods: { duration: number }[]
}

export type TimetableEntry = {
  id: number
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday"
  periodNumber: number
  subjectId: number
  facultyId: number | null
  room: string
  isElective: boolean
  slotsUsed: number
  isBreak: boolean
  isLunch: boolean
}

export type Exam = {
  id: number
  subjectId: number
  date: string // ISO date string
  time: string
}

export type ExamRoom = {
  id: number
  examId: number
  roomName: string
  registerRange: string
}

export type Config = {
  id: number
  showMonday: boolean
  defaultPeriodDuration: number // in minutes
  holidayDates: string // JSON string of holiday dates
  workingMondays: string[] // Array of dates for working Mondays
  workingMondaySchedules: { [date: string]: "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" }
  daySchedules: Record<string, DaySchedule>
}

// Generate mock students
export const students: Student[] = Array.from({ length: 70 }, (_, i) => {
  const id = i + 1
  // Skip specific register numbers as requested
  if (id === 31 || id === 45 || id === 50) return null

  const registerNo = `230601${String(id).padStart(3, "0")}`
  return {
    id,
    registerNo,
    fullName: `Student ${id}`,
  }
}).filter(Boolean) as Student[]

// Generate mock faculty
export const faculty: Faculty[] = [
  { id: 1, name: "Dr. John Smith", department: "Computer Science", designation: "Professor" },
  { id: 2, name: "Dr. Sarah Johnson", department: "Computer Science", designation: "Associate Professor" },
  { id: 3, name: "Prof. Michael Brown", department: "Computer Science", designation: "Assistant Professor" },
  { id: 4, name: "Dr. Emily Davis", department: "Computer Science", designation: "Professor" },
  { id: 5, name: "Dr. Robert Wilson", department: "Computer Science", designation: "Professor" },
  { id: 6, name: "Prof. Jennifer Lee", department: "Computer Science", designation: "Professor" },
]

// Generate mock subjects
export const subjects: Subject[] = [
  { id: 1, subjectCode: "CS101", subjectName: "Introduction to Programming", type: "Theory", facultyId: 1, semester: 1 },
  { id: 2, subjectCode: "CS102", subjectName: "Data Structures", type: "Theory", facultyId: 2, semester: 1 },
  { id: 3, subjectCode: "CS103", subjectName: "Database Systems", type: "Combined", facultyId: 3, semester: 2 },
  { id: 4, subjectCode: "CS104", subjectName: "Programming Lab", type: "Lab", facultyId: 1, semester: 1 },
  { id: 5, subjectCode: "CS105", subjectName: "Database Lab", type: "Lab", facultyId: 3, semester: 2 },
  { id: 6, subjectCode: "CS106", subjectName: "Web Development", type: "Elective", facultyId: 4, semester: 3 },
  { id: 7, subjectCode: "CS107", subjectName: "Machine Learning", type: "Elective", facultyId: 5, semester: 3 },
  { id: 8, subjectCode: "CS108", subjectName: "Computer Networks", type: "Combined", facultyId: 6, semester: 2 },
]

// Initial timetable data
let timetableData: TimetableEntry[] = [
  {
    id: 1,
    day: "Monday",
    periodNumber: 1,
    subjectId: 1,
    facultyId: 1,
    room: "101",
    isElective: false,
    slotsUsed: 1,
    isBreak: false,
    isLunch: false,
  },
  {
    id: 2,
    day: "Monday",
    periodNumber: 2,
    subjectId: 2,
    facultyId: 2,
    room: "102",
    isElective: false,
    slotsUsed: 1,
    isBreak: false,
    isLunch: false,
  },
  {
    id: 3,
    day: "Monday",
    periodNumber: 3,
    subjectId: 0,
    facultyId: null,
    room: "",
    isElective: false,
    slotsUsed: 1,
    isBreak: true,
    isLunch: false,
  },
  {
    id: 4,
    day: "Monday",
    periodNumber: 4,
    subjectId: 3,
    facultyId: 1,
    room: "Lab 1",
    isElective: false,
    slotsUsed: 2,
    isBreak: false,
    isLunch: false,
  },
  {
    id: 5,
    day: "Monday",
    periodNumber: 6,
    subjectId: 0,
    facultyId: null,
    room: "",
    isElective: false,
    slotsUsed: 1,
    isBreak: false,
    isLunch: true,
  },
  {
    id: 6,
    day: "Monday",
    periodNumber: 7,
    subjectId: 4,
    facultyId: 3,
    room: "201",
    isElective: false,
    slotsUsed: 1,
    isBreak: false,
    isLunch: false,
  },
  // Tuesday
  {
    id: 7,
    day: "Tuesday",
    periodNumber: 1,
    subjectId: 2,
    facultyId: 2,
    room: "102",
    isElective: false,
    slotsUsed: 1,
    isBreak: false,
    isLunch: false,
  },
  {
    id: 8,
    day: "Tuesday",
    periodNumber: 2,
    subjectId: 5,
    facultyId: 4,
    room: "301",
    isElective: true,
    slotsUsed: 1,
    isBreak: false,
    isLunch: false,
  },
]

// Generate mock exams
export const exams: Exam[] = [
  { id: 1, subjectId: 1, date: "2025-06-01", time: "09:00" },
  { id: 2, subjectId: 2, date: "2025-06-03", time: "14:00" },
  { id: 3, subjectId: 3, date: "2025-06-05", time: "09:00" },
  { id: 4, subjectId: 4, date: "2025-06-07", time: "10:00" },
  { id: 5, subjectId: 5, date: "2025-06-10", time: "09:00" },
  { id: 6, subjectId: 6, date: "2025-06-12", time: "14:00" },
  { id: 7, subjectId: 7, date: "2025-06-12", time: "09:00" },
  { id: 8, subjectId: 8, date: "2025-06-15", time: "09:00" },
]

// Generate mock exam rooms
export const examRooms: ExamRoom[] = [
  { id: 1, examId: 1, roomName: "A101", registerRange: "230601001-230601030" },
  { id: 2, examId: 1, roomName: "A102", registerRange: "230601032-230601070" },
  { id: 3, examId: 2, roomName: "A103", registerRange: "230601001-230601044" },
  { id: 4, examId: 2, roomName: "A104", registerRange: "230601046-230601070" },
  { id: 5, examId: 3, roomName: "A105", registerRange: "230601001-230601070" },
  { id: 6, examId: 4, roomName: "Lab1", registerRange: "230601001-230601035" },
  { id: 7, examId: 4, roomName: "Lab2", registerRange: "230601036-230601070" },
  { id: 8, examId: 5, roomName: "Lab2", registerRange: "230601001-230601070" },
  { id: 9, examId: 6, roomName: "A101", registerRange: "230601001-230601030" },
  { id: 10, examId: 7, roomName: "A102", registerRange: "230601032-230601070" },
  { id: 11, examId: 8, roomName: "A103", registerRange: "230601001-230601070" },
]

// Configuration
export const config: Config = {
  id: 1,
  showMonday: true,
  defaultPeriodDuration: 50, // 50 minutes default period duration
  holidayDates: JSON.stringify([
    "2025-05-01", // Labor Day
    "2025-05-15", // College Foundation Day
    "2025-06-15", // Mid-semester break
  ]),
  workingMondays: [],
  workingMondaySchedules: {},
  daySchedules: {
    Monday: {
      firstPeriodStartTime: "09:00",
      periods: [
        { duration: 50 }, // 9:00 - 9:50
        { duration: 50 }, // 9:50 - 10:40
        { duration: 20 }, // 10:40 - 11:00 (Break)
        { duration: 50 }, // 11:00 - 11:50
        { duration: 50 }, // 11:50 - 12:40
        { duration: 60 }, // 12:40 - 1:40 (Lunch)
        { duration: 50 }, // 1:40 - 2:30
        { duration: 50 }, // 2:30 - 3:20
      ],
    },
    Tuesday: {
      firstPeriodStartTime: "09:00",
      periods: [
        { duration: 50 },
        { duration: 50 },
        { duration: 20 },
        { duration: 50 },
        { duration: 50 },
        { duration: 60 },
        { duration: 50 },
        { duration: 50 },
      ],
    },
    Wednesday: {
      firstPeriodStartTime: "09:00",
      periods: [
        { duration: 50 },
        { duration: 50 },
        { duration: 20 },
        { duration: 50 },
        { duration: 50 },
        { duration: 60 },
        { duration: 50 },
        { duration: 50 },
      ],
    },
    Thursday: {
      firstPeriodStartTime: "09:00",
      periods: [
        { duration: 50 },
        { duration: 50 },
        { duration: 20 },
        { duration: 50 },
        { duration: 50 },
        { duration: 60 },
        { duration: 50 },
        { duration: 50 },
      ],
    },
    Friday: {
      firstPeriodStartTime: "09:00",
      periods: [
        { duration: 50 },
        { duration: 50 },
        { duration: 20 },
        { duration: 50 },
        { duration: 50 },
        { duration: 60 },
        { duration: 50 },
        { duration: 50 },
      ],
    },
    Saturday: {
      firstPeriodStartTime: "09:00",
      periods: [
        { duration: 50 },
        { duration: 50 },
        { duration: 20 },
        { duration: 50 },
        { duration: 50 },
      ],
    },
  },
}

// Helper functions
export function getSubjectById(id: number): Subject | undefined {
  return subjects.find((s) => s.id === id)
}

export function getFacultyById(id: number | null): Faculty | undefined {
  if (id === null) return undefined
  return faculty.find((f) => f.id === id)
}

export function getTimetableForDay(day: string): TimetableEntry[] {
  return timetableData.filter((entry) => entry.day === day)
}

export function getExamById(id: number): Exam | undefined {
  return exams.find((exam) => exam.id === id)
}

export function getExamRoomsByExamId(examId: number): ExamRoom[] {
  return examRooms.filter((room) => room.examId === examId)
}

export function isHoliday(date: string): boolean {
  const holidayDates = JSON.parse(config.holidayDates)
  return holidayDates.includes(date)
}

export function calculatePeriodStartTime(daySchedule: DaySchedule, periodNumber: number): string {
  const [hours, minutes] = daySchedule.firstPeriodStartTime.split(":").map(Number)
  let totalMinutes = hours * 60 + minutes

  for (let i = 1; i < periodNumber; i++) {
    totalMinutes += daySchedule.periods[i - 1].duration
  }

  const resultHours = Math.floor(totalMinutes / 60)
  const resultMinutes = totalMinutes % 60
  return `${resultHours.toString().padStart(2, "0")}:${resultMinutes.toString().padStart(2, "0")}`
}

export function calculatePeriodEndTime(daySchedule: DaySchedule, periodNumber: number): string {
  const startTime = calculatePeriodStartTime(daySchedule, periodNumber)
  const [hours, minutes] = startTime.split(":").map(Number)
  const totalMinutes = hours * 60 + minutes + daySchedule.periods[periodNumber - 1].duration

  const resultHours = Math.floor(totalMinutes / 60)
  const resultMinutes = totalMinutes % 60
  return `${resultHours.toString().padStart(2, "0")}:${resultMinutes.toString().padStart(2, "0")}`
}

export function isStudentInRegisterRange(registerNo: string, range: string): boolean {
  // Handle comma-separated ranges
  if (range.includes(",")) {
    const ranges = range.split(",")
    return ranges.some((r) => isStudentInRegisterRange(registerNo, r.trim()))
  }

  // Handle hyphenated range
  if (range.includes("-")) {
    const [start, end] = range.split("-")
    return registerNo >= start && registerNo <= end
  }

  // Handle single value
  return registerNo === range
}

export function getExamRoomForStudent(examId: number, registerNo: string): string | null {
  const rooms = getExamRoomsByExamId(examId)
  const room = rooms.find((r) => isStudentInRegisterRange(registerNo, r.registerRange))
  return room ? room.roomName : null
}

// Get color for subject type
export function getColorForSubject(subject: Subject): string {
  switch (subject.type) {
    case "Theory":
      return "bg-blue-50 text-blue-700"
    case "Lab":
      return "bg-purple-50 text-purple-700"
    case "Elective":
      return "bg-green-50 text-green-700"
    case "Combined":
      return "bg-orange-50 text-orange-700"
    default:
      return "bg-gray-50 text-gray-700"
  }
}

// Get color for exam
export function getColorForExam(): string {
  return "event-exam-red"
}

// Check if a period is a break or lunch
export function isBreakPeriod(periodNumber: number): boolean {
  return config.daySchedules[periodNumber.toString()].breakPeriod === periodNumber
}

export function isLunchPeriod(periodNumber: number): boolean {
  return config.daySchedules[periodNumber.toString()].lunchPeriod === periodNumber
}

// Get all break and lunch entries
export function getBreakEntries(): TimetableEntry[] {
  return timetableData.filter((entry) => isBreakPeriod(entry.periodNumber) || isLunchPeriod(entry.periodNumber))
}

// Generate a new unique ID for timetable entries
export function generateNewTimetableEntryId(): number {
  return Math.max(...timetableData.map((entry) => entry.id)) + 1
}

// Add a new timetable entry
export function addTimetableEntry(entry: Omit<TimetableEntry, "id">): TimetableEntry {
  const newEntry = {
    ...entry,
    id: generateNewTimetableEntryId(),
  }
  timetableData.push(newEntry)
  return newEntry
}

// Update a timetable entry
export function updateTimetableEntry(id: number, data: Partial<TimetableEntry>): TimetableEntry | null {
  const index = timetableData.findIndex((e) => e.id === id)
  if (index === -1) return null

  timetableData[index] = { ...timetableData[index], ...data }
  return timetableData[index]
}

// Delete a timetable entry
export function deleteTimetableEntry(id: number): void {
  timetableData = timetableData.filter((e) => e.id !== id)
}

// Move a timetable entry to a new day and period
export function moveTimetableEntry(id: number, newDay: TimetableEntry["day"], newPeriod: number): TimetableEntry | null {
  const entry = updateTimetableEntry(id, { day: newDay, periodNumber: newPeriod })
  return entry
}

// Get exams for a specific month
export function getExamsForMonth(year: number, month: number): Exam[] {
  const startDate = new Date(year, month, 1).toISOString().split("T")[0]
  const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0]

  return exams.filter((exam) => {
    return exam.date >= startDate && exam.date <= endDate
  })
}

// Get exams for a specific date
export function getExamsForDate(date: string): Exam[] {
  return exams.filter((exam) => exam.date === date)
}

export function getDaysOfWeek(): string[] {
  return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
}

export function getCurrentPeriod(periodTimes: any[]): number | null {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTime = `${currentHour}:${currentMinute}`

  for (const period of periodTimes) {
    const [startHour, startMinute] = period.start.split(":").map(Number)
    const [endHour, endMinute] = period.end.split(":").map(Number)

    const start = startHour * 60 + startMinute
    const end = endHour * 60 + endMinute
    const current = currentHour * 60 + currentMinute

    if (current >= start && current <= end) {
      return period.period
    }
  }

  return null
}

// Get period times for the current day
export function getPeriodTimes(): { period: number; start: string; end: string }[] {
  const today = new Date()
  const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][today.getDay()]
  const daySchedule = config.daySchedules[dayOfWeek]

  if (!daySchedule) {
    return []
  }

  return daySchedule.periods.map((period, index) => {
    const periodNumber = index + 1
    return {
      period: period.period,
      start: calculatePeriodStartTime(daySchedule, periodNumber),
      end: calculatePeriodEndTime(daySchedule, periodNumber)
    }
  })
}
