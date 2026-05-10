"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, Ticket, Loader2, Edit, MoreHorizontal } from "lucide-react"
import { getInstructorCoupons, InstructorCoupon } from "@/lib/services/instructor.service"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CreateCouponDialog } from "./_components/create-coupon-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function CouponsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<InstructorCoupon | null>(null)

  const { data: coupons = [], isLoading, refetch } = useQuery({
    queryKey: ['instructor-coupons'],
    queryFn: getInstructorCoupons,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Ticket className="w-6 h-6 text-blue-600" />
            Quản lý mã giảm giá
          </h1>
          <p className="text-slate-500 text-sm mt-1">Tạo và quản lý các mã ưu đãi cho khóa học của bạn</p>
        </div>
        <Button
          onClick={() => {
            setSelectedCoupon(null)
            setIsCreateOpen(true)
          }}
          className="bg-[#0a1128] hover:bg-[#0a1128]/90 text-white shadow-md font-semibold h-11 px-6 rounded-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo mã mới
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-slate-600 h-12">Mã (Code)</TableHead>
              <TableHead className="font-semibold text-slate-600">Giảm giá</TableHead>
              <TableHead className="font-semibold text-slate-600 text-center">Lượt dùng</TableHead>
              <TableHead className="font-semibold text-slate-600">Hạn sử dụng</TableHead>
              <TableHead className="font-semibold text-slate-600">Áp dụng cho</TableHead>
              <TableHead className="font-semibold text-slate-600 text-center">Trạng thái</TableHead>
              <TableHead className="font-semibold text-slate-600 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                </TableCell>
              </TableRow>
            ) : coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                  Bạn chưa có mã giảm giá nào. Hãy tạo mã đầu tiên nhé!
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => {
                const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date()
                const isMaxedOut = coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses
                const isUsable = coupon.isActive && !isExpired && !isMaxedOut

                return (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-bold text-slate-800">
                      <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 font-mono text-sm tracking-wide">
                        {coupon.code}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-amber-600">
                      {coupon.discountType === 'PERCENTAGE'
                        ? `${coupon.discountValue}%`
                        : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(coupon.discountValue)
                      }
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-slate-800 font-bold">{coupon.usedCount}</span>
                      <span className="text-slate-300 mx-1">/</span>
                      <span className="text-slate-500">{coupon.maxUses === null ? '∞' : coupon.maxUses}</span>
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">
                      {coupon.expiresAt
                        ? format(new Date(coupon.expiresAt), 'dd/MM/yyyy HH:mm')
                        : 'Không giới hạn'}
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">
                      {coupon.courseId === null
                        ? <span className="text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Tất cả khóa học</span>
                        : `ID: ${coupon.courseId}`}
                    </TableCell>
                    <TableCell className="text-center">
                      {isUsable ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 shadow-none font-semibold">Đang hoạt động</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-semibold shadow-none border-slate-200">
                          {isExpired ? 'Hết hạn' : isMaxedOut ? 'Hết lượt' : 'Đã tắt'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCoupon(coupon)
                              setIsCreateOpen(true)
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <CreateCouponDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        coupon={selectedCoupon}
        onSuccess={() => {
          setIsCreateOpen(false)
          setSelectedCoupon(null)
          refetch()
        }}
      />
    </div>
  )
}
