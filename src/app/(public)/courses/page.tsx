import { Suspense } from "react"
import { getCourses } from "@/lib/services/course.service"
import { CourseCard } from "@/components/features/courses/CourseCard"
import { CourseFilters } from "@/components/features/courses/CourseFilters"
import { CoursePagination } from "@/components/features/courses/CoursePagination"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Danh sách khóa học | EduPlatform",
  description: "Khám phá các khóa học lập trình, kỹ năng mềm từ cơ bản đến nâng cao.",
}

// Chỉnh lại kiểu props cho Next.js App Router (sử dụng async component & searchParams)
interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CoursesPage({ searchParams }: PageProps) {
  // Await searchParams vì nó là Promise trong Next.js 15+
  const resolvedParams = await searchParams

  // Lấy ra các parameter, parse thành string nếu là array
  const params = new URLSearchParams()
  Object.keys(resolvedParams).forEach((key) => {
    const val = resolvedParams[key]
    if (typeof val === "string") {
      params.append(key, val)
    } else if (Array.isArray(val)) {
      params.append(key, val[0])
    }
  })

  // Gọi Suspense nội bộ cho component List
  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Khám phá Khóa học</h1>
          <p className="text-muted-foreground mt-2">
            Tìm kiếm từ hàng ngàn khóa học phù hợp với nhu cầu và năng lực của bạn
          </p>
        </div>

        <CourseFilters />

        {/* Bọc bằng Suspense khi SSR call API bị delay */}
        <Suspense fallback={<CoursesSkeleton />}>
          <CourseList params={params.toString()} />
        </Suspense>
      </div>
    </div>
  )
}

async function CourseList({ params }: { params: string }) {
  // Parse chuỗi params để đưa cho service (nó nhận Record<string, string>)
  const paramObj = Object.fromEntries(new URLSearchParams(params).entries())
  
  let data
  try {
    data = await getCourses(paramObj)
  } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-red-50 dark:bg-red-950/10 text-red-500">
        <p>Lỗi kết nối tới máy chủ: Không thể lấy danh sách khóa học.</p>
        <p className="text-sm mt-2 opacity-80">Vui lòng thử lại sau.</p>
      </div>
    )
  }

  const { content: courses, totalPages, totalElements } = data

  if (!courses || courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
        <p className="text-xl font-medium">Không tìm thấy khóa học nào</p>
        <p className="text-muted-foreground mt-2">Hãy thử đổi từ khóa hoặc bộ lọc khác.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-muted-foreground">
        Hiển thị tổng cộng <span className="font-semibold text-foreground">{totalElements}</span> kết quả
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {totalPages > 1 && <CoursePagination totalPages={totalPages} />}
    </div>
  )
}

function CoursesSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-4 w-32 mb-2" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col h-full overflow-hidden rounded-xl border bg-card">
            <Skeleton className="aspect-video w-full rounded-none" />
            <div className="p-6 flex-1 flex flex-col gap-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-2/3" />
              <div className="mt-auto pt-4 flex justify-between">
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}