"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { BookOpen, Eye, EyeOff, Sparkles } from "lucide-react"
import { api } from "@/lib/axios"
import { useAuthStore } from "@/store/useAuthStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// ─── Shared Left Panel ──────────────────────────────────────────────────────

function AuthLeftPanel() {
  return (
    <div className="hidden lg:flex lg:w-[52%] relative flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900">
      {/* Background image */}
      <Image
        src="/auth-illustration.png"
        alt="E-Learning Illustration"
        fill
        className="object-cover opacity-30 mix-blend-luminosity"
        priority
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-indigo-900/60 to-violet-900/80" />

      {/* Decorative blobs */}
      <div className="absolute top-20 left-16 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-12 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-12 max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-12">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Learnly</span>
        </div>

        {/* Heading */}
        <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
          Nâng tầm
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-indigo-200">
            tri thức của bạn
          </span>
        </h2>
        <p className="text-indigo-200/80 text-base leading-relaxed mb-10">
          Học từ những giảng viên hàng đầu. Tiếp cận hàng nghìn khóa học chất lượng cao, mọi lúc, mọi nơi.
        </p>

        {/* Stats */}
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

        {/* Trust badges */}
        <div className="flex items-center gap-2 mt-8">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <p className="text-indigo-300 text-sm">Được tin dùng bởi hơn 10,000 học viên Việt Nam</p>
        </div>
      </div>
    </div>
  )
}

// ─── Google SVG ─────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

// ─── Login Content ──────────────────────────────────────────────────────────

function LoginContent() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { setToken, setUser } = useAuthStore()
  const searchParams = useSearchParams()

  const handleRoleBasedRedirect = (role: string) => {
    if (role === "ADMIN") router.push("/admin")
    else if (role === "INSTRUCTOR") router.push("/lms")
    else router.push("/")
  }

  useEffect(() => {
    const error = searchParams.get("error")
    if (error) { toast.error(`Đăng nhập thất bại: ${error}`); return }
    const accessToken = searchParams.get("token")
    if (accessToken) {
      setToken(accessToken)
      api.get("/users/me", { headers: { Authorization: `Bearer ${accessToken}` } })
        .then((res) => { setUser(res.data); toast.success("Đăng nhập Google thành công!"); handleRoleBasedRedirect(res.data.role) })
        .catch(() => toast.error("Không lấy được thông tin người dùng từ Google."))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await api.post("/auth/login", { username, password })
      const { accessToken } = response.data
      if (accessToken) {
        setToken(accessToken)
        const userRes = await api.get("/users/me")
        setUser(userRes.data)
        toast.success("Đăng nhập thành công!")
        handleRoleBasedRedirect(userRes.data.role)
      }
    } catch {
      toast.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google"
  }

  return (
    <div className="flex flex-col justify-center px-8 py-10 w-full max-w-md mx-auto">
      {/* Mobile logo */}
      <div className="flex items-center gap-2 mb-8 lg:hidden">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-slate-900">Learnly</span>
      </div>

      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Chào mừng trở lại 👋</h1>
        <p className="text-slate-500 text-sm mt-1.5">Đăng nhập để tiếp tục hành trình học tập của bạn.</p>
      </div>

      {/* Google Login */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition-all shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-60"
      >
        <GoogleIcon />
        Tiếp tục với Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-slate-100" />
        <span className="text-xs text-slate-400 font-medium">hoặc đăng nhập với tài khoản</span>
        <div className="flex-1 h-px bg-slate-100" />
      </div>

      {/* Form */}
      <form className="space-y-4" onSubmit={handleLogin}>
        <div className="space-y-1.5">
          <Label htmlFor="username" className="text-sm font-semibold text-slate-700">Tên đăng nhập</Label>
          <Input
            id="username"
            type="text"
            placeholder="Nhập tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="h-11 rounded-xl border-slate-200 focus-visible:ring-indigo-500 focus-visible:border-indigo-400 bg-slate-50/50 placeholder:text-slate-400 text-slate-900"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Mật khẩu</Label>
            <Link href="/forgot-password" className="text-xs text-indigo-600 font-medium hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 rounded-xl border-slate-200 focus-visible:ring-indigo-500 focus-visible:border-indigo-400 bg-slate-50/50 pr-11 placeholder:text-slate-400 text-slate-900"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 active:scale-[0.98] transition-all"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Đang đăng nhập...
            </span>
          ) : "Đăng nhập"}
        </Button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-slate-500 mt-8">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-semibold text-indigo-600 hover:underline">
          Tạo tài khoản miễn phí
        </Link>
      </p>
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function LoginContentWrapper() {
  return (
    <div className="min-h-screen flex">
      <AuthLeftPanel />
      <div className="flex-1 flex items-center justify-center bg-white lg:bg-slate-50/30 px-4">
        <LoginContent />
      </div>
    </div>
  )
}
