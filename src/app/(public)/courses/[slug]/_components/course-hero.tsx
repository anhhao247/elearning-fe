"use client"

import { CourseDetail } from "@/types/course"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Clock, Users, BookOpen } from "lucide-react"
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbSeparator,
  BreadcrumbPage
} from "@/components/ui/breadcrumb"

interface CourseHeroProps {
  course: CourseDetail
}

export function CourseHero({ course }: CourseHeroProps) {
  return (
    <div className="bg-zinc-950 text-white py-12 lg:py-16">
      <div className="container max-w-7xl mx-auto px-4 md:px-8 space-y-6">
        <Breadcrumb className="text-zinc-400">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/courses" className="hover:text-white">Courses</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/courses?category=${course.category?.id}`} className="hover:text-white">
                {course.category?.name || "Category"}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-zinc-200">{course.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="max-w-3xl space-y-6">
          <div className="space-y-4">
            <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-none">
              {course.level}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              {course.title}
            </h1>
            {course.description && (
              <p className="text-lg text-zinc-300">
                {course.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-300">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-yellow-400">{course.avgRating?.toFixed(1) || "0.0"}</span>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.round(course.avgRating) ? "fill-current" : "text-zinc-600"}`} 
                  />
                ))}
              </div>
              <span className="underline">({course.totalReviews} đánh giá)</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{course.totalStudents} học viên</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>Cập nhật {new Date(course.updatedAt || course.createdAt).toLocaleDateString("vi-VN")}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Avatar className="w-10 h-10 border-2 border-zinc-800">
              <AvatarImage src={course.instructor?.avatar || ""} alt={course.instructor?.fullName} />
              <AvatarFallback className="bg-zinc-800 text-white">
                {course.instructor?.fullName?.charAt(0) || "GV"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-zinc-400">Được tạo bởi</p>
              <p className="font-medium">{course.instructor?.fullName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
