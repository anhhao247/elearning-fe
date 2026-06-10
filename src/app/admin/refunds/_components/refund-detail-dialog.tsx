"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAdminRefundDetail } from "@/hooks/queries/use-payment"
import { Loader2, User, CreditCard, BookOpen, Info, Calendar, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"

interface RefundDetailDialogProps {
  refundId: number | null
  isOpen: boolean
  onClose: () => void
  onApprove: (refundId: number) => void
  onReject: (refundId: number) => void
}

export function RefundDetailDialog({ 
  refundId, 
  isOpen, 
  onClose,
  onApprove,
  onReject 
}: RefundDetailDialogProps) {
  const { data: refund, isLoading } = useAdminRefundDetail(refundId)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ"
  }

  const formatDate = (dateString: string, includeTime = false) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    if (includeTime) {
       return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date)
    }
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[750px] p-0 overflow-hidden rounded-xl border shadow-2xl bg-white">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <DialogTitle className="sr-only">Đang tải chi tiết hoàn tiền</DialogTitle>
            <DialogDescription className="sr-only">Vui lòng đợi trong giây lát...</DialogDescription>
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : refund ? (
          <div className="flex flex-col">
            {/* Header */}
            <div className="p-6 border-b">
               <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle className="text-xl font-bold text-zinc-900">Chi tiết yêu cầu hoàn tiền</DialogTitle>
                    <DialogDescription className="sr-only">
                      Xem thông tin chi tiết và xử lý yêu cầu hoàn tiền của học viên.
                    </DialogDescription>
                    <div className="flex items-center gap-3 mt-2">
                       <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none px-2 py-0.5 rounded flex items-center gap-1.5 font-bold text-[10px] uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                          CHỜ XỬ LÝ
                       </Badge>
                       <span className="text-xs text-zinc-400 font-medium">ID Yêu cầu: #REQ-{refund.id}</span>
                    </div>
                  </div>
               </div>
            </div>

            <ScrollArea className="max-h-[calc(90vh-180px)]">
              <div className="p-8 space-y-10">
                {/* Thông tin yêu cầu */}
                <section>
                  <h3 className="text-base font-bold text-slate-700 mb-5 flex items-center gap-2">
                    <Info className="h-4 w-4 text-slate-400" /> Thông tin yêu cầu
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#f4f7ff] p-5 rounded-lg border border-indigo-50/50">
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2">NGƯỜI YÊU CẦU</p>
                      <p className="font-bold text-slate-900 text-sm">{refund.username || "N/A"}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{refund.email || "N/A"}</p>
                    </div>
                    <div className="bg-[#f4f7ff] p-5 rounded-lg border border-indigo-50/50">
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2">NGÀY GỬI YÊU CẦU</p>
                      <p className="font-bold text-slate-900 text-sm">{formatDate(refund.createdAt)}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                         Lý do: <span className="italic font-medium text-slate-600">"{refund.reason}"</span>
                      </p>
                    </div>
                  </div>
                </section>

                {/* Khóa học liên quan */}
                <section>
                  <h3 className="text-base font-bold text-slate-700 mb-5 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-slate-400" /> Khóa học liên quan
                  </h3>
                  <div className="space-y-3">
                    {refund.courses?.map((course) => (
                      <div key={course.courseId} className="flex items-center gap-5 p-4 border border-slate-200 rounded-xl">
                        <div className="relative h-20 w-36 shrink-0 rounded-lg overflow-hidden border">
                          {course.thumbnail ? (
                            <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                              <BookOpen className="h-8 w-8 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-3">
                          <p className="font-bold text-slate-900 text-base">{course.title}</p>
                          <div className="flex items-center gap-6">
                             <div className="flex items-center gap-2 text-sm font-bold text-emerald-600">
                               <CreditCard className="h-3.5 w-3.5" />
                               {formatCurrency(course.price)}
                             </div>
                             <div className="flex-1 space-y-1.5">
                                <div className="flex justify-between items-end">
                                   <span className="text-[11px] font-bold text-slate-500">Tiến độ học tập</span>
                                   <span className="text-[11px] font-bold text-emerald-600">{course.progressPercent}%</span>
                                </div>
                                <Progress value={course.progressPercent} className="h-1.5 bg-slate-100" />
                             </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Chi tiết thanh toán */}
                <section>
                  <h3 className="text-base font-bold text-slate-700 mb-5 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" /> Chi tiết thanh toán
                  </h3>
                  <div className="flex gap-8">
                    <div className="flex-1 space-y-6">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ĐƠN HÀNG GỐC</p>
                             <p className="text-sm font-bold text-slate-900">#{refund.orderId}</p>
                             <p className="text-[10px] text-slate-400 font-medium">Ngày tạo: {formatDate(refund.order?.createdAt || "")}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GIAO DỊCH</p>
                             <p className="text-sm font-bold text-slate-900">#{refund.payment?.transactionNo}</p>
                             <p className="text-[10px] text-slate-400 font-medium">Ngân hàng: {refund.payment?.bankCode}</p>
                          </div>
                       </div>
                       <div className="bg-[#f8fafc] border border-slate-100 rounded-lg p-3 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center">
                             <Calendar className="h-4 w-4 text-slate-400" />
                          </div>
                          <p className="text-[11px] text-slate-600 font-medium">
                            Thanh toán hoàn tất vào lúc: <span className="font-bold text-slate-900">{formatDate(refund.payment?.paymentDate || "")}</span>
                          </p>
                       </div>
                    </div>

                    <div className="w-80 bg-[#0f172a] rounded-xl p-6 text-white space-y-6">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TỔNG KẾT TÀI CHÍNH</p>
                       <div className="space-y-4">
                          <div className="flex justify-between items-center text-sm">
                             <span className="text-slate-400 font-medium">Giá niêm yết:</span>
                             <span className="font-bold">{formatCurrency((refund.order?.totalPrice || 0) + (refund.order?.discountAmount || 0))}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                             <span className="text-slate-400 font-medium">Giảm giá:</span>
                             <span className="font-bold text-rose-400">- {formatCurrency(refund.order?.discountAmount || 0)}</span>
                          </div>
                          <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
                             <span className="text-sm font-bold">Thực trả:</span>
                             <span className="text-xl font-bold text-emerald-400">{formatCurrency(refund.order?.totalPrice || 0)}</span>
                          </div>
                       </div>
                    </div>
                  </div>
                </section>
              </div>
            </ScrollArea>

            <DialogFooter className="p-5 border-t bg-white flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={onClose} className="rounded-lg text-slate-600 font-bold px-8">
                Đóng
              </Button>
              <div className="w-px h-6 bg-slate-200 mx-2" />
              <Button 
                variant="outline" 
                onClick={() => onReject(refund.id)}
                className="rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold px-6"
              >
                Từ chối
              </Button>
              <Button 
                onClick={() => onApprove(refund.id)}
                className="rounded-lg bg-[#0f172a] hover:bg-slate-800 text-white font-bold px-6"
              >
                Duyệt hoàn tiền
              </Button>
            </DialogFooter>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
