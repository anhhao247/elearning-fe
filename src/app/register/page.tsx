"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { BookOpen, Eye, EyeOff, Sparkles } from "lucide-react"
import { api } from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

// ─── Schema ──────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập tối thiểu 3 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  firstName: z.string().min(1, "Vui lòng nhập tên"),
  lastName: z.string().min(1, "Vui lòng nhập họ"),
})

type RegisterForm = z.infer<typeof registerSchema>

// ─── Shared Left Panel ──────────────────────────────────────────────────────

function AuthLeftPanel() {
  return (
    <div className="hidden lg:flex lg:w-[52%] relative flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900">
      <Image
        src="/auth-illustration.png"
        alt="E-Learning Illustration"
        fill
        className="object-cover opacity-30 mix-blend-luminosity"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-indigo-900/60 to-violet-900/80" />
      <div className="absolute top-20 left-16 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-12 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col items-center text-center px-12 max-w-lg">
        <div className="flex items-center gap-2.5 mb-12">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Learnly</span>
        </div>

        <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
          Bắt đầu
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-indigo-200">
            hành trình học tập
          </span>
        </h2>
        <p className="text-indigo-200/80 text-base leading-relaxed mb-10">
          Tạo tài khoản miễn phí và khám phá hàng ngàn khóa học từ các chuyên gia hàng đầu.
        </p>

        <div className="grid grid-cols-3 gap-6 w-full">
          {[
            { value: "10K+", label: "Học viên" },
            { value: "500+", label: "Khóa học" },
            { value: "98%", label: "Hài lòng" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl py-4 px-3 backdrop-blur-sm"
            >
              <span className="text-2xl font-extrabold text-white">{stat.value}</span>
              <span className="text-xs text-indigo-300 mt-1 font-medium">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-8">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <p className="text-indigo-300 text-sm">Được tin dùng bởi hơn 10,000 học viên Việt Nam</p>
        </div>
      </div>
    </div>
  )
}

// ─── Register Form ──────────────────────────────────────────────────────────

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    try {
      await api.post("/auth/register", data)
      toast.success("Đăng ký tài khoản thành công!")
      setTimeout(() => router.push("/login"), 1500)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error.response?.data?.message || "Đăng ký thất bại"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <AuthLeftPanel />

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center bg-white lg:bg-slate-50/30 px-4 py-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">Learnly</span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tạo tài khoản mới ✨</h1>
            <p className="text-slate-500 text-sm mt-1.5">
              Đã có tài khoản?{" "}
              <Link href="/login" className="font-semibold text-indigo-600 hover:underline">Đăng nhập ngay</Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* First + Last name row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-sm font-semibold text-slate-700">Tên</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Tên"
                  {...register("firstName")}
                  className="h-11 rounded-xl border-slate-200 focus-visible:ring-indigo-500 focus-visible:border-indigo-400 bg-slate-50/50 placeholder:text-slate-400"
                />
                {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-sm font-semibold text-slate-700">Họ</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Họ"
                  {...register("lastName")}
                  className="h-11 rounded-xl border-slate-200 focus-visible:ring-indigo-500 focus-visible:border-indigo-400 bg-slate-50/50 placeholder:text-slate-400"
                />
                {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
              </div>
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-semibold text-slate-700">Tên đăng nhập</Label>
              <Input
                id="username"
                type="text"
                placeholder="Tên đăng nhập (ít nhất 3 ký tự)"
                {...register("username")}
                className="h-11 rounded-xl border-slate-200 focus-visible:ring-indigo-500 focus-visible:border-indigo-400 bg-slate-50/50 placeholder:text-slate-400"
              />
              {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                {...register("email")}
                className="h-11 rounded-xl border-slate-200 focus-visible:ring-indigo-500 focus-visible:border-indigo-400 bg-slate-50/50 placeholder:text-slate-400"
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ít nhất 6 ký tự"
                  {...register("password")}
                  className="h-11 rounded-xl border-slate-200 focus-visible:ring-indigo-500 focus-visible:border-indigo-400 bg-slate-50/50 pr-11 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 active:scale-[0.98] transition-all"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang đăng ký...
                </span>
              ) : "Tạo tài khoản"}
            </Button>

            <p className="text-center text-xs text-slate-400 mt-2">
              Bằng cách đăng ký, bạn đồng ý với{" "}
              <Link href="/terms" className="underline hover:text-slate-600">Điều khoản sử dụng</Link>
              {" "}và{" "}
              <Link href="/privacy" className="underline hover:text-slate-600">Chính sách bảo mật</Link>.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
