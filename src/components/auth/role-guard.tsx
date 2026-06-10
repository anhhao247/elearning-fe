"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/store/useAuthStore"
import { toast } from "sonner"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRole: string
}

export function RoleGuard({ children, allowedRole }: RoleGuardProps) {
  const { user, _hasHydrated, isLoggingOut } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (_hasHydrated) {
      if (isLoggingOut) {
        // Người dùng đang chủ động đăng xuất, bỏ qua kiểm tra để router.push("/login") tự xử lý
        return
      }

      if (!user) {
        toast.error("Bạn cần đăng nhập để truy cập trang này")
        router.push("/login")
        return
      }

      if (user.role !== allowedRole) {
        // Special case: Allow users with PENDING instructorStatus to access INSTRUCTOR routes
        if (allowedRole === "INSTRUCTOR" && user.instructorStatus === "PENDING") {
          // Chỉ cho phép truy cập /lms/courses
          if (pathname.startsWith("/lms/courses")) {
            setIsAuthorized(true)
            return
          } else {
            toast.error("Bạn chỉ có quyền truy cập trang Khóa học trong lúc chờ duyệt")
            router.push("/lms/courses")
            return
          }
        }

        toast.error("Bạn không có quyền truy cập trang này")
        router.push("/")
        return
      }

      setIsAuthorized(true)
    }
  }, [_hasHydrated, user, allowedRole, router, pathname, isLoggingOut])

  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <>{children}</>
}
