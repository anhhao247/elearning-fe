"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const moduleSchema = z.object({
  title: z.string().min(1, "Tên chương là bắt buộc"),
  description: z.string().min(1, "Mô tả chương là bắt buộc"),
  isPublish: z.boolean().default(true).optional(),
})

type ModuleFormValues = z.infer<typeof moduleSchema>

interface ModuleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ModuleFormValues) => void
  initialData?: ModuleFormValues
  isSubmitting?: boolean
  mode: "create" | "edit"
}

export function ModuleDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isSubmitting,
  mode
}: ModuleDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleSchema) as any,
    defaultValues: initialData || { title: "", description: "", isPublish: true }
  })

  useEffect(() => {
    if (open) {
      reset(initialData || { title: "", description: "", isPublish: true })
    }
  }, [open, initialData, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Thêm chương mới" : "Chỉnh sửa chương"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tên chương</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Vd: Giới thiệu về học máy"
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả ngắn</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Tóm tắt nội dung chương..."
              className="resize-none"
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-black text-white hover:bg-black/90">
              {isSubmitting ? "Đang lưu..." : mode === "create" ? "Tạo chương" : "Cập nhật"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
