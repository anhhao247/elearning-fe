"use client"

import { useEffect, useState } from "react"
import { useForm, Controller, FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import {
  FileText,
  Loader2,
  Image as ImageIcon,
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
import { useRouter } from "next/navigation"
import {
  useCreateCourse,
  useUpdateCourse,
  useCourse,
  useCategories,
} from "@/hooks/queries/use-instructor"
import { ImageUpload } from "@/components/ui/image-upload"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { DynamicListInput } from "@/components/ui/dynamic-list-input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

// ─── Zod Schema ──────────────────────────────────────────────────────────────

const courseSchema = z.object({
  title: z.string().min(3, "Tên khóa học tối thiểu 3 ký tự"),
  description: z.string().min(10, "Mô tả tối thiểu 10 ký tự"),
  categoryId: z.number({
    message: "Vui lòng chọn danh mục",
  }).int().positive("Vui lòng chọn danh mục"),
  price: z.number().min(0, "Giá không được âm"),
  oldPrice: z.number().min(0, "Giá không được âm").optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"], {
    message: "Vui lòng chọn cấp độ phù hợp",
  }),
  thumbnail: z.string({
    message: "Vui lòng tải lên ảnh bìa",
  }).url("Vui lòng tải lên ảnh bìa"),
  overview: z.string().min(10, "Nội dung tổng quan tối thiểu 10 ký tự"),
  benefits: z.array(z.string().min(1)).min(1, "Cần ít nhất 1 lợi ích"),
  requirements: z.array(z.string().min(1)).min(1, "Cần ít nhất 1 yêu cầu"),
  technique: z.array(z.string().min(1)).min(1, "Cần ít nhất 1 kỹ thuật chuyên môn"),
  isFree: z.boolean(),
  isPublish: z.boolean(),
})

export type CourseFormValues = z.infer<typeof courseSchema>

// ─── Main Wizard ───────────────────────────────────────────────────────────────

interface CreateCourseWizardProps {
  courseId?: number | string
  onSuccess: () => void
  onCancel: () => void
}

