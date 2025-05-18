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
  email: string
}

export type Subject = {
  id: number
  subjectCode: string
  subjectName: string
  facultyId: number
  type: "Theory" | "Lab" | "Elective" | "Combined" | "Break" | "Lunch"
}

export type TimetableEntry = {
  id: number
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"
  periodNumber: number
  subjectId: number
  facultyId: number | null
  room: string
  isElective: boolean
  slotsUsed: number
  isBreak?: boolean
  isLunch?: boolean
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
  mondayCloneDay: "Tuesday" | "Wednesday" | "Thursday" | "Friday"
  periodTimes: string // JSON string of period start/end times
  holidayDates: string // JSON string of holiday dates
  breakPeriod: number | null
  lunchPeriod: number | null
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
  { id: 1, name: "Dr. John Smith", email: "john.smith@college.edu" },
  { id: 2, name: "Prof. Sarah Johnson", email: "sarah.johnson@college.edu" },
  { id: 3, name: "Dr. Michael Brown", email: "michael.brown@college.edu" },
  { id: 4, name: "Prof. Emily Davis", email: "emily.davis@college.edu" },
  { id: 5, name: "Dr. Robert Wilson", email: "robert.wilson@college.edu" },
  { id: 6, name: "Prof. Jennifer Lee", email: "jennifer.lee@college.edu" },
]

// Generate mock subjects
export const subjects: Subject[] = [
  { id: 1, subjectCode: "CS101", subjectName: "Introduction to Programming", facultyId: 1, type: "Theory" },
  { id: 2, subjectCode: "CS102", subjectName: "Data Structures", facultyId: 2, type: "Theory" },
  { id: 3, subjectCode: "CS103", subjectName: "Database Systems", facultyId: 3, type: "Theory" },
  { id: 4, subjectCode: "CS104", subjectName: "Programming Lab", facultyId: 1, type: "Lab" },
  { id: 5, subjectCode: "CS105", subjectName: "Database Lab", facultyId: 3, type: "Lab" },
  { id: 6, subjectCode: "CS106", subjectName: "Web Development", facultyId: 4, type: "Elective" },
  { id: 7, subjectCode: "CS107", subjectName: "Machine Learning", facultyId: 5, type: "Elective" },
  { id: 8, subjectCode: "CS108", subjectName: "Computer Networks", facultyId: 6, type: "Combined" },
  { id: 9, subjectCode: "BREAK", subjectName: "Morning Break", facultyId: 0, type: "Break" },
  { id: 10, subjectCode: "LUNCH", subjectName: "Lunch Break", facultyId: 0, type: "Lunch" },
]

