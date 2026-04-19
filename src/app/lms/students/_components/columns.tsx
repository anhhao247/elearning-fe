"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Mail, MoreHorizontal } from "lucide-react"
import { InstructorStudent } from "@/lib/services/instructor.service"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price)
}

function getInitials(name: string) {
  if (!name) return "U"
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
}

export const columns: ColumnDef<InstructorStudent>[] = [
  {
    accessorKey: "studentName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 hover:bg-transparent"
        >
          Học viên
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const name = row.getValue("studentName") as string
      const email = row.original.studentEmail
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-slate-100 flex-shrink-0">
            <AvatarFallback className="text-xs font-bold bg-slate-100 text-slate-600">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-slate-800 text-sm truncate">{name}</span>
            <span className="text-xs text-slate-500 truncate flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {email}
            </span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "enrolledCourses",
    header: "Khóa học đã đăng ký",
    cell: ({ row }) => {
      const courses = row.original.enrolledCourses || []
      if (courses.length === 0) return <span className="text-sm text-slate-400">Không có</span>
      
      const displayCourses = courses.slice(0, 2)
      const hiddenCount = courses.length - displayCourses.length

      return (
        <div className="flex flex-wrap gap-1.5 max-w-[300px]">
          {displayCourses.map(course => (
             <Badge key={course.courseId} variant="outline" className="bg-slate-50 font-normal text-xs py-0.5" title={course.courseName}>
               {course.courseName.length > 25 ? course.courseName.substring(0, 25) + '...' : course.courseName}
             </Badge>
          ))}
          {hiddenCount > 0 && (
            <Badge variant="outline" className="bg-slate-100 font-medium text-xs">
              +{hiddenCount}
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "totalPaid",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 hover:bg-transparent"
        >
          Tổng thanh toán
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const totalPaid = parseFloat(row.getValue("totalPaid") || "0")
      return <div className="font-medium">{formatPrice(totalPaid)}</div>
    },
  },
  {
    accessorKey: "lastEnrolledAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 hover:bg-transparent"
        >
          Đăng ký gần nhất
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const dateStr = row.getValue("lastEnrolledAt") as string
      if (!dateStr) return <div>-</div>
      const date = new Date(dateStr)
      return <div className="text-sm text-slate-600">{new Intl.DateTimeFormat("vi-VN").format(date)}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { studentId } = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/lms/students/${studentId}`}>
                Xem chi tiết
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
