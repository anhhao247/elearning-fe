import { Suspense } from "react"
import { getCourses } from "@/lib/services/course.service"
import { CourseCard } from "@/components/features/courses/course-card"
import { CourseFilters } from "@/components/features/courses/course-filters"
import { CoursePagination } from "@/components/features/courses/course-pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"

export const metadata = {
  title: "Danh sách khóa học | Learnly",
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
      val.forEach(v => params.append(key, v))
    }
  })

  // Gọi Suspense nội bộ cho component List
  return (
    <>
      {/* Hero Banner Section */}
      <div className="relative bg-gradient-to-b from-primary/10 via-primary/5 to-transparent section-spacing border-b border-border/50 overflow-hidden">
        {/* Subtle decorative element */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-primary/5 rounded-full blur-3xl opacity-50" />
        
        <div className="page-container relative text-center lg:text-left flex flex-col items-center lg:items-start space-y-5">
          <h1 className="text-hero text-foreground tracking-tight">
            Khám phá các khóa học thú vị
          </h1>
          <p className="text-body text-xl max-w-2xl text-muted-foreground/80 leading-relaxed">
            Nâng cao kỹ năng với hàng ngàn khóa học chất lượng từ các chuyên gia hàng đầu. Khởi đầu hành trình chinh phục tri thức ngay hôm nay.
          </p>
        </div>
      </div>

      <div className="page-container section-spacing">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Trigger */}
          <div className="lg:hidden flex justify-between items-center bg-card p-4 rounded-lg border">
            <span className="font-medium">Bộ lọc khóa học</span>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Lọc
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px] overflow-y-auto">
                <SheetHeader className="mb-4">
                  <SheetTitle>Bộ lọc khóa học</SheetTitle>
                </SheetHeader>
                <CourseFilters />
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-20">
              <CourseFilters />
            </div>
          </aside>

          {/* Main Course List */}
          <div className="flex-1 flex flex-col gap-6 w-full min-w-0">
            {/* Bọc bằng Suspense khi SSR call API bị delay */}
            <Suspense fallback={<CoursesSkeleton />}>
              <CourseList params={params.toString()} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  )
}

async function CourseList({ params }: { params: string }) {
  // Chuyển URLSearchParams string thành object hỗ trợ multi-value
  const searchParams = new URLSearchParams(params)
  const paramObj: Record<string, string | string[]> = {}
  
  searchParams.forEach((value, key) => {
    if (paramObj[key]) {
      if (Array.isArray(paramObj[key])) {
        (paramObj[key] as string[]).push(value)
      } else {
        paramObj[key] = [paramObj[key] as string, value]
      }
    } else {
      paramObj[key] = value
    }
  })
  
  let data
  try {
    data = await getCourses(paramObj)
  } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
    return (
      /* Error state */
      <div className="card-base flex flex-col items-center justify-center p-12 text-center border-destructive/20 bg-destructive/5">
        <p className="font-semibold text-destructive">Lỗi kết nối tới máy chủ</p>
        <p className="text-body mt-2">Không thể lấy danh sách khóa học. Vui lòng thử lại sau.</p>
      </div>
    )
  }

  const { content: courses, totalPages, totalElements } = data

  if (!courses || courses.length === 0) {
    return (
      /* Empty state */
      <div className="card-base flex flex-col items-center justify-center p-16 text-center">
        <p className="font-semibold text-foreground">Không tìm thấy khóa học nào</p>
        <p className="text-body mt-2">Hãy thử đổi từ khóa hoặc bộ lọc khác.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-card p-4 rounded-lg border gap-4">
        <div className="text-sm text-muted-foreground">
          Hiển thị tổng cộng <span className="font-semibold text-foreground">{totalElements}</span> kết quả
        </div>
        
        {/* Placeholder cho Dropdown Sắp xếp giống thiết kế (hiện API đã hỗ trợ param sortBy/sortDir, logic gán param tương tự filter) */}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
      {/* Header skeleton */}
      <div className="h-14 bg-card rounded-xl border animate-pulse" />
      {/* Card skeletons matching CourseCard structure */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="card-base flex flex-col overflow-hidden">
            {/* Thumbnail 16:9 */}
            <Skeleton className="aspect-video w-full rounded-none" />
            <div className="p-4 flex flex-col gap-2">
              {/* Category tag */}
              <Skeleton className="h-3.5 w-20" />
              {/* Title */}
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
              {/* Instructor */}
              <Skeleton className="h-4 w-32" />
              {/* Stars */}
              <Skeleton className="h-4 w-28" />
              {/* Price */}
              <div className="pt-2 border-t border-border/50 mt-1">
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}