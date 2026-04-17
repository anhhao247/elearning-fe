"use client"

import { useEffect } from "react"
import { useForm, Controller, useFieldArray } from "react-hook-form"
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
import { Plus, Edit2, PlaySquare, FileText, HelpCircle, Clock, Trash2, PlusCircle } from "lucide-react"
import { DurationPicker } from "@/components/ui/duration-picker"
import { Checkbox } from "@/components/ui/checkbox"

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
  questions: z.array(z.object({
    questionText: z.string().min(1, "Vui lòng nhập nội dung câu hỏi"),
    questionType: z.enum(["SINGLE_CHOICE", "MULTI_CHOICE"]),
    options: z.array(z.object({
      optionText: z.string().min(1, "Vui lòng nhập nội dung đáp án"),
      isCorrect: z.boolean().default(false)
    })).min(2, "Cần ít nhất 2 đáp án")
  })).optional()
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

// ─── Quiz Questions Component ────────────────────────────────────────────────────

function QuizQuestions({ control, register, errors, watch, setValue }: any) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions"
  })

  return (
    <div className="space-y-6">
      {fields.map((field, index) => (
        <QuizQuestionItem 
          key={field.id} 
          index={index} 
          control={control} 
          register={register} 
          errors={errors} 
          onRemove={() => remove(index)} 
          watch={watch}
          setValue={setValue}
        />
      ))}
      <Button
        type="button"
        variant="outline"
        className="w-full border-dashed border-2 py-6 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
        onClick={() => append({ 
          questionText: "", 
          questionType: "SINGLE_CHOICE", 
          options: [{ optionText: "", isCorrect: false }, { optionText: "", isCorrect: false }] 
        })}
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Thêm câu hỏi
      </Button>
    </div>
  )
}

function QuizQuestionItem({ index, control, register, errors, onRemove, watch, setValue }: any) {
  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control,
    name: `questions.${index}.options`
  })

  const questionType = watch(`questions.${index}.questionType`)

  // Handle SINGLE_CHOICE exclusivity
  const handleCorrectChange = (optIdx: number, checked: boolean) => {
    if (questionType === "SINGLE_CHOICE" && checked) {
      // Uncheck all other options
      optionFields.forEach((_, i) => {
        if (i !== optIdx) {
          setValue(`questions.${index}.options.${i}.isCorrect`, false)
        }
      })
    }
    setValue(`questions.${index}.options.${optIdx}.isCorrect`, checked)
  }

  return (
    <div className="p-5 border border-slate-200 rounded-xl bg-white space-y-4">
      <div className="flex items-start justify-between">
        <h5 className="font-bold text-slate-700">Câu hỏi {index + 1}</h5>
        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-[1fr_150px] gap-4">
        <div className="space-y-2">
          <Label className="text-xs text-slate-500">Nội dung câu hỏi</Label>
          <Input 
            {...register(`questions.${index}.questionText`)} 
            placeholder="Nhập câu hỏi..."
          />
          {errors?.questions?.[index]?.questionText && (
            <p className="text-xs text-red-500">{errors.questions[index].questionText.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-slate-500">Loại câu hỏi</Label>
          <Controller
            control={control}
            name={`questions.${index}.questionType`}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SINGLE_CHOICE">Một đáp án</SelectItem>
                  <SelectItem value="MULTI_CHOICE">Nhiều đáp án</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-2 pl-4 border-l-2 border-slate-100">
        <Label className="text-xs text-slate-500">Các đáp án</Label>
        
        {optionFields.map((optField, optIdx) => (
          <div key={optField.id} className="flex items-center gap-3">
            <Controller
              control={control}
              name={`questions.${index}.options.${optIdx}.isCorrect`}
              render={({ field }) => (
                <Checkbox 
                  checked={field.value} 
                  onCheckedChange={(checked) => handleCorrectChange(optIdx, checked as boolean)}
                />
              )}
            />
            <Input 
              {...register(`questions.${index}.options.${optIdx}.optionText`)}
              placeholder={`Đáp án ${optIdx + 1}`}
              className="flex-1 h-9"
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-slate-400 hover:text-red-500"
              onClick={() => removeOption(optIdx)}
              disabled={optionFields.length <= 2}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {errors?.questions?.[index]?.options && typeof errors.questions[index].options.message === 'string' && (
          <p className="text-xs text-red-500">{errors.questions[index].options.message}</p>
        )}
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 mt-2 text-xs"
          onClick={() => appendOption({ optionText: "", isCorrect: false })}
        >
          <Plus className="h-3 w-3 mr-1" /> Thêm đáp án
        </Button>
      </div>
    </div>
  )
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────

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
          passPercent: 80,
          questions: [
            {
              questionText: "",
              questionType: "SINGLE_CHOICE",
              options: [
                { optionText: "", isCorrect: false },
                { optionText: "", isCorrect: false }
              ]
            }
          ]
        })
      }
    }
  }, [open, initialData, reset])

  const currentType = watch("contentType")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] p-0 overflow-hidden bg-white flex flex-col max-h-[90vh] h-full shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
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
        
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
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
                    Duration
                  </Label>
                  <Controller
                    control={control}
                    name="duration"
                    render={({ field }) => (
                      <DurationPicker 
                        value={field.value} 
                        onChange={field.onChange} 
                      />
                    )}
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
                    <Label htmlFor="platformVideoId" className="text-xs text-slate-500 uppercase tracking-wider">Video URL</Label>
                    <Input
                      id="platformVideoId"
                      {...register("platformVideoId", {
                        onChange: (e) => {
                          const value = e.target.value
                          if (!value) return
                          
                          // YouTube URL Extraction logic
                          try {
                            if (value.includes("youtube.com") || value.includes("youtu.be")) {
                              const url = new URL(value)
                              let id = ""
                              
                              if (url.hostname.includes("youtube.com")) {
                                if (url.pathname.includes("/watch")) {
                                  // Handles ?v=ID&params
                                  const vMatch = value.match(/[?&]v=([^#\s]+)/)
                                  if (vMatch) id = vMatch[1]
                                } else if (url.pathname.includes("/embed/")) {
                                  // Handles /embed/ID?params
                                  id = url.pathname.replace("/embed/", "") + url.search
                                }
                              } else if (url.hostname.includes("youtu.be")) {
                                // Handles youtu.be/ID?params
                                id = url.pathname.slice(1) + url.search
                              }
                              
                              if (id) {
                                setValue("platformVideoId", id)
                              }
                            }
                          } catch (err) {
                            // Invalid URL, ignore
                          }
                        }
                      })}
                      placeholder=""
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
                
                {/* Questions Section */}
                <div className="pt-4 mt-6 border-t border-slate-200 space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                      Câu hỏi & Đáp án
                    </h4>
                  </div>
                  
                  <QuizQuestions control={control} register={register} errors={errors} watch={watch} setValue={setValue} />
                </div>
              </div>
            )}
          </div> {/* Closes pt-2 */}
        </div> {/* Closes flex-1 overflow-y-auto */}

          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between shrink-0">
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
