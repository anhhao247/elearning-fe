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
  Gift
} from "lucide-react"

export function CourseSidebar({ course }: { course: CourseDetail }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const isDiscounted = course.discount && course.discount > 0 && course.discountedPrice

  return (
    <div className="bg-card rounded-2xl shadow-xl overflow-hidden border border-border sticky top-24 z-10 transition-all hover:shadow-2xl">
      {course.thumbnail ? (
        <div className="relative aspect-video w-full">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          {/* <button className="absolute inset-0 m-auto w-16 h-16 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 hover:scale-110 transition-all">
            <PlayCircle className="w-8 h-8" fill="currentColor" />
          </button> */}
        </div>
      ) : (
        <div className="w-full aspect-video bg-muted flex items-center justify-center">
          <span className="text-muted-foreground font-medium">Chưa có ảnh bìa</span>
        </div>
      )}

      <div className="p-6">
        <div className="flex flex-col gap-2 mb-6">
          {course.isFree ? (
            <span className="text-3xl font-bold text-emerald-600">Miễn phí</span>
          ) : isDiscounted ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">{formatPrice(course.discountedPrice!)}</span>
                <Badge variant="destructive" className="bg-rose-500 font-bold px-2 py-0.5 pointer-events-none">
                  Giảm {course.discount}%
                </Badge>
              </div>
              <span className="text-base text-muted-foreground line-through font-medium">
                {formatPrice(course.price)}
              </span>
            </div>
          ) : (
            <span className="text-3xl font-bold text-foreground">
              {formatPrice(course.price)}
            </span>
          )}
        </div>

        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full font-semibold text-base py-6 bg-purple-600 hover:bg-purple-700"
          >
            Thêm vào giỏ hàng
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full font-semibold text-base py-6 hover:bg-accent"
          >
            Mua ngay
          </Button>
        </div>

        <div className="flex items-center justify-evenly py-4 text-muted-foreground text-sm font-medium border-b border-border/80 mt-4">
          <button className="flex items-center gap-2 hover:text-foreground transition-colors group">
            <Heart className="w-4 h-4 group-hover:text-rose-500 group-hover:fill-rose-500 transition-colors" /> Yêu thích
          </button>
          <Separator orientation="vertical" className="h-4" />
          <button className="flex items-center gap-2 hover:text-foreground transition-colors group">
            <Share2 className="w-4 h-4 group-hover:text-primary transition-colors" /> Chia sẻ
          </button>
          <Separator orientation="vertical" className="h-4" />
          <button className="flex items-center gap-2 hover:text-foreground transition-colors group">
            <Gift className="w-4 h-4 group-hover:text-emerald-500 transition-colors" /> Tặng
          </button>
        </div>

        {course.hasMoneyBackGuarantee && (
          <div className="text-center py-4 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold rounded-lg mt-5 border border-emerald-500/20">
            Hoàn tiền 30 ngày nếu không hài lòng
          </div>
        )}

        <div className="mt-8">
          <h3 className="font-bold text-base mb-4 text-foreground/90">Khóa học này bao gồm:</h3>
          <ul className="space-y-3.5 text-sm font-medium text-foreground/80">
            {course.totalDuration && (
              <li className="flex items-center gap-3">
                <PlayCircle className="w-4 h-4 text-muted-foreground" /> 
                <span>{course.totalDuration} video bài giảng</span>
              </li>
            )}
            <li className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-muted-foreground" /> 
              <span>{course.totalLessons} bài học</span>
            </li>
            {course.hasLifetimeAccess && (
              <li className="flex items-center gap-3">
                <Infinity className="w-4 h-4 text-muted-foreground" /> 
                <span>Truy cập trọn đời</span>
              </li>
            )}
            {course.isMobileAccessible && (
              <li className="flex items-center gap-3">
                <MonitorSmartphone className="w-4 h-4 text-muted-foreground" /> 
                <span>Truy cập trên điện thoại và TV</span>
              </li>
            )}
            {course.hasCertificate && (
              <li className="flex items-center gap-3">
                <Trophy className="w-4 h-4 text-muted-foreground" /> 
                <span>Hoàn thành khóa học nhận chứng chỉ</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
