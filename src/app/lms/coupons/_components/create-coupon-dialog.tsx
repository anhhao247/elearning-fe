"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Loader2, RefreshCw } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { createInstructorCoupon, updateInstructorCoupon, getInstructorCourses, InstructorCoupon } from "@/lib/services/instructor.service"
import { useEffect } from "react"

const formSchema = z.object({
  code: z.string().min(3, "Mã tối thiểu 3 ký tự").max(20, "Mã tối đa 20 ký tự"),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  discountValue: z.number().min(0, "Giá trị không hợp lệ"),
  maxUses: z.string().optional(),
  expiresAt: z.string().optional(),
  applyType: z.enum(["ALL", "SPECIFIC"]),
  courseId: z.string().optional(),
}).refine((data) => {
  if (data.applyType === "SPECIFIC" && !data.courseId) {
    return false
  }
  return true
}, {
  message: "Vui lòng chọn khóa học",
  path: ["courseId"]
})

type FormValues = z.infer<typeof formSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  coupon?: InstructorCoupon | null
}

export function CreateCouponDialog({ open, onOpenChange, onSuccess, coupon }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!coupon

  const { data: courses = [] } = useQuery({
    queryKey: ['instructor-courses'],
    queryFn: getInstructorCourses,
    enabled: open,
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      discountType: "PERCENTAGE",
      discountValue: 0,
      maxUses: "",
      expiresAt: "",
      applyType: "ALL",
      courseId: "",
    },
  })

  useEffect(() => {
    if (open && coupon) {
      form.reset({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxUses: coupon.maxUses?.toString() || "",
        expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : "",
        applyType: coupon.courseId ? "SPECIFIC" : "ALL",
        courseId: coupon.courseId?.toString() || "",
      })
    } else if (open && !coupon) {
      form.reset({
        code: "",
        discountType: "PERCENTAGE",
        discountValue: 0,
        maxUses: "",
        expiresAt: "",
        applyType: "ALL",
        courseId: "",
      })
    }
  }, [open, coupon, form])

  const applyType = form.watch("applyType")
  const discountType = form.watch("discountType")

  const handleGenerateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    form.setValue("code", result, { shouldValidate: true })
  }

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true)
      const payload = {
        code: values.code,
        discountType: values.discountType,
        discountValue: values.discountValue,
        maxUses: values.maxUses ? parseInt(values.maxUses) : null,
        expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : null,
        courseId: values.applyType === "SPECIFIC" && values.courseId ? parseInt(values.courseId) : null,
      }

      if (isEditing && coupon) {
        await updateInstructorCoupon(coupon.id, payload)
        toast.success("Cập nhật mã giảm giá thành công")
      } else {
        await createInstructorCoupon(payload)
        toast.success("Tạo mã giảm giá thành công")
      }
      
      form.reset()
      onSuccess()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || `Có lỗi xảy ra khi ${isEditing ? "cập nhật" : "tạo"} mã`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!isSubmitting) onOpenChange(val)
      if (!val) form.reset()
    }}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-white">
        <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <DialogTitle className="text-xl font-bold text-[#0a1128]">
            {isEditing ? "Update Coupon" : "Create New Coupon"}
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            {isEditing ? "Update the details of your discount code" : "Set up a new discount code for your students"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-slate-700">Coupon Code</FormLabel>
                  <div className="flex gap-3">
                    <FormControl>
                      <Input 
                        placeholder="e.g. SUMMER2024" 
                        className="h-11 uppercase font-mono tracking-wider" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleGenerateCode}
                      className="h-11 px-5 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Generate
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-slate-700">Discount Type</FormLabel>
                    <FormControl>
                      <ToggleGroup 
                        type="single" 
                        value={field.value} 
                        onValueChange={(val) => val && field.onChange(val)}
                        className="h-11 justify-start border border-slate-200 rounded-lg p-1 bg-slate-50"
                      >
                        <ToggleGroupItem value="PERCENTAGE" className="flex-1 font-semibold text-xs data-[state=on]:bg-white data-[state=on]:shadow-sm">
                          PERCENTAGE
                        </ToggleGroupItem>
                        <ToggleGroupItem value="FIXED_AMOUNT" className="flex-1 font-semibold text-xs data-[state=on]:bg-white data-[state=on]:shadow-sm">
                          FIXED_AMOUNT
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discountValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-slate-700">Discount Value</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          type="number" 
                          className="h-11 pr-10 text-right font-medium" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                        />
                      </FormControl>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                        {discountType === "PERCENTAGE" ? "%" : "đ"}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="maxUses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-slate-700">Usage Limit</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 100" 
                        className="h-11 font-medium" 
                        {...field} 
                      />
                    </FormControl>
                    <p className="text-[11px] text-slate-400 mt-1.5">Leave empty for unlimited redemptions</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-slate-700">Expiry Date & Time</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        className="h-11 text-slate-600 font-medium" 
                        {...field} 
                      />
                    </FormControl>
                    <p className="text-[11px] text-slate-400 mt-1.5">Leaving it blank means the coupon never expires</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="applyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-slate-700">Applied Courses</FormLabel>
                    <FormControl>
                      <RadioGroup 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        className="flex items-center gap-6 mt-2"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="ALL" className="border-slate-300 text-[#0a1128]" />
                          </FormControl>
                          <FormLabel className="font-medium text-slate-600 cursor-pointer">Apply to All Courses</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="SPECIFIC" className="border-slate-300 text-[#0a1128]" />
                          </FormControl>
                          <FormLabel className="font-medium text-slate-600 cursor-pointer">Select Specific Course</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />

              {applyType === "SPECIFIC" && (
                <FormField
                  control={form.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Search courses by title or ID..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id.toString()}>
                              {course.title} (ID: {course.id})
                            </SelectItem>
                          ))}
                          {courses.length === 0 && (
                            <div className="p-2 text-sm text-slate-500 text-center">No courses found</div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => onOpenChange(false)}
                className="h-11 font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="h-11 px-8 bg-[#0a1128] hover:bg-[#0a1128]/90 text-white font-semibold"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEditing ? "Update Coupon" : "Create Coupon"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
