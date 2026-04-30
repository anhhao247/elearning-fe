"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, User as UserIcon } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuthStore, User } from "@/store/useAuthStore"
import { updateProfile } from "@/lib/services/user.service"
import { ImageUpload } from "@/components/ui/image-upload"

const profileSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập phải ít nhất 3 ký tự"),
  firstName: z.string().min(1, "Họ không được để trống"),
  lastName: z.string().min(1, "Tên không được để trống"),
  dob: z.string().nullable().optional(),
  sex: z.string().optional(), // We'll convert string to boolean for API
  avatar: z.string().nullable().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface EditProfileDialogProps {
  user: User
  trigger?: React.ReactNode
}

export function EditProfileDialog({ user, trigger }: EditProfileDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const setUser = useAuthStore((state) => state.setUser)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user.username || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      dob: user.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
      sex: user.sex !== null ? (user.sex === "MALE" || user.sex === "true" || user.sex === true ? "true" : "false") : "",
      avatar: user.avatar || "",
    },
  })

  const onSubmit = async (values: ProfileFormValues) => {
    setIsLoading(true)
    try {
      // Convert sex string to boolean as per user request example (sex: true)
      // Note: If the backend expects "MALE"/"FEMALE", we would change this.
      // But the user request said: "sex": true
      const payload = {
        ...values,
        sex: values.sex === "true" ? true : values.sex === "false" ? false : null,
        dob: values.dob ? new Date(values.dob).toISOString() : null,
      }

      const updatedUser = await updateProfile(payload as any)
      setUser(updatedUser)
      toast.success("Cập nhật thông tin thành công!")
      setIsOpen(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Cập nhật thất bại")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50">
            <UserIcon className="mr-2 h-4 w-4" />
            Chỉnh sửa hồ sơ
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa hồ sơ</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin cá nhân của bạn. Nhấn Lưu để hoàn tất.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <div className="flex flex-col items-center justify-center space-y-4 mb-4">
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem className="w-full flex flex-col items-center">
                    <FormLabel className="text-center mb-2">Ảnh đại diện</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value || ""}
                        onChange={field.onChange}
                        onRemove={() => field.onChange("")}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Tên đăng nhập</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} placeholder="username" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} placeholder="Nguyễn" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} placeholder="Văn A" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày sinh</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value || ""}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giới tính</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Nam</SelectItem>
                        <SelectItem value="false">Nữ</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="rounded-xl"
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading} className="rounded-xl bg-indigo-600 hover:bg-indigo-700">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
