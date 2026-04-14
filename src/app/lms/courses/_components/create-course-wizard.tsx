"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Video,
  FileText,
  HelpCircle,
  GripVertical,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useCreateCourse,
  useCreateModule,
  useCreateContent,
  useUpdateContentDetails,
  useCategories,
} from "@/hooks/queries/use-instructor"
import { cn } from "@/lib/utils"

// ─── Zod Schema ──────────────────────────────────────────────────────────────

const videoDetailsSchema = z.object({
  platform: z.enum(["YOUTUBE", "VIMEO"]),
  platformVideoId: z.string().min(1, "Video ID là bắt buộc"),
  duration: z.coerce.number().min(1, "Thời lượng phải lớn hơn 0"),
})

const readingDetailsSchema = z.object({
  body: z.string().min(1, "Nội dung bài đọc là bắt buộc"),
})

const quizDetailsSchema = z.object({
  description: z.string().min(1, "Mô tả quiz là bắt buộc"),
  duration: z.coerce.number().min(1, "Thời lượng phải lớn hơn 0"),
  passPercent: z.coerce.number().min(1).max(100, "Phần trăm đạt phải từ 1-100"),
})

const contentSchema = z.object({
  title: z.string().min(1, "Tên nội dung là bắt buộc"),
  contentType: z.enum(["VIDEO", "READING", "QUIZ"]),
  videoDetails: videoDetailsSchema.optional(),
  readingDetails: readingDetailsSchema.optional(),
  quizDetails: quizDetailsSchema.optional(),
})

const moduleSchema = z.object({
  title: z.string().min(1, "Tên module là bắt buộc"),
  description: z.string().min(1, "Mô tả module là bắt buộc"),
  contents: z.array(contentSchema).min(1, "Mỗi module cần ít nhất 1 nội dung"),
})

