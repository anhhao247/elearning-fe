"use client"

import { useAuthStore } from "@/store/useAuthStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hồ sơ cá nhân</h1>
        <p className="text-muted-foreground mt-2">Quản lý và xem thông tin tài khoản của bạn</p>
      </div>
      
      <Card>
        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-base mb-4">Thông tin cơ bản</CardTitle>
          <div className="flex gap-6 items-center">
            <Avatar className="h-20 w-20 shrink-0">
              <AvatarImage src={user.avatar || ""} alt={user.username} />
              <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
            </Avatar>
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
              <p className="font-medium">{user.sex || "N/A"}</p>
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