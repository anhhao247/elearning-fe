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
      params.append(key, val[0])
    }
  })

  // Gọi Suspense nội bộ cho component List
  return (
    <>
      {/* Hero Banner Section */}
      <div className="bg-primary/5 py-12 md:py-16 border-b border-border">
        <div className="container mx-auto px-4 md:px-6 text-center lg:text-left flex flex-col items-center lg:items-start space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Khám phá các khóa học thú vị
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Nâng cao kỹ năng với hàng ngàn khóa học chất lượng từ các chuyên gia hàng đầu.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8">
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
  // Parse chuỗi params để đưa cho service (nó nhận Record<string, string>)
  const paramObj = Object.fromEntries(new URLSearchParams(params).entries())
  
  let data
  try {
    data = await getCourses(paramObj)
  } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-destructive/5 text-destructive border-destructive/20">
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
      <div className="h-14 bg-card rounded-lg border animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
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