export function CreateCourseWizard({ courseId, onSuccess, onCancel }: CreateCourseWizardProps) {
  const router = useRouter()
  const isEditing = !!courseId
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: categories = [], isLoading: loadingCategories } = useCategories()
  const { data: course, isLoading: loadingCourse } = useCourse(courseId || "")
  
  const createCourseMutation = useCreateCourse()
  const updateCourseMutation = useUpdateCourse()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      thumbnail: "",
      overview: "",
      benefits: [""],
      requirements: [""],
      technique: [""],
      price: 0,
      oldPrice: 0,
      isFree: false,
      isPublish: true,
      level: "BEGINNER",
    },
  })


  // Populating form when editing
  useEffect(() => {
    if (isEditing && course) {
      const mappedCategoryId = Number(course.categoryId || course.category?.id);
      const mappedLevel = String(course.level || "BEGINNER").toUpperCase().trim();

      const processedData = {
        title: course.title || "",
        description: course.description || "",
        categoryId: mappedCategoryId || undefined,
        price: course.price || 0,
        oldPrice: course.oldPrice || 0,
        level: mappedLevel as any,
        thumbnail: course.thumbnail || "",
        overview: course.overview || "",
        benefits: (course.benefits && course.benefits.length > 0) ? course.benefits : [""],
        requirements: (course.requirements && course.requirements.length > 0) ? course.requirements : [""],
        technique: (course.technique && course.technique.length > 0) ? course.technique : [""],
        isFree: !!course.isFree,
        isPublish: !!course.isPublish,
      };

      console.log("[Wizard] Resetting form with data:", processedData);
      reset(processedData);
    }
  }, [isEditing, course, reset])

  const onSubmit = async (data: CourseFormValues) => {
    setIsSubmitting(true)
    try {
      const payload = {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        price: data.price,
        oldPrice: data.oldPrice,
        level: data.level,
        thumbnail: data.thumbnail,
        overview: data.overview,
        benefits: data.benefits.filter((item) => item.trim() !== ""),
        requirements: data.requirements.filter((item) => item.trim() !== ""),
        technique: data.technique.filter((item) => item.trim() !== ""),
        isFree: data.price === 0,
        isPublish: data.isPublish,
      }

      if (isEditing) {
        await updateCourseMutation.mutateAsync({
          id: courseId!,
          payload,
        })
        toast.success("🎉 Cập nhật thành công!", {
          description: `Khóa học của bạn đã được cập nhật.`,
        })
      } else {
        const newCourse = await createCourseMutation.mutateAsync(payload)
        toast.success("🎉 Tạo thành công!", {
          description: `Đang chuyển hướng tới trang quản lý nội dung...`,
        })
        onSuccess()
        router.push(`/lms/courses/${newCourse.id}/outline`)
        return
      }

      onSuccess()
    } catch (error: any) {
      toast.error("Thất bại", {
        description: error?.response?.data?.message || "Vui lòng thử lại sau.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const onInvalid = (errors: FieldErrors<CourseFormValues>) => {
    const errorKeys = Object.keys(errors) as (keyof CourseFormValues)[];
    if (errorKeys.length > 0) {
      const firstError = errorKeys[0];
      const elementMap: Record<string, string> = {
        title: "course-title",
        description: "course-description",
        categoryId: "course-category",
        level: "course-level",
        price: "course-price",
        oldPrice: "course-old-price",
        thumbnail: "course-thumbnail",
        overview: "course-overview",
        benefits: "course-benefits",
        requirements: "course-requirements",
        technique: "course-technique",
      };

      const elementId = elementMap[firstError];
      if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          // Focus if it's focusable
          const focusable = element.querySelector('button, input, textarea, [tabindex="0"]') as HTMLElement || element;
          focusable?.focus();
        }
      }
    }
  };

  if (loadingCourse) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <form onSubmit={(e) => e.preventDefault()} className="flex-1 flex flex-col space-y-8">
        <div className="space-y-8">
          
          {/* Top Section matching Image */}
          <div className="space-y-6">
            <div>
              <Label htmlFor="course-title" className="text-sm font-semibold text-slate-600 mb-2 block">
                Course Title
              </Label>
              <Input
                id="course-title"
                {...register("title")}
                placeholder="e.g. Advanced Quantum Mechanics for Educators"
                className="h-12 border-slate-200 rounded-lg text-sm bg-white"
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
            </div>

            <div id="course-description">
              <Label className="text-sm font-semibold text-slate-600 mb-2 block">
                Short Description
              </Label>
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Summarize your course in 2-3 sentences..."
                  />
                )}
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-semibold text-slate-600 mb-2 block">
                  Category
                </Label>
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select
                      key={`cat-${field.value}-${categories.length}`}
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(val) => field.onChange(Number(val))}
                      onOpenChange={field.onBlur}
                      disabled={loadingCategories}
                    >
                      <SelectTrigger 
                        id="course-category"
                        ref={field.ref}
                        className="h-11 border-slate-200 rounded-lg text-sm bg-white"
                      >
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId.message as string}</p>}
              </div>

              <div>
                <Label className="text-sm font-semibold text-slate-600 mb-2 block">
                  Level
                </Label>
                <Controller
                  control={control}
                  name="level"
                  render={({ field }) => (
                    <ToggleGroup
                      id="course-level"
                      type="single"
                      value={field.value}
                      onValueChange={(val) => val && field.onChange(val)}
                      className="justify-start p-1 bg-[#ebf0fa] rounded-lg h-11 w-max"
                    >
                      <ToggleGroupItem value="BEGINNER" className="text-xs font-semibold px-4 h-8 data-[state=on]:bg-white data-[state=on]:text-slate-900 text-slate-500 data-[state=on]:shadow-sm rounded-md transition-all">Intro</ToggleGroupItem>
                      <ToggleGroupItem value="INTERMEDIATE" className="text-xs font-semibold px-4 h-8 data-[state=on]:bg-white data-[state=on]:text-slate-900 text-slate-500 data-[state=on]:shadow-sm rounded-md transition-all">Mid</ToggleGroupItem>
                      <ToggleGroupItem value="ADVANCED" className="text-xs font-semibold px-4 h-8 data-[state=on]:bg-white data-[state=on]:text-slate-900 text-slate-500 data-[state=on]:shadow-sm rounded-md transition-all">Adv</ToggleGroupItem>
                    </ToggleGroup>
                  )}
                />
                {errors.level && <p className="text-xs text-red-500 mt-1">{errors.level.message as string}</p>}
              </div>

              <div>
                <Label htmlFor="course-price" className="text-sm font-semibold text-slate-600 mb-2 block">
                  Price ($)
                </Label>
                <Controller
                  control={control}
                  name="price"
                  render={({ field }) => {
                    const formatNumber = (val: number) => {
                      if (!val && val !== 0) return ""
                      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                    }
                    return (
                      <Input
                        id="course-price"
                        type="text"
                        value={formatNumber(field.value)}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/[^0-9]/g, "")
                          field.onChange(Number(rawValue))
                        }}
                        placeholder="0"
                        className="h-11 border-slate-200 rounded-lg text-sm bg-white"
                      />
                    )
                  }}
                />
                {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
              </div>

              <div>
                <Label htmlFor="course-old-price" className="text-sm font-semibold text-slate-600 mb-2 block">
                  Old Price ($)
                </Label>
                <Controller
                  control={control}
                  name="oldPrice"
                  render={({ field }) => {
                    const formatNumber = (val: number) => {
                      if (!val && val !== 0) return ""
                      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                    }
                    return (
                      <Input
                        id="course-old-price"
                        type="text"
                        value={formatNumber(field.value ?? 0)}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/[^0-9]/g, "")
                          field.onChange(Number(rawValue))
                        }}
                        placeholder="0"
                        className="h-11 border-slate-200 rounded-lg text-sm bg-white"
                      />
                    )
                  }}
                />
                {errors.oldPrice && <p className="text-xs text-red-500 mt-1">{errors.oldPrice.message}</p>}
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-slate-600 mb-2 block">
                Course Thumbnail
              </Label>
              <Controller
                control={control}
                name="thumbnail"
                render={({ field }) => (
                  <div id="course-thumbnail" className="relative border-2 border-dashed border-slate-200 rounded-xl overflow-hidden bg-[#f9fafb]">
                    <ImageUpload
                      value={field.value || ""}
                      onChange={(url) => {
                        field.onChange(url);
                        trigger("thumbnail");
                      }}
                      onRemove={() => {
                        field.onChange("");
                        trigger("thumbnail");
                      }}
                    />
                  </div>
                )}
              />
              {errors.thumbnail && <p className="text-xs text-red-500 mt-1">{errors.thumbnail.message}</p>}
            </div>
          </div>

          <hr className="border-slate-100 border-2 rounded-full" />

          {/* Bottom Section (Detailed data) */}
          <div className="space-y-6">
            <div id="course-overview">
              <Label className="text-sm font-semibold text-slate-600 mb-2 block">
                Detailed Overview
              </Label>
              <Controller
                control={control}
                name="overview"
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Provide a detailed roadmap, curriculum overview, etc..."
                  />
                )}
              />
              {errors.overview && <p className="text-xs text-red-500 mt-1">{errors.overview.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Controller
                control={control}
                name="benefits"
                render={({ field }) => (
                  <div id="course-benefits">
                    <DynamicListInput
                      label="What students will learn"
                      items={field.value}
                      onChange={field.onChange}
                      placeholder="e.g. Master React Hooks"
                    />
                  </div>
                )}
              />
              <Controller
                control={control}
                name="requirements"
                render={({ field }) => (
                  <div id="course-requirements">
                    <DynamicListInput
                      label="Requirements"
                      items={field.value}
                      onChange={field.onChange}
                      placeholder="e.g. Basic JS Knowledge"
                    />
                  </div>
                )}
              />
              <Controller
                control={control}
                name="technique"
                render={({ field }) => (
                  <div id="course-technique">
                    <DynamicListInput
                      label="Techniques/Tools"
                      items={field.value}
                      onChange={field.onChange}
                      placeholder="e.g. Next.js, Tailwind"
                    />
                  </div>
                )}
              />
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 mt-auto">
          <Button
            type="button"
            variant="ghost"
            className="h-11 px-6 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
            onClick={() => {
              setValue("isPublish", false)
              handleSubmit(onSubmit, onInvalid)()
            }}
            disabled={isSubmitting}
          >
            Save as Draft
          </Button>
          <Button
            type="button"
            className="h-11 px-8 rounded-lg bg-[#0a1128] hover:bg-[#0a1128]/90 text-white font-semibold"
            onClick={() => {
              setValue("isPublish", true)
              handleSubmit(onSubmit, onInvalid)()
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Publish Course"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
