"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { CreateAdminUserPayload, AdminUser } from "@/lib/services/admin-user.service"
import { Eye, EyeOff } from "lucide-react"

const formSchema = z.object({
  username: z.string()
    .min(3, "Tên đăng nhập phải từ 3 đến 255 ký tự")
    .max(255, "Tên đăng nhập không được quá 255 ký tự"),
  password: z.string()
    .min(6, "Mật khẩu phải từ 6 đến 255 ký tự")
    .max(255, "Mật khẩu không được quá 255 ký tự"),
  email: z.string()
    .min(1, "Email là bắt buộc")
    .email("Email không hợp lệ")
    .max(255, "Email không được quá 255 ký tự"),
  firstName: z.string()
    .max(255, "Họ đệm không được quá 255 ký tự")
    .optional()
    .nullable(),
  lastName: z.string()
    .max(255, "Tên không được quá 255 ký tự")
    .optional()
    .nullable(),
  adminRole: z.enum(["FINANCE_ADMIN", "CONTENT_MODERATOR", "SUPPORT_ADMIN"], {
    message: "Vui lòng chọn vai trò quản trị",
  }),
})

interface AdminUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: AdminUser | null
  onSubmit: (payload: Partial<CreateAdminUserPayload>) => void
  isLoading?: boolean
}

const ADMIN_ROLES = [
  { value: "CONTENT_MODERATOR", label: "Kiểm duyệt nội dung (Content Moderator)" },
  { value: "FINANCE_ADMIN", label: "Quản trị tài chính (Finance Admin)" },
  { value: "SUPPORT_ADMIN", label: "Quản trị hỗ trợ (Support Admin)" },
]

export function AdminUserDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
  isLoading,
}: AdminUserDialogProps) {
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      firstName: "",
      lastName: "",
      adminRole: "CONTENT_MODERATOR",
    },
  })

  useEffect(() => {
    if (open) {
      setShowPassword(false) // Mặc định ẩn mật khẩu khi mở modal
      if (user) {
        form.reset({
          username: user.username,
          password: (user as any).password || "123456", // Hiển thị mật khẩu thực của user (hoặc 123456 mặc định)
          email: user.email,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          adminRole: (user.adminRole as any) || "CONTENT_MODERATOR",
        })
      } else {
        form.reset({
          username: "",
          password: "",
          email: "",
          firstName: "",
          lastName: "",
          adminRole: "CONTENT_MODERATOR",
        })
      }
    }
  }, [form, open, user])

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    const payload: Partial<CreateAdminUserPayload> = {
      username: values.username,
      email: values.email,
      firstName: values.firstName || "",
      lastName: values.lastName || "",
      adminRole: values.adminRole,
    }
    // Chỉ gửi password nếu người dùng có thay đổi (khác mật khẩu ban đầu)
    const initialPassword = user ? ((user as any).password || "123456") : ""
    if (values.password && values.password !== initialPassword && values.password.trim().length > 0) {
      payload.password = values.password
    }
    onSubmit(payload)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {user ? "Chỉnh sửa tài khoản Admin" : "Tạo tài khoản Admin"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên đăng nhập</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên đăng nhập" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{user ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder={user ? "Nhập mật khẩu mới" : "Nhập mật khẩu (ít nhất 6 ký tự)"} 
                        className="pr-10"
                        {...field} 
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer z-10 p-1"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ đệm</FormLabel>
                    <FormControl>
                      <Input placeholder="Ví dụ: Steve" {...field} value={field.value ?? ""} />
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
                      <Input placeholder="Ví dụ: Roger" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="adminRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vai trò quản trị (Admin Role)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vai trò quản trị" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ADMIN_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-black text-white hover:bg-black/90">
                {isLoading ? "Đang xử lý..." : user ? "Lưu thay đổi" : "Tạo tài khoản"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
