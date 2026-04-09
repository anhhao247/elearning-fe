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
      <Card className="h-full flex flex-col overflow-hidden group hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
            <svg
              className="h-12 w-12 opacity-50"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      <CardHeader className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <Badge variant={getLevelBadgeVariant(course.level)} className="text-[10px] sm:text-xs">
            {course.level}
          </Badge>
          {course.categoryName && (
            <span className="text-xs text-muted-foreground">{course.categoryName}</span>
          )}
        </div>
        <CardTitle className="line-clamp-2 text-lg group-hover:text-primary transition-colors">
          {course.title}
        </CardTitle>
        <CardDescription className="line-clamp-2 mt-2">
          {course.shortDescription || course.description || "Chưa có mô tả ngắn"}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="text-sm text-muted-foreground">
          GV: <span className="font-medium text-foreground">{course.instructorName || "Đang cập nhật"}</span>
        </div>
      </CardContent>

      <CardFooter className="border-t pt-4 flex items-center justify-between">
        <div className="font-semibold text-lg">
          {course.isFree || course.price === 0 ? (
            <span className="text-green-600 dark:text-green-400">Miễn phí</span>
          ) : (
            <span className="text-primary">{formatMoney(course.price)}</span>
          )}
        </div>
      </CardFooter>
    </Card>
    </Link>
  )
}