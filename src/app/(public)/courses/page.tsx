import { Suspense } from "react"
import { getCourses } from "@/lib/services/course.service"
import { CourseCard } from "@/components/features/courses/course-card"
import { CourseFilters } from "@/components/features/courses/course-filters"
import { CoursePagination } from "@/components/features/courses/course-pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Filter, BookOpen, Users, Award } from "lucide-react"
import Link from "next/link"
import { CourseSort } from "@/components/features/courses/course-sort"

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
      <div className="relative bg-gradient-to-r from-slate-950 via-[#0a0f24] to-slate-950 py-16 md:py-24 text-white overflow-hidden border-b border-indigo-950/60 h-screen">

        {/* Grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25" />

        {/* Glow circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-[100px] opacity-75" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px] opacity-70" />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-72 h-72 bg-purple-500/10 rounded-full blur-[120px] opacity-50" />

        <div className="page-container relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Column: Text + Badge + Quick Search / Tags */}
          <div className="flex-1 text-center lg:text-left space-y-6 max-w-3xl animate-in fade-in slide-in-from-bottom-5 duration-700">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
              🎯 Học tập không giới hạn
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              Khám phá các <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">khóa học tốt nhất</span> cho sự nghiệp
            </h1>
            <p className="text-zinc-300 text-base md:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
              Nâng cao kỹ năng, thực hành thực tế và nhận chứng chỉ quốc tế từ những chuyên gia hàng đầu. Khởi đầu hành trình chinh phục tri thức ngay hôm nay.
            </p>

            {/* Quick tags / topics */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-2 text-sm text-zinc-400">
              <span className="font-medium mr-1 text-zinc-300 text-xs">Xu hướng:</span>
              {["Docker", "React", "Kubernetes", "DevOps", "AI & ML"].map((tag) => (
                <Link
                  key={tag}
                  href={`/courses?keyword=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 hover:border-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 transition-all text-xs text-zinc-300 font-medium"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column: Visual highlights (overlapping glassmorphic cards) */}
          <div className="flex-1 w-full max-w-[480px] lg:max-w-none relative aspect-[4/3] lg:aspect-auto lg:h-[320px] hidden lg:block animate-in fade-in slide-in-from-right-5 duration-700">
            {/* Main illustration card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-48 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl flex flex-col justify-center items-center p-6 text-center transform hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 mb-3 border border-indigo-500/30">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="font-bold text-3xl text-white">50+</span>
              <span className="text-xs text-zinc-300 font-medium mt-1">Khóa học thực chiến</span>
            </div>

            {/* Sub-card 1: Students */}
            <div className="absolute top-[10%] left-[10%] lg:left-[5%] w-48 bg-slate-900/90 backdrop-blur-md rounded-xl border border-white/5 p-4 shadow-xl flex items-center gap-3 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 font-medium">Học viên tích cực</p>
                <p className="font-bold text-sm text-white">1,000+</p>
              </div>
            </div>

            {/* Sub-card 2: Success rate */}
            <div className="absolute bottom-[10%] right-[10%] lg:right-[5%] w-48 bg-slate-900/90 backdrop-blur-md rounded-xl border border-white/5 p-4 shadow-xl flex items-center gap-3 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 font-medium">Chứng chỉ uy tín</p>
                <p className="font-bold text-sm text-white">Learnly Certified</p>
              </div>
            </div>
          </div>
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
        <CourseSort />
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