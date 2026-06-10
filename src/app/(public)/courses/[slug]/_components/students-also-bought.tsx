"use client"

import { useQuery } from "@tanstack/react-query"
import { getCourses } from "@/lib/services/course.service"
import { generateSlug } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StudentsAlsoBoughtProps {
  categoryId?: number
  currentCourseId: number
}

const LEVEL_CONFIG: Record<string, { label: string; className: string }> = {
  BEGINNER: { label: "Cơ bản", className: "bg-success/10 text-success border border-success/30" },
  INTERMEDIATE: { label: "Trung cấp", className: "bg-warning/10 text-warning border border-warning/30" },
  ADVANCED: { label: "Nâng cao", className: "bg-danger/10 text-danger border border-danger/30" },
}

export function StudentsAlsoBought({ categoryId, currentCourseId }: StudentsAlsoBoughtProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["relatedCourses", categoryId, currentCourseId],
    queryFn: () =>
      getCourses({
        page: "0",
        limit: "6",
        sortDir: "desc",
      }),
    enabled: true,
  })

  // Filter out current course and take max 3
  const relatedCourses = data?.content
    ?.filter((c) => c.id !== currentCourseId)
    ?.slice(0, 3) ?? []

  if (isLoading) return null
  if (relatedCourses.length === 0) return null

  return (
    <section className="mt-16 mb-4">
      {/* Section header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Học viên cũng quan tâm</h2>
          <p className="text-sm text-muted-foreground mt-1">Các khóa học thường đăng ký cùng khóa học này</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 font-semibold gap-2 border-2 hover:bg-accent"
          asChild
        >
          <Link href="/courses">
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedCourses.map((course) => {
          const isDiscounted = course.isFree
          const levelConfig = LEVEL_CONFIG[course.level] || { label: course.level, className: "bg-muted text-muted-foreground border border-border" }

          return (
            <Link
              key={course.id}
              href={`/courses/${generateSlug(course.title, course.id)}`}
              className="group flex flex-col rounded-2xl overflow-hidden border border-border/50 bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {course.thumbnail ? (
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted/50">
                    <span className="text-muted-foreground text-sm">Chưa có ảnh</span>
                  </div>
                )}
                {/* Overlay badges */}
                <div className="absolute inset-x-3 top-3 flex items-start justify-between">
                  <Badge className={`${levelConfig.className} font-semibold text-xs backdrop-blur-sm`}>
                    {levelConfig.label}
                  </Badge>
                  {course.isFree && (
                    <Badge className="bg-free/10 text-free border border-free/30 font-bold text-xs">
                      MIỄN PHÍ
                    </Badge>
                  )}
                </div>
              </div>

              {/* Card body */}
              <div className="flex flex-col flex-1 p-5 gap-3">
                <div className="flex items-center justify-between gap-2">
                  {course.categoryName && (
                    <span className="text-xs font-semibold text-primary">{course.categoryName}</span>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(course.updatedAt || course.createdAt).toLocaleDateString("vi-VN", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <h3 className="font-bold text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                  {course.title}
                </h3>

                {course.instructorName && (
                  <p className="text-xs text-muted-foreground">
                    by <span className="font-semibold">{course.instructorName}</span>
                  </p>
                )}

                {course.description && (
                  <div 
                    className="text-sm text-muted-foreground line-clamp-2 leading-relaxed [&_*]:inline"
                    dangerouslySetInnerHTML={{ __html: course.description }}
                  />
                )}

                {/* Price */}
                <div className="mt-auto pt-3 border-t border-border/40 flex items-center justify-between">
                  <span className="font-bold text-base text-foreground">
                    {course.isFree || course.price === 0 ? (
                      <span className="text-free">Miễn phí</span>
                    ) : (
                      new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(course.price)
                    )}
                  </span>
                  <span className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity translate-x-1 group-hover:translate-x-0 flex items-center gap-1">
                    Xem chi tiết <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
