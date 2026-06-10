"use client"

import { CourseDetail } from "@/types/course"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Clock, Users, BookOpen, ChevronLeft, Globe, CalendarDays } from "lucide-react"
import Link from "next/link"

interface CourseHeroProps {
  course: CourseDetail
}

const LEVEL_CONFIG: Record<string, { label: string; className: string }> = {
  BEGINNER: { label: "Cơ bản", className: "bg-success/10 text-success border-success/30" },
  INTERMEDIATE: { label: "Trung cấp", className: "bg-warning/10 text-warning border-warning/30" },
  ADVANCED: { label: "Nâng cao", className: "bg-danger/10 text-danger border-danger/30" },
}

export function CourseHero({ course }: CourseHeroProps) {
  const levelConfig = LEVEL_CONFIG[course.level] || { label: course.level, className: "bg-muted text-muted-foreground border-border" }

  return (
    <div className="bg-[#1c1d1f] dark:bg-zinc-900 text-white">
      <div className="page-container">
        {/* Back link */}
        <div className="pt-6 pb-2">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Quay lại danh sách khóa học
          </Link>
        </div>

        {/* Main hero grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 py-10 lg:pb-14">
          {/* Left: Course info (8/12) */}
          <div className="lg:col-span-8 min-w-0 space-y-5">
            {/* Category badge */}
            {course.category?.name && (
              <Badge className="bg-white/10 hover:bg-white/20 text-white border-none font-semibold text-xs px-3 py-1 rounded-md w-fit">
                {course.category.name}
              </Badge>
            )}

            {/* Title */}
            <h1 className="text-hero text-white max-w-[800px]">
              {course.title}
            </h1>

            {/* Description */}
            {course.description && (
              <div
                className="text-body text-zinc-300 max-w-none prose prose-invert prose-sm break-words text-left"
                dangerouslySetInnerHTML={{ __html: course.description }}
              />
            )}

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-4 text-caption-meta text-zinc-300">
              {/* Rating */}
              <div className="flex items-center gap-1.5">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < Math.round(course.avgRating) ? "fill-current" : "text-zinc-600"}`}
                    />
                  ))}
                </div>
                <span className="font-bold text-yellow-400">{course.avgRating?.toFixed(1) || "0.0"}</span>
                <span className="text-zinc-400">({course.totalReviews} đánh giá)</span>
              </div>

              {/* Students */}
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-zinc-400" />
                <span>{course.totalStudents.toLocaleString()} học viên</span>
              </div>

              {/* Duration */}
              {course.totalDuration && course.totalDuration !== "0m" && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <span>{course.totalDuration}</span>
                </div>
              )}
            </div>

            {/* Instructor */}
            <div className="flex items-center gap-3 pt-1 group/instructor">
              <Link href={`/instructors/${course.instructor?.id}`}>
                <Avatar className="w-10 h-10 border-2 border-zinc-600 ring-2 ring-white/10 group-hover/instructor:ring-primary/50 transition-all">
                  <AvatarImage src={course.instructor?.avatar || undefined} alt={course.instructor?.fullName} />
                  <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">
                    {course.instructor?.fullName?.charAt(0) || "GV"}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <p className="text-caption-meta text-zinc-400">Giảng viên hướng dẫn</p>
                <Link href={`/instructors/${course.instructor?.id}`} className="text-sm font-bold text-white hover:text-primary transition-colors cursor-pointer">
                  {course.instructor?.fullName}
                </Link>
              </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-5 text-caption-meta text-zinc-400 pt-2 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                <span>Tiếng Việt</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4" />
                <span>
                  Cập nhật{" "}
                  {new Date(course.updatedAt || course.createdAt).toLocaleDateString("vi-VN", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <Badge className={`${levelConfig.className} border text-label-badge`}>
                {levelConfig.label}
              </Badge>
            </div>
          </div>

          {/* Right: placeholder for sidebar alignment - actual sidebar floats up from below */}
          <div className="hidden lg:block lg:col-span-4" />
        </div>
      </div>
    </div>
  )
}
