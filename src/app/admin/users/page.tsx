"use client"

import { useState } from "react"
import { useStudentUsers, useBanStudentUser, useUnbanStudentUser } from "@/hooks/queries/use-student-users"
import { DataTable } from "./data-table"
import { studentUserColumns } from "./columns"
import { AlertCircle } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { StudentUser } from "@/lib/services/student-user.service"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

function BanUserDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
  isLoading,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: StudentUser | null
  onSubmit: (reason: string, bannedUntil: string | null) => Promise<void>
  isLoading?: boolean
}) {
  const [reason, setReason] = useState("")
  const [bannedUntil, setBannedUntil] = useState("")
  const [error, setError] = useState("")

  const handleOpen = (v: boolean) => {
    if (v) {
      setReason("")
      setBannedUntil("")
      setError("")
    }
    onOpenChange(v)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) { setError("Vui lòng nhập lý do khóa tài khoản."); return }
    let isoDate: string | null = null
    if (bannedUntil) {
      const date = new Date(bannedUntil)
      if (date <= new Date()) { setError("Thời hạn khóa phải lớn hơn thời gian hiện tại."); return }
      isoDate = date.toISOString()
    }
    await onSubmit(reason, isoDate)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Khóa tài khoản</DialogTitle>
          <DialogDescription>
            {user && <>Khóa tài khoản <strong>{user.username}</strong> ({user.role === "INSTRUCTOR" ? "Giảng viên" : "Học viên"}).</>}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="ban-reason">Lý do khóa <span className="text-destructive">*</span></Label>
            <Textarea
              id="ban-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do vi phạm..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ban-until">Khóa đến thời gian <span className="ml-1 text-xs text-muted-foreground font-normal">(Để trống nếu khóa vĩnh viễn)</span></Label>
            <Input
              id="ban-until"
              type="datetime-local"
              value={bannedUntil}
              onChange={(e) => setBannedUntil(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Hủy</Button>
            <Button type="submit" variant="destructive" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Khóa tài khoản"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ViewBanReasonDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: StudentUser | null
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thông tin khóa tài khoản</DialogTitle>
          <DialogDescription>
            {user && <strong>{user.username}</strong>}
          </DialogDescription>
        </DialogHeader>
        {user && (
          <div className="space-y-4 py-2 text-sm">
            <div>
              <span className="font-semibold">Thời gian khóa: </span>
              {user.bannedAt ? new Date(user.bannedAt).toLocaleString("vi-VN") : "Không rõ"}
            </div>
            <div>
              <span className="font-semibold">Thời hạn: </span>
              {user.bannedUntil ? new Date(user.bannedUntil).toLocaleString("vi-VN") : "Vĩnh viễn"}
            </div>
            <div>
              <span className="font-semibold">Lý do: </span>
              <p className="mt-1 p-3 bg-slate-50 border border-slate-100 rounded-md whitespace-pre-wrap text-slate-700">
                {user.banReason || "Không có lý do được cung cấp."}
              </p>
            </div>
          </div>
        )}
        <DialogFooter className="pt-2">
          <Button type="button" onClick={() => onOpenChange(false)}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function UsersPage() {
  const { user, _hasHydrated } = useAuthStore()
  const [pageIndex, setPageIndex] = useState(0)
  const [keyword, setKeyword] = useState("")
  const [role, setRole] = useState<"STUDENT" | "INSTRUCTOR" | undefined>(undefined)

  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [selectedUserToBan, setSelectedUserToBan] = useState<StudentUser | null>(null)

  const [viewBanReasonDialogOpen, setViewBanReasonDialogOpen] = useState(false)
  const [selectedUserForReason, setSelectedUserForReason] = useState<StudentUser | null>(null)

  const isSuperAdmin = user?.role === "ADMIN" && (user?.adminRole === "SUPER_ADMIN" || user?.admin_role === "SUPER_ADMIN")
  const isSupportAdmin = user?.role === "ADMIN" && (user?.adminRole === "SUPPORT_ADMIN" || user?.admin_role === "SUPPORT_ADMIN")
  const canAccess = isSuperAdmin || isSupportAdmin

  const { data, isLoading, isError, error } = useStudentUsers({
    page: pageIndex,
    size: 10,
    keyword: keyword || undefined,
    role: role,
  })

  const banMutation = useBanStudentUser()
  const unbanMutation = useUnbanStudentUser()

  if (_hasHydrated && !canAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="p-4 bg-destructive/10 text-destructive rounded-full">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Không có quyền truy cập</h1>
        <p className="text-muted-foreground max-w-md">
          Chức năng này chỉ dành riêng cho tài khoản có vai trò SUPER_ADMIN hoặc SUPPORT_ADMIN.
        </p>
      </div>
    )
  }

  const handleSearch = (kw: string) => {
    setKeyword(kw)
    setPageIndex(0)
  }

  const handleRoleFilter = (r: string) => {
    setRole(r ? (r as "STUDENT" | "INSTRUCTOR") : undefined)
    setPageIndex(0)
  }

  const handleBanClick = (targetUser: StudentUser) => {
    setSelectedUserToBan(targetUser)
    setBanDialogOpen(true)
  }

  const handleBanSubmit = async (reason: string, bannedUntil: string | null) => {
    if (selectedUserToBan) {
      await banMutation.mutateAsync({ id: selectedUserToBan.id, payload: { reason, bannedUntil } })
      setBanDialogOpen(false)
      setSelectedUserToBan(null)
    }
  }

  const handleUnban = async (id: number) => {
    await unbanMutation.mutateAsync(id)
  }

  const handleViewBanReason = (targetUser: StudentUser) => {
    setSelectedUserForReason(targetUser)
    setViewBanReasonDialogOpen(true)
  }

  const usersList = data?.content || []
  const totalPages = data?.totalPages || 1
  const totalElements = data?.totalElements

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Người dùng</h1>
          <p className="text-muted-foreground">
            Xem và quản lý tài khoản Học viên và Giảng viên trên hệ thống.
          </p>
        </div>
      </div>

      {isError ? (
        <div className="p-4 border border-destructive/50 bg-destructive/10 text-destructive rounded-md">
          <p>Không thể tải danh sách người dùng.</p>
          <p className="text-sm opacity-80">{error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định"}</p>
        </div>
      ) : (
        <DataTable
          columns={studentUserColumns}
          data={usersList}
          pageCount={totalPages}
          pageIndex={pageIndex}
          onPageChange={setPageIndex}
          loading={isLoading}
          onSearch={handleSearch}
          onRoleFilter={handleRoleFilter}
          totalElements={totalElements}
          meta={{
            onBan: handleBanClick,
            onUnban: handleUnban,
            onViewBanReason: handleViewBanReason,
          }}
        />
      )}

      <BanUserDialog
        open={banDialogOpen}
        onOpenChange={setBanDialogOpen}
        user={selectedUserToBan}
        onSubmit={handleBanSubmit}
        isLoading={banMutation.isPending}
      />
      <ViewBanReasonDialog
        open={viewBanReasonDialogOpen}
        onOpenChange={setViewBanReasonDialogOpen}
        user={selectedUserForReason}
      />
    </div>
  )
}
