"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { getCourseDetail } from "@/lib/services/course.service"
import { CourseHero } from "./_components/course-hero"
import { CourseSyllabus } from "./_components/course-syllabus"
import { CourseSidebar } from "./_components/course-sidebar"
import { CourseReviews } from "./_components/course-reviews"
import { Loader2 } from "lucide-react"
import { extractIdFromSlug } from "@/lib/utils"
import { AiChatbox } from "@/components/features/ai-chatbox"

export default function CourseDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  const idStr = slug ? extractIdFromSlug(slug) : ""

  const { data: course, isLoading, isError } = useQuery({
    queryKey: ["courseDetail", idStr],
    queryFn: () => getCourseDetail(idStr),
    enabled: !!idStr
  })

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Đang tải thông tin khóa học...</p>
      </div>
    )
  }

  if (isError || !course) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <p className="text-xl font-bold text-destructive">Lỗi khi tải thông tin khóa học</p>
        <p className="text-muted-foreground">Vui lòng thử lại sau.</p>
      </div>
    )
  }

  return (
    <main className="bg-zinc-50/50 dark:bg-background pb-24 min-h-screen">
      <CourseHero course={course} />
      
      <div className="container py-12 max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative items-start">
          
          {/* Cột chính: Mở rộng 8/12 layout (tương đương 2/3) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Component Tổng quan môn học (Tùy chọn hiển thị Description chi tiết nếu có HTML content, hiện tại dùng basic description) */}
            {course.description && (
              <section className="space-y-4 bg-card rounded-xl p-6 md:p-8 shadow-sm border border-border/50">
                <h2 className="text-2xl font-bold tracking-tight">Về khóa học này</h2>
                <div className="text-muted-foreground leading-relaxed text-[15px]">
                  {course.description}
                </div>
              </section>
            )}

            <CourseSyllabus modules={course.modules || []} />
            
            <CourseReviews 
              reviews={course.reviews || []} 
              ratingDistribution={course.ratingDistribution} 
              avgRating={course.avgRating} 
              totalReviews={course.totalReviews} 
            />
          </div>

          {/* Cột Sidebar: 4/12 layout (tương đương 1/3) */}
          <aside className="lg:col-span-4 relative mt-[-100px] lg:mt-[-280px]">
            <CourseSidebar course={course} />
          </aside>
          
        </div>
      </div>

      {/* AI Chatbox - floating assistant */}
      <AiChatbox courseId={Number(idStr)} />
    </main>
  )
}
