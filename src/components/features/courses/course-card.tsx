import Link from "next/link"
import Image from "next/image"
import { Course } from "@/types/course"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { generateSlug } from "@/lib/utils"

function formatMoney(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

function getLevelBadgeVariant(level: string) {
  switch (level) {
    case "BEGINNER":
      return "default"
    case "INTERMEDIATE":
      return "secondary"
    case "ADVANCED":
      return "destructive"
    default:
      return "outline"
  }
}

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/courses/${generateSlug(course.title, course.id)}`}>
      <Card className="h-full flex flex-col overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-border/50 bg-card">
        <div className="relative aspect-video w-full overflow-hidden bg-muted/30">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-accent/20 text-muted-foreground">
            <svg
              className="h-12 w-12 opacity-30"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <CardHeader className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant={getLevelBadgeVariant(course.level)} className="text-[10px] uppercase font-bold tracking-wider">
            {course.level}
          </Badge>
          {course.categoryName && (
            <span className="text-xs font-medium text-muted-foreground">{course.categoryName}</span>
          )}
        </div>
        <CardTitle className="line-clamp-2 text-lg group-hover:text-primary transition-colors duration-300">
          {course.title}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-sm">
          {course.shortDescription || course.description || "Chưa có mô tả ngắn"}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <span className="shrink-0 opacity-70">Giảng viên:</span>
          <span className="font-semibold text-foreground truncate">{course.instructorName || "Đang cập nhật"}</span>
        </div>
      </CardContent>

      <CardFooter className="border-t border-border/50 pt-4 mt-auto flex items-center justify-between bg-muted/5">
        <div className="font-bold text-lg">
          {course.isFree || course.price === 0 ? (
            <span className="text-primary font-bold">Miễn phí</span>
          ) : (
            <span className="text-foreground">{formatMoney(course.price)}</span>
          )}
        </div>
        <div className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
          Xem chi tiết →
        </div>
      </CardFooter>
    </Card>
    </Link>
  )
}