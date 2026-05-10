"use client"

import * as React from "react"
import { usePaymentHistory } from "@/hooks/queries/use-payment"
import { PaymentHistoryParams } from "@/lib/services/payment.service"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Receipt, 
  Package,
  Calendar,
  MoreVertical,
  Eye,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useDebounce } from "@/hooks/useDebounce"
import { RefundDialog } from "./_components/refund-dialog"
import { PaymentHistoryItem } from "@/lib/services/payment.service"

// We need a useDebounce hook. Let's check if it exists.
// If not, I'll implement a simple one or use a timeout.

export default function PaymentHistoryPage() {
  const [params, setParams] = React.useState<PaymentHistoryParams>({
    page: 0,
    size: 10,
    sortBy: "paymentDate",
    sortDir: "desc",
  })

  const [keyword, setKeyword] = React.useState("")
  const [selectedOrderId, setSelectedOrderId] = React.useState<number | null>(null)
  const [isRefundDialogOpen, setIsRefundDialogOpen] = React.useState(false)
  const debouncedKeyword = useDebounce(keyword, 500)

  React.useEffect(() => {
    setParams(prev => ({ ...prev, keyword: debouncedKeyword, page: 0 }))
  }, [debouncedKeyword])

  const { data: pageData, isLoading } = usePaymentHistory(params)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(date),
      time: new Intl.DateTimeFormat("vi-VN", { timeStyle: "short" }).format(date),
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "SUCCESS":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 rounded-full px-4 py-1 font-medium">
            Thành công
          </Badge>
        )
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 rounded-full px-4 py-1 font-medium">
            Đang xử lý
          </Badge>
        )
      case "FAILED":
        return (
          <Badge variant="destructive" className="rounded-full px-4 py-1 font-medium">
            Thất bại
          </Badge>
        )
      default:
        return <Badge variant="secondary" className="rounded-full px-4 py-1 font-medium">{status}</Badge>
    }
  }

  const canRefund = (payment: PaymentHistoryItem) => {
    if (payment.status !== "SUCCESS" || payment.refunded) return false
    const paymentDate = new Date(payment.paymentDate)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - paymentDate.getTime()) / (1000 * 3600 * 24))
    const progress = payment.progress || 0
    return diffDays <= 30 && progress < 30
  }

  const handleRefundClick = (orderId: number) => {
    setSelectedOrderId(orderId)
    setIsRefundDialogOpen(true)
  }

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "transactionNo",
      header: "MÃ GIAO DỊCH",
      cell: ({ row }) => (
        <span className="font-semibold text-indigo-600">#{row.getValue("transactionNo")}</span>
      ),
    },
    {
      accessorKey: "courses",
      header: "KHÓA HỌC",
      cell: ({ row }) => {
        const courses = row.original.courses
        const firstCourse = courses[0]
        if (!firstCourse) return null
        return (
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-20 shrink-0 rounded-lg overflow-hidden border bg-zinc-50 flex items-center justify-center">
              {firstCourse.thumbnail ? (
                <Image src={firstCourse.thumbnail} alt={firstCourse.title} fill className="object-cover" />
              ) : (
                <Package className="h-5 w-5 text-zinc-300" />
              )}
            </div>
            <span className="font-medium text-zinc-900 dark:text-zinc-100 max-w-[200px] truncate">
              {firstCourse.title}
              {courses.length > 1 && ` (+${courses.length - 1})`}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "paymentDate",
      header: ({ column }) => {
        const isDesc = params.sortDir === "desc"
        return (
          <button
            onClick={() => setParams(prev => ({ 
              ...prev, 
              sortDir: isDesc ? "asc" : "desc",
              page: 0 
            }))}
            className="flex items-center gap-1 hover:text-zinc-900 transition-colors"
          >
            THỜI GIAN
            {isDesc ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
          </button>
        )
      },
      cell: ({ row }) => {
        const { date, time } = formatDate(row.getValue("paymentDate"))
        return (
          <div className="flex flex-col text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{date}</span>
            <span className="text-zinc-400 text-xs">{time}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "amount",
      header: "SỐ TIỀN",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(row.getValue("amount"))}</span>
          <span className="text-[10px] uppercase font-bold text-zinc-400">NGÂN HÀNG: {row.original.bankCode}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "TRẠNG THÁI",
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
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
          <DropdownMenuContent align="end" className="rounded-xl min-w-[160px]">
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Eye className="h-4 w-4" /> Xem chi tiết
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Receipt className="h-4 w-4" /> Xem hóa đơn
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Download className="h-4 w-4" /> Tải về PDF
            </DropdownMenuItem>
            {canRefund(row.original) && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="gap-2 cursor-pointer text-amber-600 focus:text-amber-700 focus:bg-amber-50"
                  onClick={() => handleRefundClick(row.original.orderId)}
                >
                  <RotateCcw className="h-4 w-4" /> Yêu cầu hoàn tiền
                </DropdownMenuItem>
              </>
            )}
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Lịch sử thanh toán</h1>
        <p className="text-muted-foreground mt-2">Quản lý và xem lại tất cả các giao dịch của bạn</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 flex-1 w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Tìm kiếm mã giao dịch hoặc khóa học..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="pl-10 h-11 rounded-xl border-zinc-200"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <Select
            value={params.status || "ALL"}
            onValueChange={(value) => setParams(prev => ({ ...prev, status: value === "ALL" ? undefined : value, page: 0 }))}
          >
            <SelectTrigger className="w-[160px] h-11 rounded-xl border-zinc-200 shrink-0">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="SUCCESS">Thành công</SelectItem>
              <SelectItem value="PENDING">Đang xử lý</SelectItem>
              <SelectItem value="FAILED">Thất bại</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-950 border border-zinc-200 rounded-xl px-3 h-11">
             <Calendar className="h-4 w-4 text-zinc-400 shrink-0" />
             <input 
                type="date" 
                className="bg-transparent text-sm outline-none w-[110px]" 
                onChange={(e) => setParams(prev => ({ ...prev, startDate: e.target.value, page: 0 }))}
             />
             <span className="text-zinc-300">—</span>
             <input 
                type="date" 
                className="bg-transparent text-sm outline-none w-[110px]"
                onChange={(e) => setParams(prev => ({ ...prev, endDate: e.target.value, page: 0 }))}
             />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-100 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
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
                [1, 2, 3].map((i) => (
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
                  <TableCell colSpan={columns.length} className="h-32 text-center text-zinc-500">
                    Không tìm thấy giao dịch nào.
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
              Hiển thị {pageData.number * pageData.size + 1} đến {Math.min((pageData.number + 1) * pageData.size, pageData.totalElements)} trên {pageData.totalElements} giao dịch
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-xl"
                onClick={() => setParams(prev => ({ ...prev, page: (prev.page || 0) - 1 }))}
                disabled={pageData.first}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: pageData.totalPages }, (_, i) => (
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
                onClick={() => setParams(prev => ({ ...prev, page: (prev.page || 0) + 1 }))}
                disabled={pageData.last}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <RefundDialog 
        orderId={selectedOrderId}
        isOpen={isRefundDialogOpen}
        onClose={() => setIsRefundDialogOpen(false)}
      />
    </div>
  )
}
