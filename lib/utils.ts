"use client"

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number)
  const period = hours >= 12 ? "PM" : "AM"
  const formattedHours = hours % 12 || 12
  return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`
}

export function getDaysOfWeek(): string[] {
  return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
}

export function getShortDay(day: string): string {
  return day.slice(0, 3)
}

export function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = []
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d))
  }

  return days
}

export function getWeekDays(date: Date): Date[] {
  const days: Date[] = []
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Sunday

  const monday = new Date(date)
  monday.setDate(diff)

  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday)
    nextDay.setDate(monday.getDate() + i)
    days.push(nextDay)
  }

  return days
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

export function dateToISOString(date: Date): string {
  return date.toISOString().split("T")[0]
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

export function addMinutesToTime(time: string, minutes: number): string {
  const [hours, mins] = time.split(":").map(Number)
  const totalMinutes = hours * 60 + mins + minutes
  const newHours = Math.floor(totalMinutes / 60)
  const newMinutes = totalMinutes % 60
  return `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`
}

export function generateTimeSlots(startTime: string, duration: number, count: number): string[] {
  const slots: string[] = []
  let currentTime = startTime

  for (let i = 0; i < count; i++) {
    slots.push(currentTime)
    currentTime = addMinutesToTime(currentTime, duration)
  }

  return slots
}

export function isOverlapping(
  day: string,
  periodNumber: number,
  slotsUsed: number,
  existingEntries: any[]
): boolean {
  const targetSlots = Array.from(
    { length: slotsUsed },
    (_, i) => periodNumber + i
  )

  return existingEntries.some((entry) => {
    if (entry.day !== day) return false

    const entrySlots = Array.from(
      { length: entry.slotsUsed },
      (_, i) => entry.periodNumber + i
    )

    return targetSlots.some((slot) => entrySlots.includes(slot))
  })
}

export function validateTimetableEntry(
  entry: any,
  existingEntries: any[],
  maxPeriodsPerDay: number
): string | null {
  // Check if period number is valid
  if (entry.periodNumber < 1 || entry.periodNumber > maxPeriodsPerDay) {
    return `Invalid period number. Must be between 1 and ${maxPeriodsPerDay}`
  }

  // Check if entry would exceed the maximum periods
  if (entry.periodNumber + entry.slotsUsed - 1 > maxPeriodsPerDay) {
    return "Entry duration exceeds available periods"
  }

  // Check for overlapping entries
  if (
    isOverlapping(
      entry.day,
      entry.periodNumber,
      entry.slotsUsed,
      existingEntries.filter((e) => e.id !== entry.id)
    )
  ) {
    return "Entry overlaps with existing classes"
  }

  return null
}
