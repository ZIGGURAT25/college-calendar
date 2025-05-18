"use client"

import { useState } from "react"
import { Save, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { config, getDaysOfWeek, type DaySchedule, type PeriodTiming, calculatePeriodEndTime, calculatePeriodStartTime } from "@/lib/data"

export function SettingsPanel() {
  const [showMonday, setShowMonday] = useState(config.showMonday)
  const [defaultPeriodDuration, setDefaultPeriodDuration] = useState(config.defaultPeriodDuration)
  const [workingMondays, setWorkingMondays] = useState<string[]>(config.workingMondays || [])
  const [workingMondaySchedules, setWorkingMondaySchedules] = useState<{ [date: string]: string }>(
    config.workingMondaySchedules || {}
  )
  const [holidayDates, setHolidayDates] = useState<string[]>(JSON.parse(config.holidayDates))
  const [newWorkingMonday, setNewWorkingMonday] = useState("")
  const [newHolidayDate, setNewHolidayDate] = useState("")
  const [daySchedules, setDaySchedules] = useState<{ [day: string]: DaySchedule }>(config.daySchedules)

  const daysOfWeek = getDaysOfWeek().slice(0, 6) // Monday to Saturday

  // Function to check if a date is a Monday
  const isMonday = (date: string) => {
    return new Date(date).getDay() === 1
  }

  // Function to check if a date is in the past
  const isPastDate = (date: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkDate = new Date(date)
    return checkDate < today
  }

  const handleDayScheduleChange = (
    day: string,
    field: keyof DaySchedule,
    value: string | number
  ) => {
    setDaySchedules({
      ...daySchedules,
      [day]: {
        ...daySchedules[day],
        [field]: field.includes("Period") ? Number(value) : value,
      },
    })
  }

  const handleAddWorkingMonday = () => {
    if (newWorkingMonday && !workingMondays.includes(newWorkingMonday) && isMonday(newWorkingMonday)) {
      setWorkingMondays([...workingMondays, newWorkingMonday])
      // Initialize the schedule to use Tuesday's timetable
      setWorkingMondaySchedules({ ...workingMondaySchedules, [newWorkingMonday]: "Tuesday" })
      setNewWorkingMonday("")
    } else if (!isMonday(newWorkingMonday)) {
      alert("Please select a Monday")
    }
  }

  const handleRemoveWorkingMonday = (date: string) => {
    setWorkingMondays(workingMondays.filter((d) => d !== date))
    // Remove the schedule for this working Monday
    const newSchedules = { ...workingMondaySchedules }
    delete newSchedules[date]
    setWorkingMondaySchedules(newSchedules)
  }

  const handleAddPeriod = (day: string) => {
    const periods = daySchedules[day].periods
    const newPeriod: PeriodTiming = {
      period: periods.length + 1,
      duration: defaultPeriodDuration // Use default duration for new periods
    }
    
    setDaySchedules({
      ...daySchedules,
      [day]: {
        ...daySchedules[day],
        periods: [...periods, newPeriod],
      },
    })
  }

  const handleRemovePeriod = (day: string, periodNumber: number) => {
    const newPeriods = daySchedules[day].periods
      .filter(p => p.period !== periodNumber)
      .map((p, idx) => ({ ...p, period: idx + 1 })) // Renumber periods

    setDaySchedules({
      ...daySchedules,
      [day]: {
        ...daySchedules[day],
        periods: newPeriods,
      },
    })
  }

  const handlePeriodChange = (day: string, periodNumber: number, value: number) => {
    const periods = daySchedules[day].periods.map(p => {
      if (p.period === periodNumber) {
        return { ...p, duration: Number(value) }
      }
      return p
    })

    setDaySchedules({
      ...daySchedules,
      [day]: {
        ...daySchedules[day],
        periods,
      },
    })
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
      defaultPeriodDuration,
      workingMondays,
      workingMondaySchedules,
      holidayDates,
      daySchedules,
    })
    alert("Settings would be saved in a real application")
  }

  return (
    <div className="space-y-6">
      {/* Default Period Duration Card */}
      <Card>
        <CardHeader>
          <CardTitle>Default Period Duration</CardTitle>
          <CardDescription>Set the default duration for regular class periods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              min="30"
              max="180"
              value={defaultPeriodDuration}
              onChange={(e) => setDefaultPeriodDuration(Number(e.target.value))}
              className="w-24"
            />
            <span>minutes</span>
          </div>
        </CardContent>
      </Card>

      {/* Break & Lunch Schedule Card */}
      <Card>
        <CardHeader>
          <CardTitle>Break & Lunch Schedule</CardTitle>
          <CardDescription>Configure break and lunch times for each day</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={daysOfWeek[0]} className="w-full">
            <TabsList className="w-full">
              {daysOfWeek.map((day) => (
                <TabsTrigger key={day} value={day} className="flex-1">
                  {day}
                </TabsTrigger>
              ))}
            </TabsList>
            {daysOfWeek.map((day) => (
              <TabsContent key={day} value={day} className="space-y-6">
                {/* Break & Lunch Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Break Time Settings */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Break Time</h3>
                    <div className="space-y-2">
                      <label className="text-sm">Period Number</label>
                      <Select
                        value={daySchedules[day].breakPeriod.toString()}
                        onValueChange={(value) => handleDayScheduleChange(day, "breakPeriod", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          {daySchedules[day].periods.map((period) => (
                            <SelectItem key={period.period} value={period.period.toString()}>
                              Period {period.period}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <label className="text-sm">Start Time</label>
                        <Input
                          type="time"
                          value={daySchedules[day].breakStartTime}
                          onChange={(e) => handleDayScheduleChange(day, "breakStartTime", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm">End Time</label>
                        <Input
                          type="time"
                          value={daySchedules[day].breakEndTime}
                          onChange={(e) => handleDayScheduleChange(day, "breakEndTime", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lunch Time Settings */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Lunch Time</h3>
                    <div className="space-y-2">
                      <label className="text-sm">Period Number</label>
                      <Select
                        value={daySchedules[day].lunchPeriod.toString()}
                        onValueChange={(value) => handleDayScheduleChange(day, "lunchPeriod", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          {daySchedules[day].periods.map((period) => (
                            <SelectItem key={period.period} value={period.period.toString()}>
                              Period {period.period}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <label className="text-sm">Start Time</label>
                        <Input
                          type="time"
                          value={daySchedules[day].lunchStartTime}
                          onChange={(e) => handleDayScheduleChange(day, "lunchStartTime", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm">End Time</label>
                        <Input
                          type="time"
                          value={daySchedules[day].lunchEndTime}
                          onChange={(e) => handleDayScheduleChange(day, "lunchEndTime", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Periods List */}
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Periods</h3>
                    <Button variant="outline" size="sm" onClick={() => handleAddPeriod(day)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Period
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {daySchedules[day].periods.map((period) => (
                      <div key={period.period} className="flex items-center space-x-2 bg-secondary p-2 rounded-md">
                        <span className="w-20 text-sm font-medium">Period {period.period}</span>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">Duration:</span>
                            <Input
                              type="number"
                              min="30"
                              max="180"
                              value={period.duration}
                              onChange={(e) => handlePeriodChange(day, period.period, Number(e.target.value))}
                              className="w-24"
                            />
                            <span className="text-sm">minutes</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {calculatePeriodStartTime(daySchedules[day], period.period)} - {calculatePeriodEndTime(daySchedules[day], period.period)}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePeriod(day, period.period)}
                          className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove Period</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Working Mondays Card */}
      {showMonday && (
        <Card>
          <CardHeader>
            <CardTitle>Working Mondays</CardTitle>
            <CardDescription>Configure special working Mondays and their schedules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                type="date"
                value={newWorkingMonday}
                onChange={(e) => setNewWorkingMonday(e.target.value)}
                className="w-full"
                min={new Date().toISOString().split('T')[0]}
              />
              <Button variant="outline" onClick={handleAddWorkingMonday}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {workingMondays
                .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
                .map((date) => (
                  <div key={date} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                    <div className="flex items-center space-x-4 flex-1">
                      <span className={isPastDate(date) ? "text-muted-foreground" : ""}>
                        {new Date(date).toLocaleDateString()}
                        {isPastDate(date) ? " (Past)" : ""}
                      </span>
                      {!isPastDate(date) && (
                        <Select
                          value={workingMondaySchedules[date] || "Tuesday"}
                          onValueChange={(value) => 
                            setWorkingMondaySchedules({ ...workingMondaySchedules, [date]: value })
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Use schedule from" />
                          </SelectTrigger>
                          <SelectContent>
                            {daysOfWeek.slice(1).map((day) => (
                              <SelectItem key={day} value={day}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    {!isPastDate(date) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveWorkingMonday(date)}
                        className="h-8 w-8 text-destructive hover:text-destructive-foreground hover:bg-destructive ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove Working Monday</span>
                      </Button>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

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
