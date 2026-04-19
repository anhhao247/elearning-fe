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
} from "lucide-react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/useAuthStore"
import { createOrder, createPayment } from "@/lib/services/payment.service"
import { enrollFreeCourse } from "@/lib/services/enrollment.service"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface CourseSidebarProps {
  course: CourseDetail
}

export function CourseSidebar({ course }: CourseSidebarProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)

  const isDiscounted = course.discount && course.discount > 0 && course.discountedPrice

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const user = useAuthStore((state) => state.user)
  const router = useRouter()

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
      const priceToPay = isDiscounted ? course.discountedPrice! : course.price
      const orderResponse = await createOrder({
        userId: user!.id,
        items: [{ courseId: course.id, price: priceToPay }],
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
      <div className="bg-card rounded-2xl shadow-xl overflow-hidden border border-border/50 sticky top-6 z-10">
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
                <span className="text-3xl font-black text-emerald-600">Miễn phí</span>
              ) : isDiscounted ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-3xl font-black text-foreground">
                    {formatPrice(course.discountedPrice!)}
                  </span>
                  <span className="text-lg font-medium text-muted-foreground line-through">
                    {formatPrice(course.price)}
                  </span>
                  <Badge className="bg-rose-500 hover:bg-rose-500 text-white font-bold text-xs px-2 py-0.5 pointer-events-none">
                    {course.discount}% OFF
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
                  className="w-full font-bold text-base h-12 bg-violet-600 hover:bg-violet-700 shadow-md transition-all hover:scale-[1.01]"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Thêm vào giỏ hàng
                </Button>
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
          </div>

          {/* Social actions */}
          <div className="flex items-center justify-evenly py-2 text-muted-foreground text-sm">
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
          </div>

          {/* Money-back guarantee */}
          {course.hasMoneyBackGuarantee && (
            <div className="flex items-center justify-center gap-2 py-3 bg-emerald-500/8 text-emerald-700 dark:text-emerald-400 font-semibold text-sm rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 transition-colors cursor-default">
              <ShieldCheck className="w-4 h-4" />
              Hoàn tiền trong 30 ngày
            </div>
          )}

          {/* Course includes */}
          <div>
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
      <Dialog open={isModalOpen} onOpenChange={(open) => !isProcessing && setIsModalOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận thanh toán</DialogTitle>
            <DialogDescription>
              Bạn đang tiến hành mua khóa học{" "}
              <span className="font-bold text-foreground">{course.title}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Giá gốc:</span>
              <span className={isDiscounted ? "line-through text-muted-foreground" : "font-medium"}>
                {formatPrice(course.price)}
              </span>
            </div>
            {isDiscounted && (
              <div className="flex justify-between text-rose-500 font-medium">
                <span>Giảm giá:</span>
                <span>-{course.discount}%</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Tổng thanh toán:</span>
              <span className="text-primary">
                {formatPrice(isDiscounted ? course.discountedPrice! : course.price)}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isProcessing}
            >
              Hủy
            </Button>
            <Button onClick={confirmPurchase} disabled={isProcessing}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xác nhận & Thanh toán
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
