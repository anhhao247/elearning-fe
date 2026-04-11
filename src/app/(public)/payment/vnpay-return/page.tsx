"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { verifyVNPayReturn } from "@/lib/services/payment.service"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

function VNPayReturnContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'LOADING' | 'SUCCESS' | 'FAILED'>('LOADING')
  const [message, setMessage] = useState<string>("Đang xử lý thanh toán...")

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

  return (
    <div className="container max-w-md mx-auto py-20 px-4 min-h-[70vh] flex items-center justify-center">
      <Card className="text-center w-full shadow-xl border-border/50">
        <CardHeader className="space-y-6 pt-10">
          <div className="flex justify-center">
            {status === 'LOADING' && <Loader2 className="w-20 h-20 text-primary animate-spin" />}
            {status === 'SUCCESS' && <CheckCircle2 className="w-20 h-20 text-emerald-500" />}
            {status === 'FAILED' && <XCircle className="w-20 h-20 text-rose-500" />}
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl md:text-3xl font-bold">
              {status === 'LOADING' ? 'Đang xử lý kết quả...' : 
               status === 'SUCCESS' ? 'Thanh toán thành công' : 
               'Thanh toán thất bại'}
            </CardTitle>
            <CardDescription className="text-base md:text-lg text-muted-foreground mt-2">
              {message}
            </CardDescription>
          </div>
        </CardHeader>
        <CardFooter className="flex flex-col gap-3 pt-6 pb-10 px-8">
          {status === 'SUCCESS' ? (
            <>
              <Button size="lg" onClick={() => {
                const lastUrl = sessionStorage.getItem('last_purchased_course_url')
                router.push(lastUrl || '/my-courses')
              }} className="w-full font-semibold shadow-md">
                Quay lại khóa học
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push('/my-courses')} className="w-full">
                Đến khóa học của tôi
              </Button>
            </>
          ) : status === 'FAILED' ? (
            <div className="flex flex-col w-full gap-3">
              <Button size="lg" variant="default" onClick={() => router.back()} className="w-full">
                Thử lại
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push('/')} className="w-full">
                Về trang chủ
              </Button>
            </div>
          ) : null}
        </CardFooter>
      </Card>
    </div>
  )
}

export default function VNPayReturnPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    }>
      <VNPayReturnContent />
    </Suspense>
  )
}
