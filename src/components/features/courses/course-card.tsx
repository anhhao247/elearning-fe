import Link from "next/link"
import Image from "next/image"
import { Star } from "lucide-react"
import { Course } from "@/types/course"
import { Badge } from "@/components/ui/badge"
import { generateSlug } from "@/lib/utils"

function formatMoney(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

interface LevelConfig {
  label: string
  className: string
}

function getLevelConfig(level: string): LevelConfig {
  switch (level) {
    case "BEGINNER":
      return { label: "Cơ bản", className: "bg-success/10 text-success border border-success/30 dark:bg-success/20" }
    case "INTERMEDIATE":
      return { label: "Trung cấp", className: "bg-warning/10 text-warning border border-warning/30 dark:bg-warning/20" }
    case "ADVANCED":
      return { label: "Nâng cao", className: "bg-danger/10 text-danger border border-danger/30 dark:bg-danger/20" }
    default:
      return { label: level, className: "bg-muted text-muted-foreground border border-border" }
  }
}

function StarRating({ rating, total }: { rating: number; total?: number }) {
  const rounded = Math.round(rating * 2) / 2 // round to nearest 0.5
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              i <= rounded
                ? "fill-amber-400 text-amber-400"
                : "fill-muted text-muted"
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
        {rating.toFixed(1)}
      </span>
      {total !== undefined && (
        <span className="text-xs text-muted-foreground">({total.toLocaleString()} đánh giá)</span>
      )}
    </div>
  )
}

export function CourseCard({ course }: { course: Course }) {
  const levelConfig = getLevelConfig(course.level)

  return (
    <Link href={`/courses/${generateSlug(course.title, course.id)}`} className="block h-full">
      {/* card-base = rounded-xl border bg-background shadow-sm hover:shadow-md transition */}
      <div className="card-base h-full flex flex-col overflow-hidden group cursor-pointer hover:-translate-y-0.5 transition-all duration-300">

        {/* Thumbnail — 16:9 */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted/30 shrink-0">
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted/40 text-muted-foreground">
              <svg className="h-12 w-12 opacity-30" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Level badge — overlay on thumbnail */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            <span className={`${levelConfig.className} inline-flex items-center rounded-md px-2 py-0.5 text-label-badge`}>
              {levelConfig.label}
            </span>
          </div>
        </div>

        {/* Card body */}
        <div className="flex flex-col flex-1 p-4 gap-2">

          {/* Category tag */}
          {course.categoryName && (
            <span className="text-caption-meta text-muted-foreground">{course.categoryName}</span>
          )}

          {/* Title — max 2 lines */}
          <h3 className="text-card-module line-clamp-2 group-hover:text-primary transition-colors duration-200 flex-1">
            {course.title}
          </h3>

          {/* Instructor */}
          <p className="text-caption-meta text-muted-foreground truncate">
            {course.instructorName || "Giảng viên"}
          </p>

          {/* Rating + Reviews */}
          <div className="flex items-center gap-1.5">
            <StarRating rating={course.avgRating || 0} total={course.totalReviews || 0} />
          </div>

          {/* Price */}
          <div className="pt-1 border-t border-border/50 mt-auto">
            {course.isFree || course.price === 0 ? (
              <span className="font-bold text-base text-free">Miễn phí</span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-foreground">{formatMoney(course.price)}</span>
                {course.oldPrice && course.oldPrice > course.price && (
                  <span className="text-sm font-medium text-muted-foreground line-through">
                    {formatMoney(course.oldPrice)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}