const courseSchema = z.object({
  title: z.string().min(3, "Tên khóa học tối thiểu 3 ký tự"),
  description: z.string().min(10, "Mô tả tối thiểu 10 ký tự"),
  categoryId: z.coerce.number().int().positive("Vui lòng chọn danh mục"),
  price: z.coerce.number().min(0, "Giá không được âm"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  modules: z.array(moduleSchema).min(1, "Cần ít nhất 1 module"),
})

export type CourseFormValues = z.infer<typeof courseSchema>

// ─── Step Indicator ───────────────────────────────────────────────────────────

const STEPS = ["Thông tin cơ bản", "Modules & Nội dung", "Xác nhận"]

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((step, idx) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all",
              idx < currentStep
                ? "bg-black text-white"
                : idx === currentStep
                ? "bg-black text-white ring-4 ring-black/20"
                : "bg-slate-100 text-slate-400"
            )}
          >
            {idx < currentStep ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
          </div>
          <span
            className={cn(
              "text-sm font-medium hidden sm:block",
              idx === currentStep ? "text-black" : "text-slate-400"
            )}
          >
            {step}
          </span>
          {idx < STEPS.length - 1 && (
            <div
              className={cn(
                "h-px flex-1 w-8 mx-2",
                idx < currentStep ? "bg-black" : "bg-slate-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Content Type Icon ────────────────────────────────────────────────────────

function ContentTypeIcon({ type }: { type: string }) {
  if (type === "VIDEO") return <Video className="w-4 h-4 text-blue-500" />
  if (type === "READING") return <FileText className="w-4 h-4 text-green-500" />
  return <HelpCircle className="w-4 h-4 text-purple-500" />
}

// ─── Content Details Fields ───────────────────────────────────────────────────

function ContentDetailsFields({
  moduleIdx,
  contentIdx,
  contentType,
  register,
  errors,
}: {
  moduleIdx: number
  contentIdx: number
  contentType: string
  register: ReturnType<typeof useForm<CourseFormValues>>["register"]
  errors: ReturnType<typeof useForm<CourseFormValues>>["formState"]["errors"]
}) {
  const moduleErrors = errors.modules?.[moduleIdx]
  const contentErrors = (moduleErrors?.contents as any)?.[contentIdx]

  if (contentType === "VIDEO") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <div>
          <Label className="text-xs text-slate-600">Platform</Label>
          <select
            {...register(`modules.${moduleIdx}.contents.${contentIdx}.videoDetails.platform` as const)}
            className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-1 focus:ring-slate-300"
            defaultValue="YOUTUBE"
          >
            <option value="YOUTUBE">YouTube</option>
            <option value="VIMEO">Vimeo</option>
          </select>
        </div>
        <div>
          <Label className="text-xs text-slate-600">Video ID</Label>
          <Input
            {...register(`modules.${moduleIdx}.contents.${contentIdx}.videoDetails.platformVideoId`)}
            placeholder="dQw4w9WgXcQ"
            className="mt-1 h-9 bg-white border-slate-200"
          />
          {contentErrors?.videoDetails?.platformVideoId && (
            <p className="text-xs text-red-500 mt-1">{contentErrors.videoDetails.platformVideoId.message}</p>
          )}
        </div>
        <div>
          <Label className="text-xs text-slate-600">Thời lượng (giây)</Label>
          <Input
            type="number"
            {...register(`modules.${moduleIdx}.contents.${contentIdx}.videoDetails.duration`)}
            placeholder="1200"
            className="mt-1 h-9 bg-white border-slate-200"
          />
          {contentErrors?.videoDetails?.duration && (
            <p className="text-xs text-red-500 mt-1">{contentErrors.videoDetails.duration.message}</p>
          )}
        </div>
      </div>
    )
  }

  if (contentType === "READING") {
    return (
      <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
        <Label className="text-xs text-slate-600">Nội dung bài đọc</Label>
        <Textarea
          {...register(`modules.${moduleIdx}.contents.${contentIdx}.readingDetails.body`)}
          placeholder="Viết nội dung bài đọc tại đây..."
          className="mt-1 bg-white border-slate-200 min-h-[100px] resize-y"
        />
        {contentErrors?.readingDetails?.body && (
          <p className="text-xs text-red-500 mt-1">{contentErrors.readingDetails.body.message}</p>
        )}
      </div>
    )
  }

  if (contentType === "QUIZ") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
        <div className="md:col-span-3">
          <Label className="text-xs text-slate-600">Mô tả Quiz</Label>
          <Input
            {...register(`modules.${moduleIdx}.contents.${contentIdx}.quizDetails.description`)}
            placeholder="Mô tả về nội dung quiz..."
            className="mt-1 h-9 bg-white border-slate-200"
          />
          {contentErrors?.quizDetails?.description && (
            <p className="text-xs text-red-500 mt-1">{contentErrors.quizDetails.description.message}</p>
          )}
        </div>
        <div>
          <Label className="text-xs text-slate-600">Thời lượng (giây)</Label>
          <Input
            type="number"
            {...register(`modules.${moduleIdx}.contents.${contentIdx}.quizDetails.duration`)}
            placeholder="600"
            className="mt-1 h-9 bg-white border-slate-200"
          />
        </div>
        <div>
          <Label className="text-xs text-slate-600">Tỉ lệ đạt (%)</Label>
          <Input
            type="number"
            {...register(`modules.${moduleIdx}.contents.${contentIdx}.quizDetails.passPercent`)}
            placeholder="70"
            className="mt-1 h-9 bg-white border-slate-200"
          />
        </div>
      </div>
    )
  }

  return null
}

// ─── Main Wizard ───────────────────────────────────────────────────────────────

interface CreateCourseWizardProps {
  onSuccess: () => void
  onCancel: () => void
}

export function CreateCourseWizard({ onSuccess, onCancel }: CreateCourseWizardProps) {
  const [step, setStep] = useState(0)
  const [expandedModules, setExpandedModules] = useState<number[]>([0])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: categories = [], isLoading: loadingCategories } = useCategories()
  const createCourseMutation = useCreateCourse()
  const createModuleMutation = useCreateModule()
  const createContentMutation = useCreateContent()
  const updateDetailsMutation = useUpdateContentDetails()

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      categoryId: 0,
      price: 0,
      level: "BEGINNER",
      modules: [
        {
          title: "",
          description: "",
          contents: [{ title: "", contentType: "VIDEO" }],
        },
      ],
    },
  })

  const {
    fields: moduleFields,
    append: appendModule,
    remove: removeModule,
  } = useFieldArray({ control, name: "modules" })

  const watchedModules = watch("modules")

  const toggleModule = (idx: number) => {
    setExpandedModules((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    )
  }

  const handleNextStep = async () => {
    let valid = false
    if (step === 0) {
      valid = await trigger(["title", "description", "categoryId", "price", "level"])
    } else if (step === 1) {
      valid = await trigger(["modules"])
    }
    if (valid) setStep((s) => s + 1)
  }

  const onSubmit = async (data: CourseFormValues) => {
    setIsSubmitting(true)
    try {
      // Step 1: Create Course
      const course = await createCourseMutation.mutateAsync({
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        price: data.price,
        level: data.level,
      })

      // Step 2: Create Modules & Contents
      for (let mIdx = 0; mIdx < data.modules.length; mIdx++) {
        const mod = data.modules[mIdx]
        const createdModule = await createModuleMutation.mutateAsync({
          courseId: course.id,
          payload: {
            title: mod.title,
            description: mod.description,
            moduleOrder: mIdx + 1,
          },
        })

        // Step 3: Create Contents for each module
        for (let cIdx = 0; cIdx < mod.contents.length; cIdx++) {
          const content = mod.contents[cIdx]
          const createdContent = await createContentMutation.mutateAsync({
            moduleId: createdModule.id,
            payload: {
              title: content.title,
              contentType: content.contentType,
              contentOrder: cIdx + 1,
            },
          })

          // Step 4: Update content details
          let detailPayload = null
          if (content.contentType === "VIDEO" && content.videoDetails) {
            detailPayload = {
              platform: content.videoDetails.platform,
              platformVideoId: content.videoDetails.platformVideoId,
              duration: content.videoDetails.duration,
            }
          } else if (content.contentType === "READING" && content.readingDetails) {
            detailPayload = { body: content.readingDetails.body }
          } else if (content.contentType === "QUIZ" && content.quizDetails) {
            detailPayload = {
              description: content.quizDetails.description,
              duration: content.quizDetails.duration,
              passPercent: content.quizDetails.passPercent,
            }
          }

          if (detailPayload) {
            await updateDetailsMutation.mutateAsync({
              contentId: createdContent.id,
              payload: detailPayload as any,
            })
          }
        }
      }

      toast.success("🎉 Tạo khóa học thành công!", {
        description: `Khóa học "${course.title}" đã được tạo thành công.`,
      })
      onSuccess()
    } catch (error: any) {
      toast.error("Tạo khóa học thất bại", {
        description: error?.response?.data?.message || "Vui lòng thử lại sau.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const levelLabels: Record<string, string> = {
    BEGINNER: "Cơ bản",
    INTERMEDIATE: "Trung cấp",
    ADVANCED: "Nâng cao",
  }

  return (
    <div className="flex flex-col h-full">
      <StepIndicator currentStep={step} />

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
        {/* ── Step 0: Basic Info ── */}
        {step === 0 && (
          <div className="space-y-5 flex-1">
            <div>
              <Label htmlFor="course-title" className="text-sm font-medium">
                Tên khóa học <span className="text-red-500">*</span>
              </Label>
              <Input
                id="course-title"
                {...register("title")}
                placeholder="Vd: Lập trình Java cơ bản"
                className="mt-1.5 border-slate-200 h-10"
              />
              {errors.title && (
                <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="course-desc" className="text-sm font-medium">
                Mô tả <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="course-desc"
                {...register("description")}
                placeholder="Mô tả chi tiết về nội dung và mục tiêu khóa học..."
                className="mt-1.5 border-slate-200 min-h-[100px] resize-y"
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">
                  Danh mục <span className="text-red-500">*</span>
                </Label>
                <Select
                  onValueChange={(val) => setValue("categoryId", Number(val))}
                  disabled={loadingCategories}
                >
                  <SelectTrigger className="mt-1.5 border-slate-200 h-10">
                    <SelectValue placeholder={loadingCategories ? "Đang tải..." : "Chọn danh mục"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-xs text-red-500 mt-1">{errors.categoryId.message}</p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Cấp độ <span className="text-red-500">*</span>
                </Label>
                <Select
                  defaultValue="BEGINNER"
                  onValueChange={(val) =>
                    setValue("level", val as "BEGINNER" | "INTERMEDIATE" | "ADVANCED")
                  }
                >
                  <SelectTrigger className="mt-1.5 border-slate-200 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Cơ bản</SelectItem>
                    <SelectItem value="INTERMEDIATE">Trung cấp</SelectItem>
                    <SelectItem value="ADVANCED">Nâng cao</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="course-price" className="text-sm font-medium">
                  Giá (VNĐ) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="course-price"
                  type="number"
                  {...register("price")}
                  placeholder="0"
                  className="mt-1.5 border-slate-200 h-10"
                />
                <p className="text-xs text-slate-400 mt-1">Nhập 0 nếu miễn phí</p>
                {errors.price && (
                  <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 1: Modules ── */}
        {step === 1 && (
          <div className="space-y-4 flex-1">
            {moduleFields.map((modField, mIdx) => {
              const isExpanded = expandedModules.includes(mIdx)
              return (
                <ModuleBuilder
                  key={modField.id}
                  mIdx={mIdx}
                  isExpanded={isExpanded}
                  onToggle={() => toggleModule(mIdx)}
                  onRemove={() => removeModule(mIdx)}
                  canRemove={moduleFields.length > 1}
                  register={register}
                  control={control}
                  watch={watch}
                  setValue={setValue}
                  errors={errors}
                  watchedModule={watchedModules[mIdx]}
                />
              )
            })}

            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed border-slate-300 h-11 text-slate-500 hover:text-black hover:border-black transition-colors"
              onClick={() => {
                appendModule({ title: "", description: "", contents: [{ title: "", contentType: "VIDEO" }] })
                setExpandedModules((prev) => [...prev, moduleFields.length])
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> Thêm Module
            </Button>

            {errors.modules?.root && (
              <p className="text-xs text-red-500">{errors.modules.root.message}</p>
            )}
          </div>
        )}

        {/* ── Step 2: Confirm ── */}
        {step === 2 && (
          <div className="space-y-4 flex-1">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
              <h3 className="font-bold text-lg">{watch("title")}</h3>
              <p className="text-slate-500 text-sm">{watch("description")}</p>
              <div className="flex gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1 text-xs bg-white border border-slate-200 rounded-full px-3 py-1 text-slate-600">
                  Cấp độ: {levelLabels[watch("level")]}
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-white border border-slate-200 rounded-full px-3 py-1 text-slate-600">
                  Giá: {watch("price") === 0 ? "Miễn phí" : `${Number(watch("price")).toLocaleString("vi-VN")} đ`}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {watchedModules?.map((mod, mIdx) => (
                <div key={mIdx} className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="font-semibold text-sm mb-2">
                    Module {mIdx + 1}: {mod.title}
                  </div>
                  <div className="space-y-1.5 ml-4">
                    {mod.contents?.map((content, cIdx) => (
                      <div key={cIdx} className="flex items-center gap-2 text-sm text-slate-600">
                        <ContentTypeIcon type={content.contentType} />
                        <span>
                          {cIdx + 1}. {content.title}
                        </span>
                        <span className="text-xs text-slate-400 ml-auto">{content.contentType}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="border border-amber-200 rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
              ⚠️ Sau khi tạo, khóa học sẽ ở trạng thái <strong>Draft</strong>. Bạn cần publish để học viên có thể thấy.
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
          <div>
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                disabled={isSubmitting}
              >
                Quay lại
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
              className="text-slate-500"
            >
              Hủy
            </Button>
            {step < 2 ? (
              <Button
                type="button"
                onClick={handleNextStep}
                className="bg-black hover:bg-black/90 text-white px-6"
              >
                Tiếp theo
              </Button>
            ) : (
              <Button
                type="submit"
                className="bg-black hover:bg-black/90 text-white px-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang tạo...
                  </>
                ) : (
                  "Tạo khóa học"
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

// ─── Module Builder Sub-component ─────────────────────────────────────────────

interface ModuleBuilderProps {
  mIdx: number
  isExpanded: boolean
  onToggle: () => void
  onRemove: () => void
  canRemove: boolean
  register: ReturnType<typeof useForm<CourseFormValues>>["register"]
  control: ReturnType<typeof useForm<CourseFormValues>>["control"]
  watch: ReturnType<typeof useForm<CourseFormValues>>["watch"]
  setValue: ReturnType<typeof useForm<CourseFormValues>>["setValue"]
  errors: ReturnType<typeof useForm<CourseFormValues>>["formState"]["errors"]
  watchedModule: CourseFormValues["modules"][0] | undefined
}

function ModuleBuilder({
  mIdx,
  isExpanded,
  onToggle,
  onRemove,
  canRemove,
  register,
  control,
  watch,
  setValue,
  errors,
  watchedModule,
}: ModuleBuilderProps) {
  const {
    fields: contentFields,
    append: appendContent,
    remove: removeContent,
  } = useFieldArray({ control, name: `modules.${mIdx}.contents` })

  const moduleErrors = errors.modules?.[mIdx]
  const moduleTitle = watch(`modules.${mIdx}.title`) || `Module ${mIdx + 1}`

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <GripVertical className="w-4 h-4 text-slate-300" />
          <span className="font-semibold text-sm">
            Module {mIdx + 1}: {moduleTitle || "Chưa đặt tên"}
          </span>
          <span className="text-xs text-slate-400">
            ({contentFields.length} nội dung)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-slate-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium text-slate-600">
                Tên Module <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register(`modules.${mIdx}.title`)}
                placeholder="Vd: Module 1: Giới thiệu Java"
                className="mt-1 h-9 border-slate-200"
              />
              {moduleErrors?.title && (
                <p className="text-xs text-red-500 mt-1">{moduleErrors.title.message}</p>
              )}
            </div>
            <div>
              <Label className="text-xs font-medium text-slate-600">
                Mô tả Module <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register(`modules.${mIdx}.description`)}
                placeholder="Mô tả ngắn về nội dung module..."
                className="mt-1 h-9 border-slate-200"
              />
              {moduleErrors?.description && (
                <p className="text-xs text-red-500 mt-1">{moduleErrors.description.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Nội dung
              </Label>
            </div>

            {contentFields.map((contentField, cIdx) => {
              const contentType = watch(`modules.${mIdx}.contents.${cIdx}.contentType`)
              return (
                <div
                  key={contentField.id}
                  className="border border-slate-200 rounded-lg p-3 bg-slate-50"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-1.5 mt-2">
                      <GripVertical className="w-3.5 h-3.5 text-slate-300" />
                      <ContentTypeIcon type={contentType} />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          {...register(`modules.${mIdx}.contents.${cIdx}.title`)}
                          placeholder={`Tên nội dung ${cIdx + 1}...`}
                          className="flex-1 h-9 bg-white border-slate-200"
                        />
                        <Select
                          defaultValue={contentType}
                          onValueChange={(val) =>
                            setValue(
                              `modules.${mIdx}.contents.${cIdx}.contentType`,
                              val as "VIDEO" | "READING" | "QUIZ"
                            )
                          }
                        >
                          <SelectTrigger className="w-36 h-9 bg-white border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="VIDEO">📹 Video</SelectItem>
                            <SelectItem value="READING">📄 Reading</SelectItem>
                            <SelectItem value="QUIZ">📝 Quiz</SelectItem>
                          </SelectContent>
                        </Select>
                        {contentFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0"
                            onClick={() => removeContent(cIdx)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>

                      <ContentDetailsFields
                        moduleIdx={mIdx}
                        contentIdx={cIdx}
                        contentType={contentType}
                        register={register}
                        errors={errors}
                      />
                    </div>
                  </div>
                </div>
              )
            })}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full h-9 border-dashed border-slate-300 text-slate-500 hover:text-black hover:border-black text-xs"
              onClick={() =>
                appendContent({ title: "", contentType: "VIDEO" })
              }
            >
              <Plus className="w-3 h-3 mr-1" /> Thêm nội dung
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
