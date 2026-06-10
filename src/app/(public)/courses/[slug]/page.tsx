"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { getCourseDetail } from "@/lib/services/course.service"
import { CourseHero } from "./_components/course-hero"
import { CourseSyllabus } from "./_components/course-syllabus"
import { CourseSidebar } from "./_components/course-sidebar"
import { CourseReviews } from "./_components/course-reviews"
import { CourseInfoTabs } from "./_components/course-info-tabs"
import { StudentsAlsoBought } from "./_components/students-also-bought"
import { Loader2 } from "lucide-react"
import { extractIdFromSlug } from "@/lib/utils"

export default function CourseDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  const idStr = slug ? extractIdFromSlug(slug) : ""

  const { data: course, isLoading, isError } = useQuery({
    queryKey: ["courseDetail", idStr],
    queryFn: () => getCourseDetail(idStr),
    enabled: !!idStr,
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
    <main className="bg-zinc-50/50 dark:bg-background min-h-screen">
      {/* Hero section - dark background */}
      <CourseHero course={course} />

      {/* Main content + sidebar */}
      <div className="page-container pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 relative items-start">

          {/* Main column: 8/12 */}
          <div className="lg:col-span-8 min-w-0 space-y-6 pt-8">
            {/* Info tabs: Overview / Requirements / Benefits / Techniques */}
            <CourseInfoTabs course={course} />

            {/* Syllabus */}
            <CourseSyllabus
              modules={course.modules || []}
              totalDuration={course.totalDuration}
              totalLessons={course.totalLessons}
              totalChapters={course.totalChapters}
            />

            {/* Reviews */}
            <CourseReviews
              reviews={course.reviews || []}
              ratingDistribution={course.ratingDistribution}
              avgRating={course.avgRating}
              totalReviews={course.totalReviews}
              isEnrolled={course.isEnrolled}
              courseId={course.id}
              courseTitle={course.title}
            />
          </div>

          {/* Sidebar: 4/12 — float up to overlap the dark hero */}
          <aside className="lg:col-span-4 relative mt-0 lg:mt-[-280px]">
            <CourseSidebar course={course} />
          </aside>
        </div>

        {/* Students also bought - full width below the grid */}
        <StudentsAlsoBought
          categoryId={course.category?.id}
          currentCourseId={course.id}
        />
      </div>

    </main>
  )
}
