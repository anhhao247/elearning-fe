"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { verifyVNPayReturn } from "@/lib/services/payment.service"
import { Button } from "@/components/ui/button"
import { Check, X, Headset, Loader2 } from "lucide-react"

function formatVNPayDate(dateString: string | null) {
  if (!dateString || dateString.length !== 14) return ""
  const year = dateString.substring(0, 4)
  const month = dateString.substring(4, 6)
  const day = dateString.substring(6, 8)
  const hour = dateString.substring(8, 10)
  const minute = dateString.substring(10, 12)
  return `${day}/${month}/${year}, ${hour}:${minute}`
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
}

function VNPayReturnContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'LOADING' | 'SUCCESS' | 'FAILED'>('LOADING')
  const [message, setMessage] = useState<string>("Đang xử lý thanh toán...")

  const amountStr = searchParams.get('vnp_Amount')
  const amount = amountStr ? Number(amountStr) / 100 : 0
  const orderCode = searchParams.get('vnp_TxnRef') || ""
  const payDate = formatVNPayDate(searchParams.get('vnp_PayDate'))
  const errorCode = searchParams.get('vnp_ResponseCode') || ""

  useEffect(() => {
    const processPayment = async () => {
      try {
        const queryString = searchParams.toString()
        if (!queryString) {
          setStatus('FAILED')
          setMessage('Không tìm thấy thông tin thanh toán.')
          return
        }

        const data = await verifyVNPayReturn(queryString)

        if (data.status === 'SUCCESS') {
          setStatus('SUCCESS')
          setMessage(data.message || 'Thanh toán thành công!')
        } else {
          setStatus('FAILED')
          setMessage(data.message || 'Thanh toán thất bại hoặc đã bị hủy giao dịch.')
        }
      } catch (error: any) {
        setStatus('FAILED')
        setMessage(error?.response?.data?.message || 'Có lỗi xảy ra khi xác thực thanh toán.')
      }
    }

    processPayment()
  }, [searchParams])

  if (status === 'LOADING') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-[#0a1128] animate-spin" />
        <p className="text-slate-500 font-medium">Đang xử lý kết quả thanh toán...</p>
      </div>
    )
  }

  if (status === 'SUCCESS') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-slate-50/50">
        <div className="bg-white max-w-xl w-full rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 flex flex-col items-center">
          
          <div className="w-20 h-20 bg-[#eefbfa] rounded-full flex items-center justify-center mb-6 border-8 border-[#eefbfa]/50 relative">
            <div className="absolute w-2 h-2 rounded-full bg-orange-400 -left-6 top-4" />
            <div className="absolute w-3 h-3 rounded-full bg-emerald-300 right-0 -top-4" />
            <div className="absolute w-2 h-2 rounded-full bg-blue-300 bottom-0 -right-4" />
            <div className="w-12 h-12 bg-[#29b674] rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Check className="w-6 h-6 text-white stroke-[3]" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-[#0a1128] mb-4 text-center">Thanh toán thành công!</h2>
          <p className="text-center text-slate-500 mb-8 max-w-sm leading-relaxed">
            Chúc mừng bạn đã thanh toán thành công khóa học. Bắt đầu hành trình học tập ngay thôi!
          </p>

          <div className="w-full bg-[#f4f7fc] rounded-xl p-6 mb-8">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Chi tiết đơn hàng</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Mã đơn hàng</span>
                <span className="font-bold text-slate-900">#{orderCode}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Phương thức</span>
                <span className="font-medium text-slate-900">VNPay</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Thời gian</span>
                <span className="font-medium text-slate-900">{payDate}</span>
              </div>
              <div className="border-t border-slate-200/60 my-4" />
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Tổng thanh toán</span>
                <span className="text-xl font-bold text-[#0a1128]">{formatPrice(amount)}</span>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col sm:flex-row gap-4">
            <Button 
              className="flex-1 h-12 bg-[#0a1128] hover:bg-[#0a1128]/90 text-white font-semibold rounded-lg"
              onClick={() => {
                const lastUrl = sessionStorage.getItem('last_purchased_course_url')
                router.push(lastUrl || '/my-courses')
              }}
            >
              Vào học ngay
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 h-12 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 rounded-lg"
              onClick={() => router.push('/my-courses')}
            >
              Xem khóa học
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-slate-50/50">
      <div className="bg-white max-w-xl w-full rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 flex flex-col items-center">
        
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
          <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-500">
            <X className="w-6 h-6 stroke-[3]" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-[#0a1128] mb-4 text-center">Thanh toán thất bại</h2>
        <p className="text-center text-slate-500 mb-8 max-w-sm leading-relaxed">
          Rất tiếc, đã có lỗi xảy ra trong quá trình xử lý thanh toán của bạn. Vui lòng kiểm tra lại số dư tài khoản hoặc phương thức thanh toán.
        </p>

        <div className="w-full bg-white border border-slate-100 rounded-xl p-6 shadow-sm mb-8 space-y-5">
          <div>
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Mã lỗi</h3>
            <div className="font-semibold text-rose-600">{errorCode} - Lỗi giao dịch</div>
          </div>
          <div>
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Lý do</h3>
            <div className="text-slate-700 text-sm">{message}</div>
          </div>
        </div>

        <Button 
          className="w-full h-12 bg-[#0a1128] hover:bg-[#0a1128]/90 text-white font-semibold rounded-lg mb-6"
          onClick={() => router.back()}
        >
          Thử lại ngay
        </Button>

        <button 
          className="flex items-center gap-2 text-sm text-[#0a1128] font-bold hover:underline"
          onClick={() => router.push('/contact')}
        >
          <Headset className="w-4 h-4" />
          Liên hệ hỗ trợ
        </button>
      </div>
    </div>
  )
}

export default function VNPayReturnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-[#0a1128] animate-spin" />
        <p className="text-slate-500 font-medium">Đang tải...</p>
      </div>
    }>
      <VNPayReturnContent />
    </Suspense>
  )
}
