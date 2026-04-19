"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
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
import { Switch } from "@/components/ui/switch"

// ─── Zod Schema ──────────────────────────────────────────────────────────────

const courseSchema = z.object({
  title: z.string().min(3, "Tên khóa học tối thiểu 3 ký tự"),
  description: z.string().min(10, "Mô tả tối thiểu 10 ký tự"),
  categoryId: z.number({
    message: "Vui lòng chọn danh mục",
  }).int().positive("Vui lòng chọn danh mục"),
  price: z.number().min(0, "Giá không được âm"),
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
    formState: { errors },
  } = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      benefits: [""],
      requirements: [""],
      technique: [""],
      price: 0,
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
        level: data.level,
        thumbnail: data.thumbnail,
        overview: data.overview,
        benefits: data.benefits.filter((item) => item.trim() !== ""),
        requirements: data.requirements.filter((item) => item.trim() !== ""),
        technique: data.technique.filter((item) => item.trim() !== ""),
        isFree: data.isFree,
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

  if (loadingCourse) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <form onSubmit={handleSubmit(onSubmit, (err) => console.log("Form Validation Errors:", err))} className="flex-1 flex flex-col space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
          {/* Cột trái: Thông tin chính */}
          <div className="space-y-6 col-span-2">
            <div className="space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800">
                <FileText className="w-4 h-4 text-blue-500" /> Thông tin cơ bản
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="course-title" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Tên khóa học <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="course-title"
                    {...register("title")}
                    placeholder="Vd: Lập trình Java chuyên sâu"
                    className="mt-1.5 border-slate-200 h-11 rounded-xl focus:ring-black/5"
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="course-desc" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Mô tả ngắn gọn <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="course-desc"
                    {...register("description")}
                    placeholder="Tóm tắt ngắn về mục tiêu khóa học..."
                    className="mt-1.5 border-slate-200 min-h-[90px] resize-none rounded-xl focus:ring-black/5"
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Danh mục <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="categoryId"
                    render={({ field }) => (
                      <Select
                        key={`cat-${field.value}-${categories.length}`}
                        value={field.value ? String(field.value) : undefined}
                        onValueChange={(val) => field.onChange(Number(val))}
                        onOpenChange={field.onBlur} // Trigger blur/validation when closing
                        disabled={loadingCategories}
                      >
                        <SelectTrigger 
                          ref={field.ref}
                          className="mt-1.5 border-slate-200 h-11 bg-white rounded-xl w-full focus:ring-black/5"
                        >
                          <SelectValue placeholder="Chọn danh mục" />
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
                  {errors.categoryId && (
                    <p className="text-xs text-red-500 mt-1">{errors.categoryId.message as string}</p>
                  )}
                </div>

                <div>
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Cấp độ <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="level"
                    render={({ field }) => (
                      <Select
                        key={`level-${field.value}`}
                        value={field.value}
                        onValueChange={field.onChange}
                        onOpenChange={field.onBlur}
                      >
                        <SelectTrigger 
                          ref={field.ref}
                          className="mt-1.5 border-slate-200 h-11 bg-white rounded-xl w-full focus:ring-black/5"
                        >
                          <SelectValue placeholder="Chọn cấp độ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BEGINNER">Cơ bản</SelectItem>
                          <SelectItem value="INTERMEDIATE">Trung cấp</SelectItem>
                          <SelectItem value="ADVANCED">Nâng cao</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.level && (
                    <p className="text-xs text-red-500 mt-1">{errors.level.message as string}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Giá và Trạng thái */}
            <div className="grid grid-cols-2 gap-6 bg-slate-50/50 p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="course-price" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Giá niêm yết (VNĐ)
                  </Label>
                  <Controller
                    control={control}
                    name="price"
                    render={({ field }) => {
                      const formatNumber = (val: number) => {
                        if (!val && val !== 0) return ""
                        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                      }

                      const parseNumber = (val: string) => {
                        return Number(val.replace(/\./g, "")) || 0
                      }

                      return (
                        <Input
                          id="course-price"
                          type="text"
                          disabled={watch("isFree")}
                          value={watch("isFree") ? "0" : formatNumber(field.value)}
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/[^0-9]/g, "")
                            field.onChange(Number(rawValue))
                          }}
                          placeholder="0"
                          className="mt-1.5 border-slate-200 h-11 bg-white rounded-xl focus:ring-black/5"
                        />
                      )
                    }}
                  />
                </div>
                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="is-free"
                      checked={watch("isFree")}
                      onCheckedChange={(v) => {
                        setValue("isFree", v)
                        if (v) setValue("price", 0)
                      }}
                    />
                    <Label htmlFor="is-free" className="text-sm font-medium cursor-pointer">Khóa học miễn phí</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Switch id="is-pub" checked={watch("isPublish")} onCheckedChange={(v) => setValue("isPublish", v)} />
                    <Label htmlFor="is-pub" className="text-sm font-medium cursor-pointer">Công khai ngay</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Ảnh bìa khóa học</Label>
                <Controller
                  control={control}
                  name="thumbnail"
                  render={({ field }) => (
                    <div className="relative">
                      <ImageUpload
                        value={field.value}
                        onChange={(url) => field.onChange(url)}
                        onRemove={() => field.onChange("")}
                      />
                    </div>
                  )}
                />
                {errors.thumbnail && <p className="text-[10px] text-red-500">{errors.thumbnail.message}</p>}
              </div>
            </div>
          </div>



          {/* Overview: Chiều ngang đầy đủ */}
          <div className="col-span-1 lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-500" /> Nội dung tổng quan & Lộ trình chi tiết
              </Label>
              <Controller
                control={control}
                name="overview"
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Trình bày chi tiết về các học phần, mục tiêu và kết quả đạt được..."
                  />
                )}
              />
              {errors.overview && (
                <p className="text-xs text-red-500 mt-1">{errors.overview.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Cột phải: Lợi ích & Kỹ thuật */}
        <div className="space-y-6">
          <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <Controller
              control={control}
              name="benefits"
              render={({ field }) => (
                <DynamicListInput
                  label="Lợi ích khi học"
                  items={field.value}
                  onChange={field.onChange}
                  placeholder="Vd: Thành thạo React hooks..."
                />
              )}
            />
            <Controller
              control={control}
              name="requirements"
              render={({ field }) => (
                <DynamicListInput
                  label="Yêu cầu đầu vào"
                  items={field.value}
                  onChange={field.onChange}
                  placeholder="Vd: Kiến thức cơ bản về JS..."
                />
              )}
            />
            <Controller
              control={control}
              name="technique"
              render={({ field }) => (
                <DynamicListInput
                  label="Kỹ thuật / Công cụ"
                  items={field.value}
                  onChange={field.onChange}
                  placeholder="Vd: Next.js, Tailwind..."
                />
              )}
            />
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 bottom-0 bg-white pb-6 z-10 mt-auto">
          <Button
            type="button"
            variant="outline"
            className="h-12 px-8 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:cursor-pointer"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            className="h-12 px-10 rounded-xl bg-black hover:bg-black/90 text-white min-w-[180px] font-bold shadow-lg shadow-black/10 hover:cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : isEditing ? (
              "Lưu thay đổi"
            ) : (
              "Tạo khóa học ngay"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
