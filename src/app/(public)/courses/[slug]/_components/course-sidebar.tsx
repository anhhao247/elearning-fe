"use client"

import { CourseDetail } from "@/types/course"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  MonitorSmartphone,
  PlayCircle,
  Trophy,
  Infinity,
  ShieldCheck,
  Heart,
  Share2,
  Gift,
  Loader2,
  ShoppingCart,
  Zap,
  Flag,
} from "lucide-react"
import Link from "next/link"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/useAuthStore"
import { createOrder, createPayment, validateCoupon, ValidateCouponResponse } from "@/lib/services/payment.service"
import { enrollFreeCourse } from "@/lib/services/enrollment.service"
import { Input } from "@/components/ui/input"
import { Lock, CheckCircle2, CreditCard } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { ReportDialog } from "@/components/features/reports/report-dialog"

interface CourseSidebarProps {
  course: CourseDetail
}

export function CourseSidebar({ course }: CourseSidebarProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)

  const hasOldPrice = course.oldPrice && course.oldPrice > course.price

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<ValidateCouponResponse | null>(null)
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("vnpay")
  const [isReportOpen, setIsReportOpen] = useState(false)

  const user = useAuthStore((state) => state.user)
  const router = useRouter()
  const canReport = user?.role === "STUDENT" && course.isEnrolled

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    try {
      setIsValidatingCoupon(true)
      const res = await validateCoupon({ code: couponCode, courseId: course.id })
      setAppliedCoupon(res)
      toast.success(res.message || "Áp dụng mã giảm giá thành công!")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Mã giảm giá không hợp lệ")
      setAppliedCoupon(null)
    } finally {
      setIsValidatingCoupon(false)
    }
  }

  const handleBuyNow = () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để mua khóa học")
      router.push("/login")
      return
    }
    setIsModalOpen(true)
  }

  const handleFreeEnroll = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đăng ký khóa học")
      router.push("/login")
      return
    }
    try {
      setIsEnrolling(true)
      const response = await enrollFreeCourse(course.id)
      toast.success("🎉 Đăng ký khóa học thành công!")
      const slug = window.location.pathname.split("/").pop()
      const contentId = response.resumeContentId || course.modules?.[0]?.contents?.[0]?.id || 1
      router.push(`/courses/learning/${slug}/${contentId}`)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Đã xảy ra lỗi khi đăng ký khóa học")
    } finally {
      setIsEnrolling(false)
    }
  }

  const confirmPurchase = async () => {
    try {
      setIsProcessing(true)
      const orderResponse = await createOrder({
        userId: user!.id,
        couponId: appliedCoupon?.couponId,
        items: [{ courseId: course.id, price: appliedCoupon ? appliedCoupon.finalPrice : course.price }],
      })
      const paymentResponse = await createPayment({ orderId: orderResponse.orderId })
      if (paymentResponse.url) {
        sessionStorage.setItem("last_purchased_course_url", window.location.pathname)
        window.location.href = paymentResponse.url
      } else {
        throw new Error("Không lấy được link thanh toán")
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Đã xảy ra lỗi khi tạo thanh toán")
      setIsProcessing(false)
      setIsModalOpen(false)
    }
  }

  return (
    <>
      <div className="bg-card rounded-2xl shadow-xl overflow-hidden border border-border/50 lg:sticky lg:top-24 z-10">
        {/* Thumbnail */}
        {course.thumbnail ? (
          <div className="relative aspect-video w-full overflow-hidden bg-muted">
            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full aspect-video bg-muted flex items-center justify-center">
            <span className="text-muted-foreground font-medium text-sm">Chưa có ảnh bìa</span>
          </div>
        )}

        <div className="p-5 space-y-4">
          {/* Price */}
          {!course.isEnrolled && (
            <div>
              {course.isFree ? (
                <span className="text-3xl font-black text-free">Miễn phí</span>
              ) : hasOldPrice ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-3xl font-black text-foreground">
                    {formatPrice(course.price)}
                  </span>
                  <span className="text-lg font-medium text-muted-foreground line-through">
                    {formatPrice(course.oldPrice!)}
                  </span>
                  <Badge className="bg-rose-500 hover:bg-rose-500 text-white font-bold text-xs px-2 py-0.5 pointer-events-none">
                    {Math.round(((course.oldPrice! - course.price) / course.oldPrice!) * 100)}% OFF
                  </Badge>
                </div>
              ) : (
                <span className="text-3xl font-black text-foreground">{formatPrice(course.price)}</span>
              )}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="space-y-2.5">
            {course.isEnrolled ? (
              <Button
                size="lg"
                className="w-full font-bold text-base h-12 bg-primary hover:bg-primary/90 shadow-md"
                onClick={() => {
                  const slug = window.location.pathname.split("/").pop()
                  const contentId =
                    course.resumeContentId || course.modules?.[0]?.contents?.[0]?.id || 1
                  window.location.href = `/courses/learning/${slug}/${contentId}`
                }}
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                Học tiếp khóa học
              </Button>
            ) : course.isFree ? (
              <Button
                size="lg"
                className="w-full font-bold text-base h-12 bg-emerald-600 hover:bg-emerald-700 shadow-md"
                onClick={handleFreeEnroll}
                disabled={isEnrolling}
              >
                {isEnrolling ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="w-5 h-5 mr-2" />}
                Đăng ký miễn phí
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full font-bold text-base h-12 hover:bg-accent border-2 transition-all hover:scale-[1.01]"
                  onClick={handleBuyNow}
                >
                  Mua ngay
                </Button>
              </>
            )}
            {canReport && (
              <Button
                variant="outline"
                className="w-full font-semibold h-11 border-dashed"
                onClick={() => setIsReportOpen(true)}
              >
                <Flag className="w-4 h-4 mr-2" />
                Báo cáo khóa học
              </Button>
            )}
          </div>

          {/* Social actions */}
          {/* <div className="flex items-center justify-evenly py-2 text-muted-foreground text-sm">
            <button className="flex items-center gap-1.5 hover:text-foreground transition-colors group px-3 py-1.5 rounded-lg hover:bg-muted/50">
              <Heart className="w-4 h-4 group-hover:text-rose-500 transition-colors" />
              <span>Yêu thích</span>
            </button>
            <Separator orientation="vertical" className="h-4" />
            <button className="flex items-center gap-1.5 hover:text-foreground transition-colors group px-3 py-1.5 rounded-lg hover:bg-muted/50">
              <Share2 className="w-4 h-4 group-hover:text-primary transition-colors" />
              <span>Chia sẻ</span>
            </button>
            <Separator orientation="vertical" className="h-4" />
            <button className="flex items-center gap-1.5 hover:text-foreground transition-colors group px-3 py-1.5 rounded-lg hover:bg-muted/50">
              <Gift className="w-4 h-4 group-hover:text-emerald-500 transition-colors" />
              <span>Tặng</span>
            </button>
          </div> */}

          {/* Money-back guarantee */}
          {course.hasMoneyBackGuarantee && (
            <div className="flex items-center justify-center gap-2 py-3 bg-emerald-500/8 text-emerald-700 dark:text-emerald-400 font-semibold text-sm rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 transition-colors cursor-default">
              <ShieldCheck className="w-4 h-4" />
              Hoàn tiền trong 30 ngày
            </div>
          )}

          {/* Course includes */}
          <div>

          {canReport && (
            <ReportDialog
              open={isReportOpen}
              onOpenChange={setIsReportOpen}
              targetType="COURSE"
              targetId={course.id}
              subjectLabel="Khóa học"
              subjectName={course.title}
            />
          )}
            <h3 className="font-bold text-sm mb-3 text-foreground">Khóa học này bao gồm:</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {course.totalDuration && course.totalDuration !== "0m" && (
                <li className="flex items-center gap-3">
                  <PlayCircle className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                  <span>{course.totalDuration} video bài giảng</span>
                </li>
              )}
              {course.totalLessons > 0 && (
                <li className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                  <span>{course.totalLessons} bài học</span>
                </li>
              )}
              {course.hasLifetimeAccess && (
                <li className="flex items-center gap-3">
                  <Infinity className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                  <span>Truy cập trọn đời</span>
                </li>
              )}
              {course.isMobileAccessible && (
                <li className="flex items-center gap-3">
                  <MonitorSmartphone className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                  <span>Truy cập trên điện thoại và TV</span>
                </li>
              )}
              {course.hasCertificate && (
                <li className="flex items-center gap-3">
                  <Trophy className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                  <span>Nhận chứng chỉ hoàn thành</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Purchase confirmation dialog */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        if (!isProcessing) {
          setIsModalOpen(open)
          if (!open) {
            setCouponCode("")
            setAppliedCoupon(null)
          }
        }
      }}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-[#fafcff]">
          <DialogHeader className="px-6 py-5 bg-white border-b border-slate-100 flex-shrink-0">
            <DialogTitle className="text-xl font-bold text-[#0a1128]">Thanh toán khóa học</DialogTitle>
          </DialogHeader>

          <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6">
            {/* Course Info Card */}
            <div className="bg-[#f0f5ff] rounded-xl p-4 flex gap-5 border border-blue-100/40 shadow-sm">
              <div className="w-36 h-24 rounded-lg overflow-hidden shrink-0 bg-white">
                <img src={course.thumbnail || "/placeholder.jpg"} alt={course.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[10px] font-bold tracking-wider text-blue-500 uppercase mb-1.5">COURSE</span>
                <h3 className="font-semibold text-[#1a233a] leading-snug mb-3 line-clamp-2">{course.title}</h3>
                <Link href={`/instructors/${course.instructor.id}`} className="flex items-center gap-2 group/instructor">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 shrink-0 border border-slate-200 group-hover/instructor:ring-2 group-hover/instructor:ring-primary/30 transition-all">
                    {course.instructor.avatar ? (
                      <img src={course.instructor.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <span className="text-xs font-medium text-slate-500 group-hover:text-primary transition-colors">{course.instructor.fullName || course.instructor.username}</span>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-8">
              {/* Left Column */}
              <div className="space-y-7">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700">Mã giảm giá</h4>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nhập mã..."
                      className="h-11 bg-white rounded-lg border-slate-200 focus-visible:ring-[#0a1128]"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      disabled={isValidatingCoupon || !couponCode.trim()}
                      className="h-11 px-6 bg-[#0a1128] hover:bg-[#0a1128]/90 text-white font-medium rounded-lg"
                    >
                      {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Áp dụng"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700">Phương thức thanh toán</h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => setPaymentMethod("vnpay")}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${paymentMethod === "vnpay"
                          ? "border-[#6be3ab] bg-[#eefbfa]"
                          : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-7 bg-[#1756a8] rounded text-[11px] text-white font-black flex items-center justify-center tracking-wide">
                          VNPay
                        </div>
                        <span className="font-medium text-slate-700 text-sm">Thanh toán qua VNPay</span>
                      </div>
                      {paymentMethod === "vnpay" ? (
                        <CheckCircle2 className="w-5 h-5 text-[#29b674]" />
                      ) : <div className="w-5 h-5 rounded-full border-2 border-slate-200" />}
                    </button>

                    <button
                      onClick={() => setPaymentMethod("card")}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${paymentMethod === "card"
                          ? "border-[#6be3ab] bg-[#eefbfa]"
                          : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-slate-400 ml-3 mr-1" />
                        <span className="font-medium text-slate-700 text-sm">Thanh toán thẻ Quốc tế</span>
                      </div>
                      {paymentMethod === "card" ? (
                        <CheckCircle2 className="w-5 h-5 text-[#29b674]" />
                      ) : <div className="w-5 h-5 rounded-full border-2 border-slate-200" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Summary */}
              <div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                  <div className="space-y-4">
                    <div className="flex justify-between text-[13px]">
                      <span className="text-slate-500 font-medium">Tạm tính</span>
                      <span className="font-bold text-slate-700">{formatPrice(course.price)}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-[13px]">
                        <span className="text-slate-500 font-medium">Giảm giá</span>
                        <span className="font-bold text-[#eb7724]">
                          -{formatPrice(appliedCoupon.discountAmount)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="my-5 border-t-2 border-dashed border-slate-100" />

                  <div className="space-y-2">
                    <span className="text-[13px] text-slate-500 font-medium block">Tổng thanh toán</span>
                    <div className="text-2xl font-black text-[#0a1128]">
                      {formatPrice(appliedCoupon ? appliedCoupon.finalPrice : course.price)}
                    </div>
                  </div>

                  {appliedCoupon && (
                    <div className="mt-5 bg-[#7af1ba] text-[#0d5934] p-3.5 rounded-lg flex gap-2.5 items-start text-[11px] leading-relaxed font-semibold">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 opacity-80" />
                      <span>Tiết kiệm {appliedCoupon.discountValue}{appliedCoupon.discountType === "PERCENTAGE" ? "%" : "đ"} với chương trình ưu đãi {appliedCoupon.code}.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#f0f4f9] px-6 py-5 border-t border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium leading-tight">
              <Lock className="w-5 h-5 text-[#29b674]" />
              <span>Secure transaction with 256-bit SSL<br />encryption</span>
            </div>
            <Button
              onClick={confirmPurchase}
              disabled={isProcessing}
              className="w-full sm:w-auto min-w-[220px] h-12 bg-[#0a1128] hover:bg-[#0a1128]/90 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all text-sm"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
              Thanh toán ngay
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
