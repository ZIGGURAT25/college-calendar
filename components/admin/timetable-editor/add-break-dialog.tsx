"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { type TimetableEntry } from "@/lib/data"
import { Clock, Coffee, Utensils } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddBreakDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Omit<TimetableEntry, "id">) => void
  selectedDay: string
  periodTimes: any[]
}

export function AddBreakDialog({
  open,
  onOpenChange,
  onSubmit,
  selectedDay,
  periodTimes,
}: AddBreakDialogProps) {
  const [formData, setFormData] = useState({
    periodNumber: "1",
    breakType: "break", // "break" or "lunch"
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      day: selectedDay as TimetableEntry["day"],
      periodNumber: parseInt(formData.periodNumber),
      subjectId: 0, // Special ID for breaks
      facultyId: null,
      room: "",
      isElective: false,
      slotsUsed: 1,
      isBreak: formData.breakType === "break",
      isLunch: formData.breakType === "lunch",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Break Period</DialogTitle>
          <DialogDescription>
            Schedule a break or lunch period for {selectedDay}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="periodNumber" className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Period
            </Label>
            <Select
              value={formData.periodNumber}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, periodNumber: value }))
              }
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

          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              {formData.breakType === "break" ? (
                <Coffee className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Utensils className="h-4 w-4 text-muted-foreground" />
              )}
              Break Type
            </Label>
            <RadioGroup
              value={formData.breakType}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, breakType: value }))
              }
              className="grid grid-cols-2 gap-4"
            >
              <div className={cn(
                "flex flex-col items-center justify-center space-y-2 rounded-lg border-2 p-4 cursor-pointer transition-all",
                formData.breakType === "break" 
                  ? "border-primary bg-primary/5" 
                  : "border-muted hover:border-primary/50"
              )}>
                <Coffee className="h-6 w-6 mb-2" />
                <RadioGroupItem value="break" id="break" className="sr-only" />
                <Label htmlFor="break" className="cursor-pointer font-medium">Short Break</Label>
                <span className="text-xs text-muted-foreground">15-20 minutes</span>
              </div>
              <div className={cn(
                "flex flex-col items-center justify-center space-y-2 rounded-lg border-2 p-4 cursor-pointer transition-all",
                formData.breakType === "lunch" 
                  ? "border-primary bg-primary/5" 
                  : "border-muted hover:border-primary/50"
              )}>
                <Utensils className="h-6 w-6 mb-2" />
                <RadioGroupItem value="lunch" id="lunch" className="sr-only" />
                <Label htmlFor="lunch" className="cursor-pointer font-medium">Lunch Break</Label>
                <span className="text-xs text-muted-foreground">30-45 minutes</span>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Break</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 