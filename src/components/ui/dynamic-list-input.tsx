"use client"

import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface DynamicListInputProps {
  label: string
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
}

export function DynamicListInput({ label, items, onChange, placeholder }: DynamicListInputProps) {
  const addItem = () => {
    onChange([...items, ""])
  }

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    onChange(newItems)
  }

  const updateItem = (index: number, value: string) => {
    const newItems = [...items]
    newItems[index] = value
    onChange(newItems)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-slate-700">{label}</Label>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-dashed border-slate-300 text-slate-400 hover:text-black hover:border-black transition-all"
          onClick={addItem}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={placeholder || `Nhập mục ${index + 1}...`}
              className="h-10 rounded-xl bg-white border-slate-200 focus-visible:ring-black/10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl shrink-0"
              onClick={() => removeItem(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-slate-400 italic">Chưa có mục nào được thêm.</p>
        )}
      </div>
    </div>
  )
}
