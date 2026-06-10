"use client"

import { ColumnDef } from "@tanstack/react-table"
import { StudentUser } from "@/lib/services/student-user.service"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { MoreHorizontal, Lock, Unlock, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const studentUserColumns: ColumnDef<StudentUser>[] = [
  {
    accessorKey: "username",
    header: "Tên đăng nhập",
    cell: ({ row }) => <div className="font-medium">{row.getValue("username")}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="text-sm">{row.getValue("email")}</div>,
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
    accessorKey: "role",
    header: "Vai trò",
    cell: ({ row }) => {
      const role = row.getValue("role") as string
      const isInstructor = role === "INSTRUCTOR"
      return (
        <Badge
          variant="outline"
          className={isInstructor
            ? "bg-blue-50 text-blue-700 border-blue-200 font-semibold"
            : "bg-slate-50 text-slate-700 border-slate-200 font-semibold"
          }
        >
          {isInstructor ? "Giảng viên" : "Học viên"}
        </Badge>
      )
    },
  },
  {
    id: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const user = row.original
      const isBanned = user.isBanned

      if (isBanned) {
        return (
          <Badge variant="destructive" className="font-medium cursor-help" title={`Lý do: ${user.banReason || "Không có"}`}>
            Đã khóa
          </Badge>
        )
      }

      return (
        <Badge className="bg-emerald-500 hover:bg-emerald-600 font-medium">
          Hoạt động
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
        return <div className="text-sm text-muted-foreground">{format(new Date(date), "dd/MM/yyyy HH:mm")}</div>
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
      const isBanned = user.isBanned

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
            {!isBanned ? (
              <DropdownMenuItem
                onClick={() => meta?.onBan(user)}
                className="text-orange-600 focus:text-orange-600"
              >
                <Lock className="mr-2 h-4 w-4" />
                Khóa tài khoản
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem
                  onClick={() => meta?.onViewBanReason(user)}
                >
                  <Info className="mr-2 h-4 w-4" />
                  Xem lý do khóa
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => meta?.onUnban(user.id)}
                  className="text-emerald-600 focus:text-emerald-600"
                >
                  <Unlock className="mr-2 h-4 w-4" />
                  Mở khóa tài khoản
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
