import { Student, Faculty, Subject, students, faculty, subjects } from "./data"

// Student Management
let nextStudentId = Math.max(...students.map(s => s.id)) + 1
let nextFacultyId = Math.max(...faculty.map(f => f.id)) + 1
let nextSubjectId = Math.max(...subjects.map(s => s.id)) + 1

// Extended types for admin operations
export interface AdminStudent extends Student {
  department: string
  year: number
  email: string
}

export interface AdminFaculty extends Faculty {
  department: string
  designation: string
  phone: string
}

export interface AdminSubject extends Subject {
  credits: number
  semester: number
  department: string
}

// Convert existing data to admin types
export const adminStudents: AdminStudent[] = students.map(student => ({
  ...student,
  department: "Computer Science", // Default department
  year: 1,
  email: `${student.registerNo.toLowerCase()}@college.edu`
}))

export const adminFaculty: AdminFaculty[] = faculty.map(f => ({
  ...f,
  department: "Computer Science",
  designation: "Assistant Professor",
  phone: "+1234567890"
}))

export const adminSubjects: AdminSubject[] = subjects.map(subject => ({
  ...subject,
  credits: 3,
  semester: 1,
  department: "Computer Science"
}))

// Student CRUD Operations
export function getAllStudents(): AdminStudent[] {
  return adminStudents
}

export function getStudentById(id: number): AdminStudent | undefined {
  return adminStudents.find(s => s.id === id)
}

export function getStudentByRegisterNo(registerNo: string): AdminStudent | undefined {
  return adminStudents.find(s => s.registerNo === registerNo)
}

export function addStudent(student: Omit<AdminStudent, "id">): AdminStudent {
  const newStudent = { ...student, id: nextStudentId++ }
  adminStudents.push(newStudent)
  return newStudent
}

export function updateStudent(id: number, updates: Partial<AdminStudent>): AdminStudent | null {
  const index = adminStudents.findIndex(s => s.id === id)
  if (index === -1) return null
  
  adminStudents[index] = { ...adminStudents[index], ...updates }
  return adminStudents[index]
}

export function deleteStudent(id: number): boolean {
  const index = adminStudents.findIndex(s => s.id === id)
  if (index === -1) return false
  
  adminStudents.splice(index, 1)
  return true
}

// Faculty CRUD Operations
export function getAllFaculty(): AdminFaculty[] {
  return adminFaculty
}

export function getFacultyById(id: number): AdminFaculty | undefined {
  return adminFaculty.find(f => f.id === id)
}

export function getFacultyByEmail(email: string): AdminFaculty | undefined {
  return adminFaculty.find(f => f.email === email)
}

export function addFaculty(faculty: Omit<AdminFaculty, "id">): AdminFaculty {
  const newFaculty = { ...faculty, id: nextFacultyId++ }
  adminFaculty.push(newFaculty)
  return newFaculty
}

export function updateFaculty(id: number, updates: Partial<AdminFaculty>): AdminFaculty | null {
  const index = adminFaculty.findIndex(f => f.id === id)
  if (index === -1) return null
  
  adminFaculty[index] = { ...adminFaculty[index], ...updates }
  return adminFaculty[index]
}

export function deleteFaculty(id: number): boolean {
  const index = adminFaculty.findIndex(f => f.id === id)
  if (index === -1) return false
  
  adminFaculty.splice(index, 1)
  return true
}

// Subject CRUD Operations
export function getAllSubjects(): AdminSubject[] {
  return adminSubjects
}

export function getSubjectById(id: number): AdminSubject | undefined {
  return adminSubjects.find(s => s.id === id)
}

export function getSubjectByCode(code: string): AdminSubject | undefined {
  return adminSubjects.find(s => s.subjectCode === code)
}

export function addSubject(subject: Omit<AdminSubject, "id">): AdminSubject {
  const newSubject = { ...subject, id: nextSubjectId++ }
  adminSubjects.push(newSubject)
  return newSubject
}

export function updateSubject(id: number, updates: Partial<AdminSubject>): AdminSubject | null {
  const index = adminSubjects.findIndex(s => s.id === id)
  if (index === -1) return null
  
  adminSubjects[index] = { ...adminSubjects[index], ...updates }
  return adminSubjects[index]
}

export function deleteSubject(id: number): boolean {
  const index = adminSubjects.findIndex(s => s.id === id)
  if (index === -1) return false
  
  adminSubjects.splice(index, 1)
  return true
}

// Validation Functions
export function isValidRegisterNo(registerNo: string): boolean {
  return /^[0-9]{9}$/.test(registerNo)
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPhone(phone: string): boolean {
  return /^\+?[0-9]{10,}$/.test(phone)
}

export function isValidSubjectCode(code: string): boolean {
  return /^[A-Z]{2,}[0-9]{3}$/.test(code)
}

// Department List (can be expanded based on requirements)
export const departments = [
  "Computer Science",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical"
]

// Designation List for Faculty
export const designations = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Senior Lecturer",
  "Lecturer"
] 