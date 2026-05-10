"use client"

import * as React from "react"
import { usePendingRefunds } from "@/hooks/queries/use-payment"
import { RefundItem } from "@/lib/services/payment.service"
import { 
  ColumnDef, 
  flexRender, 
  getCoreRowModel, 
  useReactTable 
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  MoreVertical,
  CheckCircle,
  XCircle,
  Eye,
  Calendar
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/useDebounce"
import { ProcessRefundDialog } from "./_components/process-refund-dialog"
import { RefundDetailDialog } from "./_components/refund-detail-dialog"

export default function InstructorRefundsPage() {
  const [params, setParams] = React.useState({
    page: 0,
    size: 10,
    sortBy: "createdAt",
    sortDir: "desc",
    keyword: ""
  })

  const [keyword, setKeyword] = React.useState("")
  const [selectedRefundId, setSelectedRefundId] = React.useState<number | null>(null)
  const [processStatus, setProcessStatus] = React.useState<'APPROVED' | 'REJECTED' | null>(null)
  const [isProcessDialogOpen, setIsProcessDialogOpen] = React.useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false)
  const debouncedKeyword = useDebounce(keyword, 500)

  React.useEffect(() => {
    setParams(prev => ({ ...prev, keyword: debouncedKeyword, page: 0 }))
  }, [debouncedKeyword])

  const { data: pageData, isLoading } = usePendingRefunds(params)

  const formatDate = (dateString: string) => {
    if (!dateString) return { date: "N/A", time: "" }
    const date = new Date(dateString)
    return {
      date: new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(date),
      time: new Intl.DateTimeFormat("vi-VN", { timeStyle: "short" }).format(date),
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 rounded-full px-4 py-1 font-medium">
            Đang chờ
          </Badge>
        )
      case "APPROVED":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 rounded-full px-4 py-1 font-medium">
            Đã duyệt
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200 rounded-full px-4 py-1 font-medium">
            Từ chối
          </Badge>
        )
      default:
        return <Badge variant="secondary" className="rounded-full px-4 py-1 font-medium">{status}</Badge>
    }
  }

  const handleProcessClick = (refundId: number, status: 'APPROVED' | 'REJECTED') => {
    setSelectedRefundId(refundId)
    setProcessStatus(status)
    setIsProcessDialogOpen(true)
  }

  const columns: ColumnDef<RefundItem>[] = [
    {
      accessorKey: "orderId",
      header: "MÃ ĐƠN HÀNG",
      cell: ({ row }) => (
        <span className="font-semibold text-indigo-600">#{row.getValue("orderId")}</span>
      ),
    },
    {
      accessorKey: "studentName",
      header: "HỌC VIÊN",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-zinc-900">{row.original.studentName || "N/A"}</span>
          <span className="text-xs text-zinc-400">@{row.original.username}</span>
        </div>
      ),
    },
    {
      accessorKey: "reason",
      header: "LÝ DO",
      cell: ({ row }) => (
        <p className="max-w-[300px] text-sm text-zinc-600 truncate" title={row.getValue("reason")}>
          {row.getValue("reason")}
        </p>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "THỜI GIAN YÊU CẦU",
      cell: ({ row }) => {
        const { date, time } = formatDate(row.getValue("createdAt"))
        return (
          <div className="flex flex-col text-sm">
            <span className="font-medium text-zinc-700">{date}</span>
            <span className="text-zinc-400 text-xs">{time}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "TRẠNG THÁI",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      id: "actions",
      header: "THAO TÁC",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <MoreVertical className="h-4 w-4 text-zinc-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl min-w-[180px]">
            <DropdownMenuItem 
              className="gap-2 cursor-pointer font-medium text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50"
              onClick={() => handleProcessClick(row.original.id, 'APPROVED')}
            >
              <CheckCircle className="h-4 w-4" /> Chấp nhận hoàn tiền
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="gap-2 cursor-pointer font-medium text-destructive focus:text-destructive focus:bg-destructive/5"
              onClick={() => handleProcessClick(row.original.id, 'REJECTED')}
            >
              <XCircle className="h-4 w-4" /> Từ chối yêu cầu
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="gap-2 cursor-pointer"
              onClick={() => {
                setSelectedRefundId(row.original.id)
                setIsDetailDialogOpen(true)
              }}
            >
              <Eye className="h-4 w-4" /> Xem chi tiết đơn hàng
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const table = useReactTable({
    data: pageData?.content || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Yêu cầu hoàn tiền</h1>
          <p className="text-muted-foreground mt-2">Xem và quản lý các yêu cầu hoàn tiền từ học viên của bạn</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
        <div className="flex items-center gap-2 flex-1 w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Tìm theo mã đơn hàng hoặc lý do..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="pl-10 h-11 rounded-xl border-zinc-200 focus:ring-indigo-500"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <Select
            value={params.sortBy}
            onValueChange={(value) => setParams(prev => ({ ...prev, sortBy: value, page: 0 }))}
          >
            <SelectTrigger className="w-[180px] h-11 rounded-xl border-zinc-200">
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="createdAt">Ngày tạo</SelectItem>
              <SelectItem value="updatedAt">Ngày cập nhật</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={params.sortDir}
            onValueChange={(value) => setParams(prev => ({ ...prev, sortDir: value, page: 0 }))}
          >
            <SelectTrigger className="w-[140px] h-11 rounded-xl border-zinc-200">
              <SelectValue placeholder="Thứ tự" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="desc">Mới nhất</SelectItem>
              <SelectItem value="asc">Cũ nhất</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-zinc-50/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-zinc-100">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="h-14 px-6 text-zinc-500 font-bold text-xs tracking-wider uppercase">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={columns.length} className="h-20 text-center animate-pulse bg-zinc-50/30" />
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-zinc-50/50 border-zinc-100 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-zinc-500 font-medium">
                    <div className="flex flex-col items-center gap-2">
                      <RotateCcw className="h-8 w-8 text-zinc-300" />
                      Chưa có yêu cầu hoàn tiền nào.
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pageData && pageData.totalPages > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 bg-zinc-50/30">
            <p className="text-sm text-zinc-500">
              Hiển thị {pageData.number * pageData.size + 1} đến {Math.min((pageData.number + 1) * pageData.size, pageData.totalElements)} trên {pageData.totalElements} yêu cầu
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-xl"
                onClick={() => setParams(prev => ({ ...prev, page: Math.max(0, prev.page - 1) }))}
                disabled={pageData.first}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(pageData.totalPages, 5) }, (_, i) => (
                  <Button
                    key={i}
                    variant={pageData.number === i ? "default" : "outline"}
                    size="icon"
                    className={cn("h-9 w-9 rounded-xl", pageData.number === i && "bg-indigo-600 hover:bg-indigo-700")}
                    onClick={() => setParams(prev => ({ ...prev, page: i }))}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-xl"
                onClick={() => setParams(prev => ({ ...prev, page: Math.min(pageData.totalPages - 1, prev.page + 1) }))}
                disabled={pageData.last}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <ProcessRefundDialog 
        refundId={selectedRefundId}
        status={processStatus}
        isOpen={isProcessDialogOpen}
        onClose={() => setIsProcessDialogOpen(false)}
      />

      <RefundDetailDialog 
        refundId={selectedRefundId}
        isOpen={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        onApprove={(id) => {
          setIsDetailDialogOpen(false)
          handleProcessClick(id, 'APPROVED')
        }}
        onReject={(id) => {
          setIsDetailDialogOpen(false)
          handleProcessClick(id, 'REJECTED')
        }}
      />
    </div>
  )
}
