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
    <div className="bg-primary/[0.03] dark:bg-primary/[0.05] border-b border-border/50 py-12 lg:py-16">
      <div className="container max-w-7xl mx-auto px-4 md:px-6 space-y-6">
        <Breadcrumb className="text-muted-foreground">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/courses" className="hover:text-primary transition-colors">Khóa học</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/courses?category=${course.category?.id}`} className="hover:text-primary transition-colors">
                {course.category?.name || "Danh mục"}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground font-semibold">{course.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="max-w-4xl space-y-6">
          <div className="space-y-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-bold uppercase tracking-wider text-[10px]">
              {course.level}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-foreground tracking-tight">
              {course.title}
            </h1>
            {course.description && (
              <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
                {course.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full">
              <span className="font-bold text-primary">{course.avgRating?.toFixed(1) || "0.0"}</span>
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3.5 h-3.5 ${i < Math.round(course.avgRating) ? "fill-current" : "text-muted-foreground/30"}`} 
                  />
                ))}
              </div>
              <span className="text-xs font-medium">({course.totalReviews} đánh giá)</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 opacity-70" />
              <span className="font-medium">{course.totalStudents} học viên</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 opacity-70" />
              <span className="font-medium">Cập nhật {new Date(course.updatedAt || course.createdAt).toLocaleDateString("vi-VN")}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-border/50">
            <Avatar className="w-12 h-12 border-2 border-background ring-2 ring-primary/10 shadow-sm">
              <AvatarImage src={course.instructor?.avatar || ""} alt={course.instructor?.fullName} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {course.instructor?.fullName?.charAt(0) || "GV"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground opacity-70">Giảng viên hướng dẫn</p>
              <p className="font-bold text-foreground text-lg">{course.instructor?.fullName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
