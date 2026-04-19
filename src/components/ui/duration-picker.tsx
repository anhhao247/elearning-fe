"use client"

import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

import { Input } from "@/components/ui/input"

interface DurationPickerProps {
  value?: number // total seconds
  onChange: (value: number) => void
  disabled?: boolean
  className?: string
}

export function DurationPicker({ value = 0, onChange, disabled, className }: DurationPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [localText, setLocalText] = React.useState("00:00:00")
  const [isFocused, setIsFocused] = React.useState(false)

  // Convert seconds to H, M, S
  const hours = Math.floor(value / 3600)
  const minutes = Math.floor((value % 3600) / 60)
  const seconds = value % 60

  const formatWithZero = (num: number) => num.toString().padStart(2, "0")

  // Update local text only when NOT focused (to prevent cursor jumping while typing)
  React.useEffect(() => {
    if (!isFocused) {
      const formatted = `${formatWithZero(hours)}:${formatWithZero(minutes)}:${formatWithZero(seconds)}`
      setLocalText(formatted)
    }
  }, [hours, minutes, seconds, isFocused])

  const updateDuration = (h: number, m: number, s: number) => {
    const total = h * 3600 + m * 60 + s
    onChange(total)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    // Strip non-digits and limit to 6 characters
    const digits = raw.replace(/\D/g, "").slice(0, 6)
    
    // Auto-format as HH:MM:SS
    let formatted = digits
    if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}:${digits.slice(2)}`
    }
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4)}`
    }
    
    setLocalText(formatted)

    // Sync numeric value if we have a full or partial valid sequence
    const h = parseInt(digits.slice(0, 2)) || 0
    const m = parseInt(digits.slice(2, 4)) || 0
    const s = parseInt(digits.slice(4, 6)) || 0
    
    const total = h * 3600 + m * 60 + s
    if (total !== value) {
      onChange(total)
    }
  }

  const TimeColumn = ({ 
    max, 
    value: currentValue, 
    onChange: onColChange 
  }: { 
    max: number; 
    value: number; 
    onChange: (val: number) => void 
  }) => (
    <ScrollArea className="h-[200px] w-14 border-r last:border-r-0">
      <div className="flex flex-col p-1">
        {Array.from({ length: max + 1 }).map((_, i) => (
          <Button
            key={i}
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-full justify-center font-normal px-0",
              currentValue === i ? "bg-black text-white hover:bg-black hover:text-white" : "hover:bg-slate-100"
            )}
            onClick={() => onColChange(i)}
          >
            {formatWithZero(i)}
          </Button>
        ))}
      </div>
    </ScrollArea>
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full group">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10 group-focus-within:text-black transition-colors" />
          <Input
            value={localText}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false)
              const formatted = `${formatWithZero(hours)}:${formatWithZero(minutes)}:${formatWithZero(seconds)}`
              setLocalText(formatted)
            }}
            disabled={disabled}
            className={cn(
              "h-11 pl-10 border-slate-200 bg-white rounded-xl w-full hover:bg-slate-50 focus-visible:ring-black/5 shadow-sm transition-all",
              className
            )}
            placeholder="00:00:00"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-xl overflow-hidden shadow-xl border-slate-200" align="start">
        <div className="flex bg-white">
          <div className="flex flex-col">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-b bg-slate-50/50">Hrs</div>
            <TimeColumn max={23} value={hours} onChange={(h) => updateDuration(h, minutes, seconds)} />
          </div>
          <div className="flex flex-col">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-b bg-slate-50/50">Min</div>
            <TimeColumn max={59} value={minutes} onChange={(m) => updateDuration(hours, m, seconds)} />
          </div>
          <div className="flex flex-col">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-b bg-slate-50/50">Sec</div>
            <TimeColumn max={59} value={seconds} onChange={(s) => updateDuration(hours, minutes, s)} />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
