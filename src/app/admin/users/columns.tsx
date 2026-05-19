"use client"

import { ColumnDef } from "@tanstack/react-table"
import { AdminUser } from "@/lib/services/admin-user.service"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { MoreHorizontal, Pencil, Trash, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const ROLE_LABELS: Record<string, string> = {
  FINANCE_ADMIN: "Quản trị Tài chính",
  CONTENT_MODERATOR: "Kiểm duyệt Nội dung",
  SUPPORT_ADMIN: "Quản trị Hỗ trợ",
  ADMIN: "Quản trị viên hệ thống",
}

const ROLE_COLORS: Record<string, string> = {
  FINANCE_ADMIN: "bg-amber-100 text-amber-800 border-amber-200",
  CONTENT_MODERATOR: "bg-blue-100 text-blue-800 border-blue-200",
  SUPPORT_ADMIN: "bg-purple-100 text-purple-800 border-purple-200",
  ADMIN: "bg-rose-100 text-rose-800 border-rose-200",
}

export const columns: ColumnDef<AdminUser>[] = [
  {
    accessorKey: "username",
    header: "Tên đăng nhập",
    cell: ({ row }) => <div className="font-medium">{row.getValue("username")}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div>{row.getValue("email")}</div>,
  },
  {
    id: "fullName",
    header: "Họ và Tên",
    cell: ({ row }) => {
      const { firstName, lastName } = row.original
      return <div>{[firstName, lastName].filter(Boolean).join(" ") || "-"}</div>
    },
  },
  {
    accessorKey: "adminRole",
    header: "Vai trò quản trị",
    cell: ({ row }) => {
      const adminRole = row.original.adminRole || row.original.role
      const label = ROLE_LABELS[adminRole] || adminRole
      const color = ROLE_COLORS[adminRole] || "bg-slate-100 text-slate-800 border-slate-200"

      return (
        <Badge variant="outline" className={`font-semibold ${color}`}>
          {label}
        </Badge>
      )
    },
  },
  {
    accessorKey: "isDeleted",
    header: "Trạng thái",
    cell: ({ row }) => {
      const isDeleted = row.getValue("isDeleted") as boolean
      return (
        <Badge variant={isDeleted ? "secondary" : "default"} className={isDeleted ? "bg-slate-200 text-slate-700 hover:bg-slate-200 font-medium" : "bg-emerald-500 hover:bg-emerald-600 font-medium"}>
          {isDeleted ? "Đã xóa" : "Hoạt động"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Ngày tạo",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string
      if (!date) return <div>-</div>
      try {
        return <div>{format(new Date(date), "dd/MM/yyyy HH:mm")}</div>
      } catch {
        return <div>{date}</div>
      }
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const user = row.original
      const meta = table.options.meta as any

      const isTargetSuperAdmin = user.adminRole === "SUPER_ADMIN" || (user as any).admin_role === "SUPER_ADMIN" || user.role === "SUPER_ADMIN"

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
            {!user.isDeleted ? (
              <>
                <DropdownMenuItem onClick={() => meta?.onEdit(user)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
                {!isTargetSuperAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => meta?.onDelete(user.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Xóa
                    </DropdownMenuItem>
                  </>
                )}
              </>
            ) : (
              <DropdownMenuItem 
                onClick={() => meta?.onRestore(user.id)}
                className="text-emerald-600 focus:text-emerald-600 font-medium"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Khôi phục
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
