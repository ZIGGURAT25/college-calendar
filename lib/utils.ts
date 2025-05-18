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
  const [hours, minutes] = time.split(":")
  const hour = Number.parseInt(hours, 10)
  const ampm = hour >= 12 ? "PM" : "AM"
  const formattedHour = hour % 12 || 12
  return `${formattedHour}:${minutes} ${ampm}`
}

export function getDaysOfWeek(): string[] {
  return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
}

export function getShortDay(day: string): string {
  return day.substring(0, 3)
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