// Generate mock timetable
export const timetable: TimetableEntry[] = [
  // Monday
  { id: 1, day: "Monday", periodNumber: 1, subjectId: 1, facultyId: 1, room: "A101", isElective: false, slotsUsed: 1 },
  { id: 2, day: "Monday", periodNumber: 2, subjectId: 2, facultyId: 2, room: "A102", isElective: false, slotsUsed: 1 },
  {
    id: 3,
    day: "Monday",
    periodNumber: 3,
    subjectId: 9,
    facultyId: null,
    room: "All",
    isElective: false,
    slotsUsed: 1,
    isBreak: true,
  },
  { id: 4, day: "Monday", periodNumber: 4, subjectId: 3, facultyId: 3, room: "A103", isElective: false, slotsUsed: 1 },
  {
    id: 5,
    day: "Monday",
    periodNumber: 5,
    subjectId: 10,
    facultyId: null,
    room: "Cafeteria",
    isElective: false,
    slotsUsed: 1,
    isLunch: true,
  },
  { id: 6, day: "Monday", periodNumber: 6, subjectId: 8, facultyId: 6, room: "A104", isElective: false, slotsUsed: 1 },
  // Tuesday
  { id: 7, day: "Tuesday", periodNumber: 1, subjectId: 2, facultyId: 2, room: "A102", isElective: false, slotsUsed: 1 },
  { id: 8, day: "Tuesday", periodNumber: 2, subjectId: 3, facultyId: 3, room: "A103", isElective: false, slotsUsed: 1 },
  {
    id: 9,
    day: "Tuesday",
    periodNumber: 3,
    subjectId: 9,
    facultyId: null,
    room: "All",
    isElective: false,
    slotsUsed: 1,
    isBreak: true,
  },
  {
    id: 10,
    day: "Tuesday",
    periodNumber: 4,
    subjectId: 4,
    facultyId: 1,
    room: "Lab1",
    isElective: false,
    slotsUsed: 2,
  },
  {
    id: 11,
    day: "Tuesday",
    periodNumber: 6,
    subjectId: 10,
    facultyId: null,
    room: "Cafeteria",
    isElective: false,
    slotsUsed: 1,
    isLunch: true,
  },
  // Wednesday
  {
    id: 12,
    day: "Wednesday",
    periodNumber: 1,
    subjectId: 1,
    facultyId: 1,
    room: "A101",
    isElective: false,
    slotsUsed: 1,
  },
  {
    id: 13,
    day: "Wednesday",
    periodNumber: 2,
    subjectId: 6,
    facultyId: 4,
    room: "A105",
    isElective: true,
    slotsUsed: 1,
  },
  {
    id: 14,
    day: "Wednesday",
    periodNumber: 2,
    subjectId: 7,
    facultyId: 5,
    room: "A106",
    isElective: true,
    slotsUsed: 1,
  },
  {
    id: 15,
    day: "Wednesday",
    periodNumber: 3,
    subjectId: 9,
    facultyId: null,
    room: "All",
    isElective: false,
    slotsUsed: 1,
    isBreak: true,
  },
  {
    id: 16,
    day: "Wednesday",
    periodNumber: 4,
    subjectId: 5,
    facultyId: 3,
    room: "Lab2",
    isElective: false,
    slotsUsed: 2,
  },
  {
    id: 17,
    day: "Wednesday",
    periodNumber: 6,
    subjectId: 10,
    facultyId: null,
    room: "Cafeteria",
    isElective: false,
    slotsUsed: 1,
    isLunch: true,
  },
  // Thursday
  {
    id: 18,
    day: "Thursday",
    periodNumber: 1,
    subjectId: 3,
    facultyId: 3,
    room: "A103",
    isElective: false,
    slotsUsed: 1,
  },
  {
    id: 19,
    day: "Thursday",
    periodNumber: 2,
    subjectId: 1,
    facultyId: 1,
    room: "A101",
    isElective: false,
    slotsUsed: 1,
  },
  {
    id: 20,
    day: "Thursday",
    periodNumber: 3,
    subjectId: 9,
    facultyId: null,
    room: "All",
    isElective: false,
    slotsUsed: 1,
    isBreak: true,
  },
  {
    id: 21,
    day: "Thursday",
    periodNumber: 4,
    subjectId: 2,
    facultyId: 2,
    room: "A102",
    isElective: false,
    slotsUsed: 1,
  },
  {
    id: 22,
    day: "Thursday",
    periodNumber: 5,
    subjectId: 10,
    facultyId: null,
    room: "Cafeteria",
    isElective: false,
    slotsUsed: 1,
    isLunch: true,
  },
  {
    id: 23,
    day: "Thursday",
    periodNumber: 6,
    subjectId: 8,
    facultyId: 6,
    room: "A104",
    isElective: false,
    slotsUsed: 1,
  },
  // Friday
  { id: 24, day: "Friday", periodNumber: 1, subjectId: 6, facultyId: 4, room: "A105", isElective: true, slotsUsed: 1 },
  { id: 25, day: "Friday", periodNumber: 1, subjectId: 7, facultyId: 5, room: "A106", isElective: true, slotsUsed: 1 },
  {
    id: 26,
    day: "Friday",
    periodNumber: 2,
    subjectId: 9,
    facultyId: null,
    room: "All",
    isElective: false,
    slotsUsed: 1,
    isBreak: true,
  },
  { id: 27, day: "Friday", periodNumber: 3, subjectId: 4, facultyId: 1, room: "Lab1", isElective: false, slotsUsed: 2 },
  {
    id: 28,
    day: "Friday",
    periodNumber: 5,
    subjectId: 10,
    facultyId: null,
    room: "Cafeteria",
    isElective: false,
    slotsUsed: 1,
    isLunch: true,
  },
  { id: 29, day: "Friday", periodNumber: 6, subjectId: 8, facultyId: 6, room: "A104", isElective: false, slotsUsed: 1 },
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

// Generate mock config
export const config: Config = {
  id: 1,
  showMonday: true,
  mondayCloneDay: "Tuesday",
  periodTimes: JSON.stringify([
    { period: 1, start: "09:00", end: "09:50" },
    { period: 2, start: "10:00", end: "10:50" },
    { period: 3, start: "11:00", end: "11:50" },
    { period: 4, start: "12:00", end: "12:20" }, // Break
    { period: 5, start: "12:30", end: "13:20" },
    { period: 6, start: "13:30", end: "14:10" }, // Lunch
    { period: 7, start: "14:20", end: "15:10" },
    { period: 8, start: "15:20", end: "16:10" },
  ]),
  holidayDates: JSON.stringify([
    "2025-05-01", // Labor Day
    "2025-05-15", // College Foundation Day
    "2025-06-15", // Mid-semester break
  ]),
  breakPeriod: 4,
  lunchPeriod: 6,
}

// Helper functions
export function getSubjectById(id: number): Subject | undefined {
  return subjects.find((subject) => subject.id === id)
}

export function getFacultyById(id: number | null): Faculty | undefined {
  if (id === null) return undefined
  return faculty.find((f) => f.id === id)
}

export function getTimetableForDay(day: string): TimetableEntry[] {
  return timetable.filter((entry) => entry.day === day)
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

export function getPeriodTimes() {
  return JSON.parse(config.periodTimes)
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
      return "event-class-blue"
    case "Lab":
      return "event-class-cyan"
    case "Elective":
      return "event-class-purple"
    case "Combined":
      return "event-exam-orange"
    case "Break":
      return "event-break"
    case "Lunch":
      return "event-lunch"
    default:
      return "event-class-blue"
  }
}

// Get color for exam
export function getColorForExam(): string {
  return "event-exam-red"
}

// Check if a period is a break or lunch
export function isBreakPeriod(periodNumber: number): boolean {
  return config.breakPeriod === periodNumber
}

export function isLunchPeriod(periodNumber: number): boolean {
  return config.lunchPeriod === periodNumber
}

// Get all break and lunch entries
export function getBreakEntries(): TimetableEntry[] {
  return timetable.filter((entry) => entry.isBreak || entry.isLunch)
}

// Generate a new unique ID for timetable entries
export function generateNewTimetableEntryId(): number {
  return Math.max(...timetable.map((entry) => entry.id)) + 1
}

// Add a new timetable entry
export function addTimetableEntry(entry: Omit<TimetableEntry, "id">): TimetableEntry {
  const newEntry = {
    ...entry,
    id: generateNewTimetableEntryId(),
  }
  timetable.push(newEntry)
  return newEntry
}

// Update a timetable entry
export function updateTimetableEntry(id: number, updates: Partial<TimetableEntry>): TimetableEntry | null {
  const index = timetable.findIndex((entry) => entry.id === id)
  if (index === -1) return null

  const updatedEntry = { ...timetable[index], ...updates }
  timetable[index] = updatedEntry
  return updatedEntry
}

// Delete a timetable entry
export function deleteTimetableEntry(id: number): boolean {
  const index = timetable.findIndex((entry) => entry.id === id)
  if (index === -1) return false

  timetable.splice(index, 1)
  return true
}

// Move a timetable entry to a new day and period
export function moveTimetableEntry(
  id: number,
  newDay: TimetableEntry["day"],
  newPeriod: number,
): TimetableEntry | null {
  return updateTimetableEntry(id, { day: newDay, periodNumber: newPeriod })
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
