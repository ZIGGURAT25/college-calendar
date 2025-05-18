"use client"

import { useState } from "react"
import { Save, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { config, getDaysOfWeek } from "@/lib/data"

export function SettingsPanel() {
  const [showMonday, setShowMonday] = useState(config.showMonday)
  const [mondayCloneDay, setMondayCloneDay] = useState<string>(config.mondayCloneDay || "Tuesday")
  const [periodTimes, setPeriodTimes] = useState<{ period: number; start: string; end: string }[]>(
    JSON.parse(config.periodTimes),
  )
  const [holidayDates, setHolidayDates] = useState<string[]>(JSON.parse(config.holidayDates))
  const [newHolidayDate, setNewHolidayDate] = useState("")
  const [breakPeriod, setBreakPeriod] = useState<string>(config.breakPeriod?.toString() || "1")
  const [lunchPeriod, setLunchPeriod] = useState<string>(config.lunchPeriod?.toString() || "2")

  const daysOfWeek = getDaysOfWeek().slice(1, 5) // Tuesday to Friday

  const handleAddPeriod = () => {
    const newPeriod = {
      period: periodTimes.length + 1,
      start: "09:00",
      end: "10:00",
    }
    setPeriodTimes([...periodTimes, newPeriod])
  }

  const handleRemovePeriod = (index: number) => {
    const newPeriodTimes = [...periodTimes]
    newPeriodTimes.splice(index, 1)
    // Renumber periods
    newPeriodTimes.forEach((period, i) => {
      period.period = i + 1
    })
    setPeriodTimes(newPeriodTimes)
  }

  const handlePeriodChange = (index: number, field: "start" | "end", value: string) => {
    const newPeriodTimes = [...periodTimes]
    newPeriodTimes[index][field] = value
    setPeriodTimes(newPeriodTimes)
  }

  const handleAddHoliday = () => {
    if (newHolidayDate && !holidayDates.includes(newHolidayDate)) {
      setHolidayDates([...holidayDates, newHolidayDate])
      setNewHolidayDate("")
    }
  }

  const handleRemoveHoliday = (date: string) => {
    setHolidayDates(holidayDates.filter((d) => d !== date))
  }

  const handleSaveSettings = () => {
    // In a real app, this would call an API to save the settings
    console.log("Saving settings:", {
      showMonday,
      mondayCloneDay,
      periodTimes,
      holidayDates,
      breakPeriod,
      lunchPeriod,
    })
    alert("Settings would be saved in a real application")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Timetable Settings</CardTitle>
          <CardDescription>Configure how the timetable is displayed and managed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="showMonday" checked={showMonday} onCheckedChange={(checked) => setShowMonday(!!checked)} />
            <label htmlFor="showMonday" className="text-sm font-medium">
              Show Monday in timetable
            </label>
          </div>

          {showMonday && (
            <div className="space-y-2">
              <label htmlFor="mondayCloneDay" className="text-sm font-medium">
                If Monday is a holiday, use schedule from:
              </label>
              <Select value={mondayCloneDay} onValueChange={setMondayCloneDay}>
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Period Times</CardTitle>
          <CardDescription>Configure the start and end times for each period</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {periodTimes.map((period, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-20">
                <span className="text-sm font-medium">Period {period.period}</span>
              </div>
              <Input
                type="time"
                value={period.start}
                onChange={(e) => handlePeriodChange(index, "start", e.target.value)}
                className="w-32"
              />
              <span>to</span>
              <Input
                type="time"
                value={period.end}
                onChange={(e) => handlePeriodChange(index, "end", e.target.value)}
                className="w-32"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemovePeriod(index)}
                className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove Period</span>
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={handleAddPeriod}>
            <Plus className="h-4 w-4 mr-2" />
            Add Period
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Break & Lunch Periods</CardTitle>
          <CardDescription>Set which periods are designated for breaks and lunch</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="breakPeriod" className="text-sm font-medium">
              Break Period
            </label>
            <Select value={breakPeriod} onValueChange={setBreakPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">None</SelectItem>
                {periodTimes.map((period) => (
                  <SelectItem key={period.period} value={period.period.toString()}>
                    Period {period.period}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="lunchPeriod" className="text-sm font-medium">
              Lunch Period
            </label>
            <Select value={lunchPeriod} onValueChange={setLunchPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">None</SelectItem>
                {periodTimes.map((period) => (
                  <SelectItem key={period.period} value={period.period.toString()}>
                    Period {period.period}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Holidays</CardTitle>
          <CardDescription>Manage holiday dates when no classes are scheduled</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              type="date"
              value={newHolidayDate}
              onChange={(e) => setNewHolidayDate(e.target.value)}
              className="w-full"
            />
            <Button variant="outline" onClick={handleAddHoliday}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {holidayDates.map((date) => (
              <div key={date} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                <span>{new Date(date).toLocaleDateString()}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveHoliday(date)}
                  className="h-8 w-8 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove Holiday</span>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings}>
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}
