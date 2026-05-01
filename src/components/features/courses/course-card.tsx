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
      return { label: "Cơ bản", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" }
    case "INTERMEDIATE":
      return { label: "Trung cấp", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" }
    case "ADVANCED":
      return { label: "Nâng cao", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" }
    default:
      return { label: level, className: "bg-muted text-muted-foreground" }
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
        <span className="text-xs text-muted-foreground">({total.toLocaleString()})</span>
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
          <div className="absolute top-2 left-2">
            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${levelConfig.className}`}>
              {levelConfig.label}
            </span>
          </div>
        </div>

        {/* Card body */}
        <div className="flex flex-col flex-1 p-4 gap-2">

          {/* Category tag */}
          {course.categoryName && (
            <span className="text-label">{course.categoryName}</span>
          )}

          {/* Title — max 2 lines */}
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200 flex-1">
            {course.title}
          </h3>

          {/* Instructor */}
          <p className="text-body truncate">
            {course.instructorName || "Giảng viên"}
          </p>

          {/* Rating + Reviews */}
          {course.avgRating !== undefined && course.avgRating > 0 ? (
            <StarRating rating={course.avgRating} total={course.totalReviews} />
          ) : (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-muted text-muted" />
              ))}
              <span className="text-label ml-1">Chưa có đánh giá</span>
            </div>
          )}

          {/* Price */}
          <div className="pt-1 border-t border-border/50 mt-auto">
            {course.isFree || course.price === 0 ? (
              <span className="font-bold text-base text-primary">Miễn phí</span>
            ) : (
              <span className="font-bold text-base text-foreground">{formatMoney(course.price)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}