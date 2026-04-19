"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2, Loader2, Globe } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { applyInstructor } from "@/lib/services/instructor.service"

// 1. Định nghĩa Schema riêng dành cho Form (UI)
const instructorFormSchema = z.object({
  headline: z
    .string()
    .min(10, "Tiêu đề phải có ít nhất 10 ký tự")
    .max(100, "Tiêu đề không quá 100 ký tự"),
  bio: z
    .string()
    .min(50, "Tiểu sử phải có ít nhất 50 ký tự"),
  affiliations: z
    .array(z.object({
      value: z.string().min(1, "Nơi công tác không được để trống")
    }))
    .min(1, "Cần ít nhất một nơi công tác"),
  websiteUrl: z.string().url("URL không hợp lệ").or(z.literal("")).optional(),
  facebookUrl: z.string().url("URL không hợp lệ").or(z.literal("")).optional(),
  twitterUrl: z.string().url("URL không hợp lệ").or(z.literal("")).optional(),
  linkedinUrl: z.string().url("URL không hợp lệ").or(z.literal("")).optional(),
})

type InstructorFormValues = z.infer<typeof instructorFormSchema>

export function InstructorApplyForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 2. Sử dụng Schema của Form
  const form = useForm<InstructorFormValues>({
    resolver: zodResolver(instructorFormSchema),
    defaultValues: {
      headline: "",
      bio: "",
      affiliations: [{ value: "" }],
      websiteUrl: "",
      facebookUrl: "",
      twitterUrl: "",
      linkedinUrl: "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "affiliations",
  })

  async function onSubmit(data: InstructorFormValues) {
    setIsSubmitting(true)
    try {
      // 3. Transform dữ liệu trước khi gửi đi: [{ value: "Meta" }] -> ["Meta"]
      const payload = {
        ...data,
        affiliations: data.affiliations.map(a => a.value)
      }
      
      const response = await applyInstructor(payload as any)
      toast.success(response.message || "Đăng ký thành công!")
      router.push("/become-instructor/success")
    } catch (error: any) {
      console.error("Apply instructor error:", error)
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi nộp đơn. Vui lòng thử lại."
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg border-t-4 border-t-primary">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Thông tin đăng ký</CardTitle>
        <CardDescription>
          Hãy cho chúng tôi biết về kinh nghiệm và chuyên môn của bạn để trở thành giảng viên.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Headline Section */}
            <FormField
              control={form.control}
              name="headline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề nghề nghiệp (Headline)</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Senior Software Engineer tại Google" {...field} />
                  </FormControl>
                  <FormDescription>
                    Một dòng ngắn gọn giới thiệu về vị trí hoặc chuyên môn hiện tại của bạn.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bio Section */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiểu sử (Bio)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Chia sẻ về kinh nghiệm giảng dạy, kỹ năng chuyên môn và các dự án bạn đã thực hiện..."
                      className="min-h-[150px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Giới thiệu bản thân tối thiểu 50 ký tự. Càng chi tiết càng giúp hồ sơ của bạn ấn tượng hơn.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Affiliations Section */}
            <div className="space-y-4">
              <div>
                <FormLabel className="text-base">Nơi công tác / Đơn vị liên kết (Affiliations)</FormLabel>
                <p className="text-[0.8rem] text-muted-foreground">
                  Liệt kê các công ty, tổ chức hoặc trường học bạn đang hoặc đã từng làm việc.
                </p>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`affiliations.${index}.value`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Input placeholder={`Nơi công tác ${index + 1}`} {...field} />
                          </FormControl>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 flex items-center gap-2"
                onClick={() => append({ value: "" })}
              >
                <Plus className="size-4" />
                Thêm nơi công tác
              </Button>
            </div>

            <Separator />

            {/* Social Links Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="websiteUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Globe className="size-4 text-muted-foreground" /> Website cá nhân
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linkedinUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn</FormLabel>
                    <FormControl>
                      <Input placeholder="https://linkedin.com/in/username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="facebookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook</FormLabel>
                    <FormControl>
                      <Input placeholder="https://facebook.com/username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="twitterUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter (X)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://twitter.com/username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full h-11 text-lg font-semibold" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Gửi hồ sơ đăng ký"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
