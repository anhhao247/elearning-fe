"use client"

import { useState } from "react"
import {
  useAdminUsers,
  useCreateAdminUser,
  useUpdateAdminUser,
  useDeleteAdminUser,
  useRestoreAdminUser
} from "@/hooks/queries/use-admin-users"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus, AlertCircle } from "lucide-react"
import { AdminUserDialog } from "./_components/admin-user-dialog"
import { CreateAdminUserPayload, AdminUser } from "@/lib/services/admin-user.service"
import { useAuthStore } from "@/store/useAuthStore"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function UsersPage() {
  const { user, _hasHydrated } = useAuthStore()
  const [pageIndex, setPageIndex] = useState(0)
  const [keyword, setKeyword] = useState<string>("")

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)

  // Alert dialog state for delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userIdToDelete, setUserIdToDelete] = useState<number | null>(null)

  const isSuperAdmin = user?.role === "ADMIN" && (user?.adminRole === "SUPER_ADMIN" || user?.admin_role === "SUPER_ADMIN")

  const { data, isLoading, isError, error } = useAdminUsers({
    page: pageIndex,
    size: 10,
    keyword: keyword || undefined,
  })

  const createMutation = useCreateAdminUser()
  const updateMutation = useUpdateAdminUser()
  const deleteMutation = useDeleteAdminUser()
  const restoreMutation = useRestoreAdminUser()

  if (_hasHydrated && !isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="p-4 bg-destructive/10 text-destructive rounded-full">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Không có quyền truy cập</h1>
        <p className="text-muted-foreground max-w-md">
          Chức năng tạo và quản lý tài khoản quản trị viên chỉ dành riêng cho tài khoản có vai trò SUPER_ADMIN.
        </p>
      </div>
    )
  }

  const handleSearch = (newKeyword: string) => {
    setKeyword(newKeyword)
    setPageIndex(0)
  }

  const handleCreate = () => {
    setSelectedUser(null)
    setDialogOpen(true)
  }

  const handleEdit = (adminUser: AdminUser) => {
    setSelectedUser(adminUser)
    setDialogOpen(true)
  }

  const handleDeleteClick = (id: number) => {
    setUserIdToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (userIdToDelete) {
      await deleteMutation.mutateAsync(userIdToDelete)
      setDeleteDialogOpen(false)
      setUserIdToDelete(null)
    }
  }

  const handleRestore = async (id: number) => {
    await restoreMutation.mutateAsync(id)
  }

  const handleSubmit = async (payload: Partial<CreateAdminUserPayload>) => {
    if (selectedUser) {
      await updateMutation.mutateAsync({ id: selectedUser.id, payload })
    } else {
      await createMutation.mutateAsync(payload as CreateAdminUserPayload)
    }
    setDialogOpen(false)
  }

  // data trả về là mảng AdminUser[], nếu có totalPages từ PaginatedResponse thì dùng, nếu không thì mặc định 1
  const usersList = Array.isArray(data) ? data : (data as any)?.content || []
  const totalPages = (data as any)?.totalPages || 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Tài khoản Admin</h1>
          <p className="text-muted-foreground">
            Quản lý, tạo mới, chỉnh sửa và xóa các tài khoản quản trị viên trên hệ thống.
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-black text-white hover:bg-black/90">
          <Plus className="mr-2 h-4 w-4" />
          Tạo tài khoản Admin
        </Button>
      </div>

      {isError ? (
        <div className="p-4 border border-destructive/50 bg-destructive/10 text-destructive rounded-md">
          <p>Không thể tải danh sách tài khoản.</p>
          <p className="text-sm opacity-80">{error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định"}</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={usersList}
          pageCount={totalPages}
          pageIndex={pageIndex}
          onPageChange={setPageIndex}
          loading={isLoading}
          onSearch={handleSearch}
          meta={{
            onEdit: handleEdit,
            onDelete: handleDeleteClick,
            onRestore: handleRestore,
          }}
        />
      )}

      <AdminUserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={selectedUser}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Tài khoản quản trị viên này sẽ bị xóa khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {deleteMutation.isPending ? "Đang xóa..." : "Xóa tài khoản"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
