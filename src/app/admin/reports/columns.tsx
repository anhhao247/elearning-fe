import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Report } from "@/lib/services/report.service"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    onViewDetail?: (report: Report) => void
  }
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Chờ xử lý", className: "bg-amber-100 text-amber-700" },
  RESOLVED: { label: "Đã giải quyết", className: "bg-emerald-100 text-emerald-700" },
  DISMISSED: { label: "Đã từ chối", className: "bg-slate-100 text-slate-600" },
}

export const reportColumns: ColumnDef<Report>[] = [
  {
    accessorKey: "reporterUsername",
    header: "Người báo cáo",
  },
  {
    accessorKey: "targetType",
    header: "Loại đối tượng",
  },
  {
    accessorKey: "targetId",
    header: "Đối tượng ID",
  },
  {
    accessorKey: "reason",
    header: "Lý do",
  },
  {
    accessorKey: "description",
    header: "Mô tả",
    cell: ({ row }) => (
      <p className="text-sm text-slate-600 line-clamp-2 whitespace-pre-wrap">
        {row.original.description || "-"}
      </p>
    ),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.original.status
      const badge = STATUS_LABELS[status] ?? { label: status, className: "bg-slate-100 text-slate-600" }

      return (
        <Badge className={badge.className} variant="secondary">
          {badge.label}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Thời gian",
    cell: ({ row }) => (
      <span className="text-sm text-slate-600">
        {new Intl.DateTimeFormat("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(new Date(row.original.createdAt))}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row, table }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => table.options.meta?.onViewDetail?.(row.original)}>
            Xem chi tiết
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]
