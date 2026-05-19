"use client"

import { useAuthStore } from "@/store/useAuthStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UserAvatar } from "@/components/layout/user-avatar"
import { LayoutDashboard, ShieldCheck, Edit2 } from "lucide-react"
import { EditProfileDialog } from "@/components/features/profile/edit-profile-dialog"

export default function MyProfilePage() {
  const { user } = useAuthStore()

  if (!user) {
    return null
  }

  const userInitials = user.firstName && user.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user.username.slice(0, 2).toUpperCase()

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  const getGenderLabel = (sex: string | null | boolean) => {
    if (sex === null || sex === undefined || sex === "") return "N/A"
    if (sex === "MALE" || sex === "true" || sex === true) return "Nam"
    if (sex === "FEMALE" || sex === "false" || sex === false) return "Nữ"
    return sex.toString()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hồ sơ cá nhân</h1>
          <p className="text-muted-foreground mt-2">Quản lý và xem thông tin tài khoản của bạn</p>
        </div>
        
        <div className="flex items-center gap-3">
          <EditProfileDialog 
            user={user} 
            trigger={
              <Button variant="outline" className="rounded-xl px-6 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                <Edit2 className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </Button>
            }
          />
          {user.role === "INSTRUCTOR" || user.instructorStatus === "PENDING" ? (
            <Button asChild className="rounded-xl px-6 bg-indigo-600 hover:bg-indigo-700">
              <Link href="/lms">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Đến trang LMS
              </Link>
            </Button>
          ) : null}
          {user.role === "ADMIN" && (
            <Button asChild variant="default" className="rounded-xl px-6 bg-amber-600 hover:bg-amber-700">
              <Link href="/admin">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Quản trị hệ thống
              </Link>
            </Button>
          )}
        </div>
      </div>

      {user.role !== "INSTRUCTOR" && user.role !== "ADMIN" && (
        <div className="mt-4">
          {!user.instructorStatus ? (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-indigo-100">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg text-indigo-900">Trở thành giảng viên</h3>
                  <p className="text-indigo-700">Chia sẻ kiến thức của bạn và tạo ra thu nhập từ đam mê.</p>
                </div>
                <Button asChild className="bg-indigo-600 hover:bg-indigo-700 shrink-0">
                  <Link href="/become-instructor">Đăng ký làm giảng viên</Link>
                </Button>
              </CardContent>
            </Card>
          ) : user.instructorStatus === "PENDING" ? (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-amber-100 text-amber-600 rounded-full shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-amber-900">Hồ sơ đang chờ duyệt</h3>
                  <p className="text-amber-700">Hồ sơ của bạn đang được ban quản trị xét duyệt. Bạn có thể truy cập LMS để làm quen giao diện và tạo nháp khóa học.</p>
                </div>
              </CardContent>
            </Card>
          ) : user.instructorStatus === "REJECTED" ? (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 text-red-600 rounded-full shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-red-900">Hồ sơ bị từ chối</h3>
                    <p className="text-red-700">Lý do: {user.rejectionReason || "Không đạt yêu cầu"}</p>
                    {user.resubmitAvailableAt && !user.canResubmit && (
                      <p className="text-red-600 text-sm mt-1">Có thể nộp lại sau: {formatDate(user.resubmitAvailableAt)}</p>
                    )}
                  </div>
                </div>
                {user.canResubmit && (
                  <Button asChild variant="destructive" className="shrink-0">
                    <Link href="/become-instructor">Nộp lại hồ sơ</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
      
      <Card>
        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-base mb-4">Thông tin cơ bản</CardTitle>
          <div className="flex gap-6 items-center">
            <UserAvatar user={user} className="h-20 w-20" />
            <div>
              <CardTitle className="text-xl">{user.firstName} {user.lastName}</CardTitle>
              <Badge variant="secondary" className="mt-2 uppercase">{user.role}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Tên đăng nhập</p>
              <p className="font-medium">{user.username}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Họ</p>
              <p className="font-medium">{user.firstName || "N/A"}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Tên</p>
              <p className="font-medium">{user.lastName || "N/A"}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Giới tính</p>
              <p className="font-medium">{getGenderLabel(user.sex)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Ngày sinh</p>
              <p className="font-medium">{user.dob ? formatDate(user.dob) : "N/A"}</p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Ngày tham gia</p>
              <p className="font-medium">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}