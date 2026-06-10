"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ImageIcon, MoreHorizontal } from "lucide-react"
import { InstructorCourse } from "@/lib/services/instructor.service"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import Link from "next/link"

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    onEdit?: (id: number | string) => void
  }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price)
}

export const columns: ColumnDef<InstructorCourse>[] = [
  {
    accessorKey: "thumbnail",
    header: "Thumbnail",
    cell: ({ row }) => {
      const thumbnail = row.getValue("thumbnail") as string
      return (
        <div className="relative h-12 w-20 overflow-hidden rounded-md border bg-slate-100">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={row.getValue("title")}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
              <ImageIcon className="h-6 w-6" />
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 hover:bg-transparent"
        >
          Tên khóa học
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="font-medium max-w-[300px] truncate" title={row.getValue("title")}>
          {row.getValue("title")}
        </div>
      )
    },
  },
  {
    accessorKey: "categoryName",
    header: "Danh mục",
    cell: ({ row }) => {
      const category = row.getValue("categoryName") as string
      return (
        <Badge variant="outline" className="bg-slate-50 font-normal">
          {category || "Uncategorized"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 hover:bg-transparent"
        >
          Giá
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price") || "0")
      return <div>{formatPrice(price)}</div>
    },
  },
  {
    accessorKey: "isFree",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 hover:bg-transparent"
        >
          Loại
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const isFree = row.getValue("isFree") as boolean
      return (
        <Badge variant={isFree ? "success" : "secondary"} className="rounded-full">
          {isFree ? "FREE" : "PAID"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "isPublish",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 hover:bg-transparent"
        >
          Trạng thái
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const isPublish = row.getValue("isPublish") as boolean
      return (
        <Badge variant={isPublish ? "default" : "outline"} className={isPublish ? "bg-black text-white hover:bg-black/90" : ""}>
          {isPublish ? "PUBLISH" : "DRAFT"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "approvalStatus",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 hover:bg-transparent"
        >
          Trạng thái duyệt
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.getValue("approvalStatus") as string || "DRAFT"
      if (status === "PENDING_REVIEW") {
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none font-normal">Chờ duyệt</Badge>
      }
      if (status === "APPROVED") {
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-normal">Đã duyệt</Badge>
      }
      if (status === "REJECTED") {
        return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none font-normal">Từ chối</Badge>
      }
      return <Badge variant="outline" className="font-normal bg-slate-100 text-slate-700 border-none">Bản nháp</Badge>
    },
  },
  {
    accessorKey: "level",
    header: "Cấp độ",
    cell: ({ row }) => {
      const level = row.getValue("level") as string
      return (
        <Badge variant="outline" className="capitalize">
          {level.toLowerCase()}
        </Badge>
      )
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Ngày cập nhật",
    cell: ({ row }) => {
      const date = new Date(row.getValue("updatedAt"))
      return <div>{new Intl.DateTimeFormat("vi-VN").format(date)}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const { id } = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/lms/courses/${id}/detail`}>
                Xem chi tiết
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              {/* <Link href={`/lms/courses/${id}/outline`}>
                Outline
              </Link> */}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => table.options.meta?.onEdit?.(id)}>
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
