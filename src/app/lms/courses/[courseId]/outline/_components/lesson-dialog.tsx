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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Plus, Edit2, PlaySquare, FileText, HelpCircle } from "lucide-react"

const lessonSchema = z.object({
  title: z.string().min(1, "Tên bài giảng là bắt buộc"),
  contentType: z.enum(["VIDEO", "READING", "QUIZ"]),
  isPublish: z.boolean().default(true),
  
  // VIDEO fields
  platform: z.enum(["YOUTUBE", "VIMEO"]).optional(),
  platformVideoId: z.string().optional(),
  
  // Shared by VIDEO & QUIZ
  duration: z.coerce.number().optional(),

  // READING fields
  body: z.string().optional(),

  // QUIZ fields
  description: z.string().optional(),
  passPercent: z.coerce.number().optional(),
})

type LessonFormValues = z.infer<typeof lessonSchema>

interface LessonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: LessonFormValues) => void
  initialData?: LessonFormValues
  isSubmitting?: boolean
  mode: "create" | "edit"
}

export function LessonDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isSubmitting,
  mode
}: LessonDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors }
  } = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema) as any,
    defaultValues: initialData || { title: "", contentType: "READING", isPublish: true }
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset(initialData)
      } else {
        reset({ 
          title: "", 
          contentType: "VIDEO", 
          isPublish: true,
          platform: "YOUTUBE",
          platformVideoId: "",
          duration: 0,
          body: "",
          description: "",
          passPercent: 80
        })
      }
    }
  }, [open, initialData, reset])

  const currentType = watch("contentType")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden bg-white">
        <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-900">
            {mode === "create" ? (
              <><Plus className="w-5 h-5"/> Add New Lesson</>
            ) : (
              <><Edit2 className="w-5 h-5"/> Edit Lesson</>
            )}
          </DialogTitle>
          <p className="text-sm text-slate-500 mt-1 !mb-0 font-medium">
            {mode === "create" 
              ? "Create a new lesson for this chapter." 
              : "Update the details and content of this lesson."}
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-6">
          {/* Base Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-semibold text-slate-700">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="e.g., Introduction to the course"
                className="h-11"
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="font-semibold text-slate-700">
                  Content Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch("contentType")}
                  onValueChange={(val) => setValue("contentType", val as any)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Chọn loại bài giảng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIDEO"><span className="flex items-center gap-2"><PlaySquare className="w-4 h-4"/> Video</span></SelectItem>
                    <SelectItem value="READING"><span className="flex items-center gap-2"><FileText className="w-4 h-4"/> Reading</span></SelectItem>
                    <SelectItem value="QUIZ"><span className="flex items-center gap-2"><HelpCircle className="w-4 h-4"/> Quiz</span></SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(currentType === "VIDEO" || currentType === "QUIZ") && (
                <div className="space-y-2">
                  <Label htmlFor="duration" className="font-semibold text-slate-700">
                    Duration (seconds)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    {...register("duration")}
                    placeholder="e.g., 360"
                    className="h-11"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            {currentType === "VIDEO" && (
              <div className="space-y-4 p-5 bg-slate-50 border border-slate-100 rounded-xl">
                <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                  <PlaySquare className="w-4 h-4 text-blue-500" /> Lesson Video Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500 uppercase tracking-wider">Platform</Label>
                    <Select
                      value={watch("platform")}
                      onValueChange={(val) =>setValue("platform", val as "YOUTUBE" | "VIMEO")}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Chọn nền tảng" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YOUTUBE">YouTube</SelectItem>
                        <SelectItem value="VIMEO">Vimeo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="platformVideoId" className="text-xs text-slate-500 uppercase tracking-wider">Video ID / Key</Label>
                    <Input
                      id="platformVideoId"
                      {...register("platformVideoId")}
                      placeholder="e.g., dQw4w9WgXcQ"
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentType === "READING" && (
              <div className="space-y-3">
                <Label htmlFor="body" className="font-semibold text-slate-700">Reading Content</Label>
                <Controller
                  control={control}
                  name="body"
                  render={({ field }) => (
                    <RichTextEditor 
                      value={field.value || ""} 
                      onChange={field.onChange} 
                      placeholder="Start writing the lesson content here..."
                    />
                  )}
                />
              </div>
            )}

            {currentType === "QUIZ" && (
              <div className="space-y-4 p-5 bg-slate-50 border border-slate-100 rounded-xl">
                <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                   <HelpCircle className="w-4 h-4 text-green-500" /> Quiz Details
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xs text-slate-500 uppercase tracking-wider">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Briefly describe what this quiz covers..."
                    className="resize-none bg-white min-h-[80px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passPercent" className="text-xs text-slate-500 uppercase tracking-wider">Passing Score (%)</Label>
                    <Input
                      id="passPercent"
                      type="number"
                      {...register("passPercent")}
                      placeholder="80"
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between py-4 border-t border-slate-100 mt-6">
            <div className="flex items-center space-x-3">
              <Controller
                control={control}
                name="isPublish"
                render={({ field }) => (
                  <Switch
                    id="isPublish"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="isPublish" className="text-sm font-semibold cursor-pointer text-slate-700">
                Published
              </Label>
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="font-semibold"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-black text-white hover:bg-black/90 font-semibold px-6">
                {isSubmitting ? "Saving..." : mode === "create" ? "Add Lesson" : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
